// run-eval.ts — runs the corpus and reports rates per arrangement and scope.
// it checks for overreach too: a case whose known scope is domain-level must
// not produce address-level recognized claims, and vice versa where the
// arrangement cannot support it. domain-only success never counts as
// address-level coverage.

import { analyze } from "../core.js";
import { CORPUS, type CorpusCase } from "./corpus.js";

interface Row {
  case: CorpusCase;
  pass: boolean;
  failures: string[];
  overreach: string[];
}

function runCase(c: CorpusCase): Row {
  const failures: string[] = [];
  const overreach: string[] = [];
  const result = analyze(c.evidence, { now: c.evidence.observed_at });

  const recognized = result.signals.filter((s) => s.strength === "recognized");

  for (const want of c.expectations.expect_signals_any_strength ?? []) {
    if (!result.signals.some((s) => s.name === want)) {
      failures.push(`missing signal: ${want}`);
    }
  }
  for (const want of c.expectations.expect_signals ?? []) {
    if (!recognized.some((s) => s.name === want)) {
      failures.push(`missing recognized signal: ${want}`);
    }
  }
  for (const banned of c.expectations.forbid_signals ?? []) {
    if (result.signals.some((s) => s.name === banned)) {
      failures.push(`forbidden signal present: ${banned}`);
    }
  }
  if (c.expectations.expect_state && result.state !== c.expectations.expect_state) {
    failures.push(`expected state ${c.expectations.expect_state}, got ${result.state}`);
  }
  if (
    c.expectations.expect_limitation &&
    !result.limitations.some((l) => l.includes(c.expectations.expect_limitation!))
  ) {
    failures.push(`missing limitation: ${c.expectations.expect_limitation}`);
  }

  // scope overreach checks
  for (const s of result.signals) {
    if (s.scope === "address" && c.scope === "domain") {
      if (s.name !== "alias_syntax" || !c.evidence.address.includes("+")) {
        overreach.push(`address-scope signal "${s.name}" from domain-level evidence`);
      }
    }
  }
  if (c.id === "custom-domain-porkbun-forwarding" || c.id === "custom-domain-forwarding-service") {
    const addr = recognized.filter((s) => s.scope === "address");
    if (addr.length > 0) overreach.push("forwarding (domain evidence) produced address-level claims");
  }

  return { case: c, pass: failures.length === 0, failures, overreach };
}

const rows = CORPUS.map(runCase);

// report per arrangement
const byArrangement = new Map<string, { total: number; pass: number; unknown: number }>();
for (const r of rows) {
  const key = r.case.arrangement;
  const cur = byArrangement.get(key) ?? { total: 0, pass: 0, unknown: 0 };
  cur.total += 1;
  if (r.pass) cur.pass += 1;
  if (!r.pass) cur.unknown += 1;
  byArrangement.set(key, cur);
}

let failed = 0;
for (const r of rows) {
  if (r.pass && r.overreach.length === 0) {
    console.log(`pass    ${r.case.id}`);
  } else {
    failed += 1;
    console.log(`fail    ${r.case.id}`);
    for (const f of r.failures) console.log(`        ${f}`);
    for (const o of r.overreach) console.log(`        overreach: ${o}`);
  }
}

console.log("");
console.log("per-arrangement and scope summary:");
for (const [arr, s] of byArrangement) {
  console.log(
    `  ${arr}: ${s.pass}/${s.total} pass` +
      (s.unknown > 0 ? `, ${s.unknown} failed` : "")
  );
}
console.log("");
console.log(
  `total: ${rows.length - failed}/${rows.length} cases pass. ` +
    `domain-only cases were not counted as address-level coverage.`
);

if (failed > 0) {
  process.exitCode = 1;
}

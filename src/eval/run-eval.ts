// run-eval.ts — runs the corpus and reports rates per arrangement and scope.
// failure kinds are counted separately: false positives (claims that should
// not have been made), false negatives (expected evidence that was missed),
// wrong states, and missed limitations. unknown-state results are reported
// as their own rate, never folded into the failure count.
//
// overreach is checked generically: on a case whose evidence resolves at
// domain scope, any recognized address-scope signal is overreach, and the
// runner never counts a domain-only pass as address-level coverage.
//
// fixtures vs reality: the fixture corpus and the provider tables were
// written by the same author, so fixture passes prove consistency, not
// real-world accuracy. the contract's main risk — contrasting arrangements
// on the same provider — is only covered by an authorized corpus of real
// addresses. this runner merges data/authorized-corpus.json (gitignored)
// when present and says plainly when it is absent.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { analyze } from "../core.js";
import { CORPUS, type CorpusCase } from "./corpus.js";

interface Row {
  case: CorpusCase;
  result: ReturnType<typeof analyze>;
  pass: boolean;
  falsePositives: string[];
  falseNegatives: string[];
  wrongStates: string[];
  missedLimitations: string[];
  overreach: string[];
}

function runCase(c: CorpusCase): Row {
  const falsePositives: string[] = [];
  const falseNegatives: string[] = [];
  const wrongStates: string[] = [];
  const missedLimitations: string[] = [];
  const overreach: string[] = [];
  const result = analyze(c.evidence, { now: c.evidence.observed_at });

  const recognized = result.signals.filter((s) => s.strength === "recognized");

  for (const want of c.expectations.expect_signals_any_strength ?? []) {
    if (!result.signals.some((s) => s.name === want)) {
      falseNegatives.push(`missing signal: ${want}`);
    }
  }
  for (const want of c.expectations.expect_signals ?? []) {
    if (!recognized.some((s) => s.name === want)) {
      falseNegatives.push(`missing recognized signal: ${want}`);
    }
  }
  for (const banned of c.expectations.forbid_signals ?? []) {
    if (result.signals.some((s) => s.name === banned)) {
      falsePositives.push(`forbidden signal present: ${banned}`);
    }
  }
  if (c.expectations.expect_state && result.state !== c.expectations.expect_state) {
    wrongStates.push(`expected state ${c.expectations.expect_state}, got ${result.state}`);
  }
  if (
    c.expectations.expect_limitation &&
    !result.limitations.some((l) => l.includes(c.expectations.expect_limitation!))
  ) {
    missedLimitations.push(`missing limitation: ${c.expectations.expect_limitation}`);
  }

  // scope overreach, checked generically for every case
  for (const s of result.signals) {
    if (c.scope === "domain" && s.scope === "address") {
      // a raw syntax observation of the address itself is address-true and
      // is not overreach; anything else recognized at address scope from
      // domain-level evidence is.
      if (s.strength === "recognized") {
        overreach.push(`recognized address-scope signal "${s.name}" from domain-level evidence`);
      } else if (s.name !== "alias_syntax" || !c.evidence.address.includes("+")) {
        overreach.push(`address-scope signal "${s.name}" from domain-level evidence`);
      }
    }
  }

  return {
    case: c,
    result,
    pass:
      falsePositives.length === 0 &&
      falseNegatives.length === 0 &&
      wrongStates.length === 0 &&
      missedLimitations.length === 0 &&
      overreach.length === 0,
    falsePositives,
    falseNegatives,
    wrongStates,
    missedLimitations,
    overreach,
  };
}

// optional authorized corpus of real, verified addresses; gitignored so it
// never ships. fixture passes alone must never be read as real accuracy.
const realCorpusPath = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "data", "authorized-corpus.json");
const realCases: CorpusCase[] = [];
if (existsSync(realCorpusPath)) {
  try {
    const parsed = JSON.parse(readFileSync(realCorpusPath, "utf8")) as CorpusCase[];
    if (Array.isArray(parsed)) realCases.push(...parsed);
  } catch (err) {
    console.log(`warning: ${realCorpusPath} is not valid json; ignoring it`);
  }
}
const allCases = [...CORPUS, ...realCases];

const rows = allCases.map(runCase);

// report per case
let failed = 0;
for (const r of rows) {
  if (r.pass) {
    console.log(`pass    ${r.case.id}`);
  } else {
    failed += 1;
    console.log(`fail    ${r.case.id}`);
    for (const f of r.falseNegatives) console.log(`        false negative: ${f}`);
    for (const f of r.falsePositives) console.log(`        false positive: ${f}`);
    for (const f of r.wrongStates) console.log(`        wrong state: ${f}`);
    for (const f of r.missedLimitations) console.log(`        missed limitation: ${f}`);
    for (const o of r.overreach) console.log(`        overreach: ${o}`);
  }
}

// report per arrangement
const byArrangement = new Map<
  string,
  { total: number; pass: number; failed: number; unknownState: number }
>();
for (const r of rows) {
  const key = r.case.arrangement;
  const cur = byArrangement.get(key) ?? { total: 0, pass: 0, failed: 0, unknownState: 0 };
  cur.total += 1;
  if (r.pass) cur.pass += 1;
  else cur.failed += 1;
  if (r.result.state === "unknown") cur.unknownState += 1;
  byArrangement.set(key, cur);
}

console.log("");
console.log("per-arrangement and scope summary:");
for (const [arr, s] of byArrangement) {
  console.log(
    `  ${arr}: ${s.pass}/${s.total} pass` +
      (s.failed > 0 ? `, ${s.failed} failed` : "") +
      (s.unknownState > 0 ? `, ${s.unknownState} unknown-state result(s)` : "")
  );
}

// failure kinds, reported separately as the contract requires
let fp = 0, fn = 0, ws = 0, ml = 0, or = 0;
let unknownState = 0;
for (const r of rows) {
  fp += r.falsePositives.length;
  fn += r.falseNegatives.length;
  ws += r.wrongStates.length;
  ml += r.missedLimitations.length;
  or += r.overreach.length;
  if (r.result.state === "unknown") unknownState += 1;
}
console.log("");
console.log("failure kinds (separate, not folded together):");
console.log(`  false positives (claims that should not exist): ${fp}`);
console.log(`  false negatives (expected evidence missed): ${fn}`);
console.log(`  wrong states: ${ws}`);
console.log(`  missed limitations: ${ml}`);
console.log(`  scope overreach: ${or}`);
console.log(`  unknown-state results: ${unknownState} of ${rows.length} (reported separately; never counted as pass or as failure kinds above)`);

console.log("");
console.log(
  `total: ${rows.length - failed}/${rows.length} cases pass. ` +
    `domain-only cases were not counted as address-level coverage.`
);
if (realCases.length === 0) {
  console.log("");
  console.log(
    "fixture corpus: these cases and the provider tables share an author, " +
      "so passes prove consistency, not real-world accuracy. the " +
      "contract's main risk — contrasting arrangements on the same real " +
      "provider — is only testable with authorized real addresses in " +
      "data/authorized-corpus.json, which is absent."
  );
} else {
  console.log(`corpus: ${CORPUS.length} fixtures + ${realCases.length} authorized real cases`);
}

if (failed > 0) {
  process.exitCode = 1;
}

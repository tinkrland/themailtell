// run-eval.ts — runs the corpus and reports rates per shape and scope.
// failure kinds are counted separately: false positives (claims that
// should not have been made), false negatives (expected evidence that was
// missed), wrong states, wrong shape findings, and missed limitations.
// unknown-state results are reported as their own rate, never folded into
// the failure count.
//
// overreach is checked generically: on a case whose evidence resolves at
// market scope (format rules only), any recognized address- or
// carrier-scope signal is flagged, not a hand-picked list.

import { existsSync, readFileSync } from "node:fs";
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
  wrongFindings: string[];
  missedLimitations: string[];
  overreach: string[];
}

function runCase(c: CorpusCase, now: string, maxAgeDays?: number, stale = false): Row {
  const falsePositives: string[] = [];
  const falseNegatives: string[] = [];
  const wrongStates: string[] = [];
  const wrongFindings: string[] = [];
  const missedLimitations: string[] = [];
  const overreach: string[] = [];
  const expectations = stale && c.stale_expectations ? c.stale_expectations : c.expectations;
  const result = analyze(c.evidence, { now, maxAgeDays });

  const anyStrength = result.signals;
  const recognized = result.signals.filter((s) => s.strength === "recognized");

  for (const want of expectations.expect_signals_any_strength ?? []) {
    if (!anyStrength.some((s) => s.name === want)) {
      falseNegatives.push(`missing signal: ${want}`);
    }
  }
  for (const want of expectations.expect_signals ?? []) {
    if (!recognized.some((s) => s.name === want)) {
      falseNegatives.push(`missing recognized signal: ${want}`);
    }
  }
  for (const banned of expectations.forbid_signals ?? []) {
    if (result.signals.some((s) => s.name === banned)) {
      falsePositives.push(`forbidden signal present: ${banned}`);
    }
  }
  if (expectations.expect_state && result.state !== expectations.expect_state) {
    wrongStates.push(`expected state ${expectations.expect_state}, got ${result.state}`);
  }
  for (const [klass, want] of Object.entries(expectations.expect_shape_findings ?? {})) {
    const got = (result.shape_findings as unknown as Record<string, string>)[klass];
    if (got !== want) {
      wrongFindings.push(`${klass}: expected ${want}, got ${got}`);
    }
  }
  if (
    expectations.expect_limitation &&
    !result.limitations.some((l) => l.includes(expectations.expect_limitation!))
  ) {
    missedLimitations.push(`missing limitation: ${expectations.expect_limitation}`);
  }

  // scope overreach, checked generically for every case
  if (c.scope === "market") {
    for (const s of result.signals) {
      if (s.strength === "recognized" && s.scope !== "market") {
        overreach.push(`recognized ${s.scope}-scope signal "${s.name}" from market-level evidence`);
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
      wrongFindings.length === 0 &&
      missedLimitations.length === 0 &&
      overreach.length === 0,
    falsePositives,
    falseNegatives,
    wrongStates,
    wrongFindings,
    missedLimitations,
    overreach,
  };
}

// optional authorized corpus of real, verified addresses; gitignored so it
// never ships. fixture passes alone must never be read as real accuracy.
const realCorpusPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "data",
  "authorized-corpus.json"
);
const realCases: CorpusCase[] = [];
if (existsSync(realCorpusPath)) {
  try {
    const parsed = JSON.parse(readFileSync(realCorpusPath, "utf8")) as CorpusCase[];
    if (Array.isArray(parsed)) realCases.push(...parsed);
  } catch {
    console.log(`warning: ${realCorpusPath} is not valid json; ignoring it`);
  }
}

// evaluate every case at its own evidence time; cases that declare a
// staleness horizon are additionally evaluated past it
const rows: Row[] = [];
for (const c of [...CORPUS, ...realCases]) {
  rows.push(runCase(c, c.evidence.observed_at));
  if (c.staleAfterDays) {
    const staleNow = new Date(
      Date.parse(c.evidence.observed_at) + (c.staleAfterDays + 90) * 86_400_000
    )
      .toISOString()
      .replace(/\.\d+Z$/, "Z");
    const staleRow = runCase(c, staleNow, undefined, true);
    staleRow.case = { ...c, id: `${c.id} [stale+${c.staleAfterDays}d]` };
    rows.push(staleRow);
  }
}

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
    for (const f of r.wrongFindings) console.log(`        wrong finding: ${f}`);
    for (const f of r.missedLimitations) console.log(`        missed limitation: ${f}`);
    for (const o of r.overreach) console.log(`        overreach: ${o}`);
  }
}

// per shape
const byShape = new Map<string, { total: number; pass: number; failed: number; unknownState: number }>();
for (const r of rows) {
  const key = r.case.shape;
  const cur = byShape.get(key) ?? { total: 0, pass: 0, failed: 0, unknownState: 0 };
  cur.total += 1;
  if (r.pass) cur.pass += 1;
  else cur.failed += 1;
  if (r.result.state === "unknown") cur.unknownState += 1;
  byShape.set(key, cur);
}
console.log("");
console.log("per-shape and scope summary:");
for (const [shape, s] of byShape) {
  console.log(
    `  ${shape}: ${s.pass}/${s.total} pass` +
      (s.failed > 0 ? `, ${s.failed} failed` : "") +
      (s.unknownState > 0 ? `, ${s.unknownState} unknown-state result(s)` : "")
  );
}

// failure kinds, reported separately as the contract requires
let fp = 0, fn = 0, ws = 0, wf = 0, ml = 0, or = 0;
let unknownState = 0;
for (const r of rows) {
  fp += r.falsePositives.length;
  fn += r.falseNegatives.length;
  ws += r.wrongStates.length;
  wf += r.wrongFindings.length;
  ml += r.missedLimitations.length;
  or += r.overreach.length;
  if (r.result.state === "unknown") unknownState += 1;
}
console.log("");
console.log("failure kinds (separate, not folded together):");
console.log(`  false positives (claims that should not exist): ${fp}`);
console.log(`  false negatives (expected evidence missed): ${fn}`);
console.log(`  wrong states: ${ws}`);
console.log(`  wrong shape findings: ${wf}`);
console.log(`  missed limitations: ${ml}`);
console.log(`  scope overreach: ${or}`);
console.log(
  `  unknown-state results: ${unknownState} of ${rows.length} (reported separately; never counted as pass or as failure kinds above)`
);
console.log("");
console.log(
  `total: ${rows.length - failed}/${rows.length} cases pass. ` +
    `"no evidence found" is a statement about the search, never a street-address verdict.`
);
if (realCases.length === 0) {
  console.log("");
  console.log(
    "fixture corpus: these cases and the intelligence tables share an " +
      "author, so passes prove consistency, not real-world accuracy. the " +
      "contract's main risk — a real address that a table row misses or " +
      "over-claims — is only testable with authorized real addresses in " +
      "data/authorized-corpus.json, which is absent."
  );
} else {
  console.log(`corpus: ${CORPUS.length} fixtures + ${realCases.length} authorized real cases`);
}

if (failed > 0) {
  process.exitCode = 1;
}

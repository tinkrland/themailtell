// fixture eval runner: runs every fixture case through analyze and records
// failures by kind. an unknown outcome is not a failure when the expectation
// allows it; the runner never edits a fixture to make a case pass.
//
// this proves consistency only. no accuracy claim may be derived from it.

import { analyze } from "../index.js";
import { FIXTURES, type FixtureCase } from "./corpus.js";
import type { ClassificationResult } from "../schema.js";
import type { CommunityListRow } from "../tables.js";

const COMMUNITY_LIST: CommunityListRow = {
  list: "example-sms-site",
  snapshot_date: "2026-09-01",
  numbers: ["+12125550128"],
  citation: "https://example-sms-site.example",
};

const DEFAULT_NOW = "2026-10-08T00:00:00Z";

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// authorized cases carry ground truth in the corpus author's own words
// (docs/authorized-corpus.md), never in tool vocabulary, so the runner
// derives the mechanical expectation from it here: a stated line type
// must be found; a "reserved" number must produce no line-type claim;
// an "unknown" ground truth expects the honest unknown state.
function loadAuthorized(): { cases: FixtureCase[]; loaded: boolean } {
  const here = dirname(fileURLToPath(import.meta.url));
  const path = join(here, "..", "..", "data", "authorized-corpus.json");
  let raw: any;
  try {
    raw = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return { cases: [], loaded: false };
  }
  const lineTypes = ["mobile", "landline", "fixed_voip", "non_fixed_voip"];
  const cases: FixtureCase[] = [];
  for (const c of raw.cases ?? []) {
    const lt = c.ground_truth?.line_type;
    const expectations: FixtureCase["expectations"] = {};
    if (lineTypes.includes(lt)) {
      expectations.findings = { [lt]: "evidence_found" };
    } else if (lt === "reserved") {
      expectations.forbid_findings = {
        mobile: "evidence_found",
        landline: "evidence_found",
        fixed_voip: "evidence_found",
        non_fixed_voip: "evidence_found",
      };
    } else if (lt === "unknown") {
      expectations.state = "unknown";
    }
    cases.push({
      id: c.id ?? c.number,
      input: c.number,
      carriers: (c.adapter_evidence ?? []).map((a: any) => ({
        source: a.source,
        observed_at: a.observed_at,
        coverage: a.coverage,
        line_type: a.line_type,
      })),
      expectations,
    });
  }
  return { cases, loaded: true };
}

function runCase(c: FixtureCase): { result: ClassificationResult; now: string } {
  const now = c.now ?? DEFAULT_NOW;
  return {
    result: analyze(
      { parse: parseFor(c.input), carriers: c.carriers },
      { now, max_age_days: 90, declared_voip: c.declared_voip ?? null, community_lists: [COMMUNITY_LIST] },
    ),
    now,
  };
}

// the parser is pure and offline; using it here keeps fixtures end-to-end
import { parseInput } from "../input/parser.js";
function parseFor(input: string) {
  return parseInput(input, "2026-10-08T00:00:00Z");
}

type FailureKind =
  | "false_positive"
  | "false_negative"
  | "wrong_state"
  | "wrong_finding"
  | "missed_limitation"
  | "scope_overreach";

interface Failure {
  case: string;
  kind: FailureKind;
  detail: string;
}

const counts = new Map<FailureKind, number>();
const perMarket = new Map<string, { pass: number; fail: number }>();

function fail(case_id: string, kind: FailureKind, detail: string) {
  counts.set(kind, (counts.get(kind) ?? 0) + 1);
  failures.push({ case: case_id, kind, detail });
}
const failures: Failure[] = [];

let passed = 0;
const AUTHORIZED = loadAuthorized();
for (const c of [...FIXTURES, ...AUTHORIZED.cases]) {
  const { result } = runCase(c);
  const e = c.expectations;
  const market = result.market ?? "?";
  const before = failures.length;
  const failHere = (kind: FailureKind, detail: string) => fail(c.id, kind, detail);

  if (e.parse_valid !== undefined && result.parse.valid !== e.parse_valid) {
    failHere("wrong_state", `parse.valid ${result.parse.valid}, expected ${e.parse_valid}`);
  }
  if (e.market !== undefined && result.market !== e.market) {
    failHere("wrong_state", `market ${result.market}, expected ${e.market}`);
  }
  if (e.state !== undefined && result.state !== e.state) {
    failHere("wrong_state", `state ${result.state}, expected ${e.state}`);
  }
  if (e.declared_comparison !== undefined && (result.declared_comparison?.comparison ?? "absent") !== e.declared_comparison) {
    failHere("wrong_state", `declared_comparison ${result.declared_comparison?.comparison ?? "absent"}, expected ${e.declared_comparison}`);
  }
  for (const [shape, want] of Object.entries(e.findings ?? {})) {
    const got = (result.shape_findings as unknown as Record<string, string>)[shape];
    if (got !== want) failHere("false_negative", `${shape} is ${got}, expected ${want}`);
  }
  for (const [shape, banned] of Object.entries(e.forbid_findings ?? {})) {
    const got = (result.shape_findings as unknown as Record<string, string>)[shape];
    if (got === banned) failHere("false_positive", `${shape} is ${got}, forbidden`);
  }
  for (const want of e.signals ?? []) {
    const sig = result.signals.find((s) => s.name === want.name);
    if (!sig) failHere("false_negative", `missing signal ${want.name}`);
    else if (want.strength && sig.strength !== want.strength) {
      failHere("wrong_finding", `${want.name} strength ${sig.strength}, expected ${want.strength}`);
    }
  }
  for (const banned of e.forbid_signals ?? []) {
    if (result.signals.some((s) => s.name === banned)) {
      failHere("false_positive", `forbidden signal ${banned} present`);
    }
  }
  for (const code of e.limitations ?? []) {
    if (!result.limitations.some((l) => l.code === code)) {
      failHere("missed_limitation", `expected limitation ${code}`);
    }
  }
  // scope overreach: a signal must never claim more than its scope
  for (const s of result.signals) {
    if (s.name === "numbering_plan_range" && s.scope !== "range") {
      failHere("scope_overreach", "numbering plan signal outside range scope");
    }
    if (s.name === "carrier_line_type" && s.scope !== "adapter") {
      failHere("scope_overreach", "carrier signal outside adapter scope");
    }
  }

  const m = perMarket.get(market) ?? { pass: 0, fail: 0 };
  if (failures.length === before) { passed++; m.pass++; } else { m.fail++; }
  perMarket.set(market, m);
}

console.log(`total: ${passed}/${FIXTURES.length + AUTHORIZED.cases.length} cases pass. unknown is first-class: absence of evidence is a statement about the search, never a line-type verdict.`);
console.log(`corpus: ${FIXTURES.length} fixtures + ${AUTHORIZED.cases.length} authorized cases`);
if (counts.size === 0) {
  console.log("failure kinds: none.");
} else {
  console.log("failure kinds:");
  for (const [kind, n] of counts) console.log(`  ${kind}: ${n}`);
  for (const f of failures) console.log(`  case ${f.case} (${f.kind}): ${f.detail}`);
}
console.log("per-market pass/fail:");
const rows = [...perMarket.entries()].sort();
for (const [m, { pass, fail }] of rows) console.log(`  ${m}: ${pass}/${pass + fail}`);
console.log(
  "\nfixture passes prove consistency only; accuracy claims require the " +
  "authorized corpus (docs/authorized-corpus.md)."
);
if (counts.size > 0) process.exitCode = 1;

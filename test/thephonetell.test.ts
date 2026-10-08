import test from "node:test";
import assert from "node:assert/strict";
import { analyze, parseInput, type Evidence } from "../src/index.js";
import type { ParseEvidence, CarrierEvidence } from "../src/tables.js";

const NOW = "2026-10-08T00:00:00Z";
const OPTS = { now: NOW, max_age_days: 90 };

function evidence(input: string, parse?: Partial<ParseEvidence>, carriers: CarrierEvidence[] = []): Evidence {
  const base = parseInput(input, NOW);
  return { parse: { ...base, ...parse } as ParseEvidence, carriers };
}

test("results carry the schema version and the input verbatim", () => {
  const raw = "  +44 7400 900123  ";
  const r = analyze(evidence(raw), OPTS);
  assert.equal(r.schema_version, "1.0.0");
  assert.equal(r.input, raw); // never rewritten
  assert.ok(r.evaluated_number!.startsWith("+44"));
});

test("a gb mobile range produces a mobile finding from an unverified seed row", () => {
  const r = analyze(evidence("+447400900123"), OPTS);
  assert.equal(r.shape_findings.mobile, "evidence_found");
  const s = r.signals.find((x) => x.name === "numbering_plan_range");
  assert.equal(s!.strength, "suggestive", "unverified row, honest strength");
  assert.equal(r.state, "mixed_evidence");
});

test("gb 056 (ofcom, verified) is a recognized virtual-number range", () => {
  const r = analyze(evidence("+445612345678"), OPTS);
  const s = r.signals.find((x) => x.name === "numbering_plan_range");
  assert.equal(s!.strength, "recognized");
  assert.ok(s!.citation!.includes("ofcom"));
  assert.equal(r.shape_findings.virtual_number, "evidence_found");
  assert.equal(r.state, "signals_present");
});

test("de 032 (bnetza, verified) and nl 085 (acm, verified) are recognized virtual ranges", () => {
  for (const [n, cite] of [
    ["+493212345678", "bundesnetzagentur"],
    ["+31851234567", "acm.nl"],
  ] as const) {
    const r = analyze(evidence(n), OPTS);
    const sg = r.signals.find((x) => x.name === "numbering_plan_range");
    assert.equal(sg!.strength, "recognized", n);
    assert.ok(sg!.citation!.includes(cite), n);
    assert.equal(r.shape_findings.virtual_number, "evidence_found", n);
  }
});

test("ie 076 is a withdrawn range: it decays and never asserts voip", () => {
  const r = analyze(evidence("+353761234567"), OPTS);
  const s = r.signals.find((x) => x.name === "numbering_plan_range");
  assert.equal(s!.strength, "unresolved");
  assert.equal(s!.withdrawn_on, "2022-01");
  assert.equal(r.shape_findings.virtual_number, "unknown");
  assert.ok(r.limitations.some((l) => l.code === "withdrawn_range"));
});

test("nanp markets encode no line type: us/ca findings stay unknown without an adapter", () => {
  for (const n of ["+12125550123", "+14165550123"]) {
    const r = analyze(evidence(n), OPTS);
    assert.equal(r.shape_findings.mobile, "unknown", n);
    assert.equal(r.shape_findings.landline, "unknown", n);
    assert.equal(r.state, "unknown", n);
    assert.ok(r.limitations.some((l) => l.code === "numbering_plan"), n);
  }
});

test("invalid inputs get honest reasons and unknown everywhere else", () => {
  const r = analyze(evidence("+44123"), OPTS);
  assert.equal(r.parse.valid, false);
  assert.ok(r.parse.reason!.length > 5);
  assert.equal(r.shape_findings.format_validity, "evidence_found");
  assert.equal(r.state, "unknown");
  assert.deepEqual(r.signals, []);
});

test("adapter coverage none leaves findings unknown, never clean", () => {
  const carriers: CarrierEvidence[] = [
    { source: "twilio lookup", observed_at: NOW, coverage: "none", line_type: null },
  ];
  const r = analyze(evidence("+12125550123", {}, carriers), OPTS);
  assert.equal(r.shape_findings.mobile, "unknown");
  assert.equal(r.shape_findings.landline, "unknown");
  assert.ok(r.limitations.some((l) => l.code === "carrier_coverage"));
});

test("fixed voip and non-fixed voip are distinct signals", () => {
  const fixed: CarrierEvidence[] = [
    { source: "twilio lookup", observed_at: NOW, coverage: "full", line_type: "fixed_voip" },
  ];
  const r = analyze(evidence("+12125550123", {}, fixed), OPTS);
  assert.equal(r.shape_findings.fixed_voip, "evidence_found");
  assert.equal(r.shape_findings.non_fixed_voip, "no_evidence_found");
  assert.equal(r.shape_findings.virtual_number, "no_evidence_found");

  const nonFixed: CarrierEvidence[] = [
    { source: "twilio lookup", observed_at: NOW, coverage: "full", line_type: "non_fixed_voip" },
  ];
  const r2 = analyze(evidence("+12125550123", {}, nonFixed), OPTS);
  assert.equal(r2.shape_findings.non_fixed_voip, "evidence_found");
  assert.equal(r2.shape_findings.fixed_voip, "no_evidence_found");
  assert.equal(r2.shape_findings.virtual_number, "evidence_found");
});

test("a ported number is reported contradictory, never silently resolved", () => {
  // gb 07 mobile range, adapter says the number was ported to a landline
  const carriers: CarrierEvidence[] = [
    { source: "twilio lookup", observed_at: NOW, coverage: "full", line_type: "landline", ported: true },
  ];
  const r = analyze(evidence("+447400900123", {}, carriers), OPTS);
  assert.equal(r.state, "contradictory");
  assert.ok(r.limitations.some((l) => l.code === "contradictory_line_type"));
});

test("a landline range with a fixed voip adapter result is not a contradiction", () => {
  const carriers: CarrierEvidence[] = [
    { source: "twilio lookup", observed_at: NOW, coverage: "full", line_type: "fixed_voip" },
  ];
  const r = analyze(evidence("+442071234567", {}, carriers), OPTS);
  assert.equal(r.state, "signals_present");
});

test("declared voip comparison: agree, disagree, unknown", () => {
  // agree: gb 056 virtual evidence and declared voip true
  const agree = analyze(evidence("+445612345678"), { ...OPTS, declared_voip: true });
  assert.equal(agree.declared_comparison!.comparison, "agree");
  // disagree: same number, declared voip false
  const disagree = analyze(evidence("+445612345678"), { ...OPTS, declared_voip: false });
  assert.equal(disagree.declared_comparison!.comparison, "disagree");
  // unknown: us number with no adapter, unknown virtual finding
  const unknown = analyze(evidence("+12125550123"), { ...OPTS, declared_voip: true });
  assert.equal(unknown.declared_comparison!.comparison, "unknown");
});

test("staleness: a verified row older than max age downgrades to unresolved", () => {
  const r = analyze(evidence("+445612345678"), { now: "2027-10-08T00:00:00Z", max_age_days: 90 });
  const s = r.signals.find((x) => x.name === "numbering_plan_range");
  assert.equal(s!.strength, "unresolved");
});

test("community list match is suggestive; a stale snapshot downgrades", () => {
  const list = {
    list: "example-sms-site",
    snapshot_date: "2026-09-01",
    numbers: ["+12125550123"],
    citation: "https://example-sms-site.example",
  };
  const fresh = analyze(evidence("+12125550123"), { ...OPTS, community_lists: [list] });
  assert.equal(fresh.shape_findings.virtual_number, "evidence_found");
  const s = fresh.signals.find((x) => x.name === "community_list");
  assert.equal(s!.strength, "suggestive");
  const stale = analyze(evidence("+12125550123"), {
    now: "2027-09-01T00:00:00Z",
    max_age_days: 90,
    community_lists: [list],
  });
  const s2 = stale.signals.find((x) => x.name === "community_list");
  assert.equal(s2!.strength, "unresolved");
});

test("no evidence found carries the honest limitation, never a verdict", () => {
  const r = analyze(evidence("+353851234567"), OPTS); // ie mobile seed row exists
  const r2 = analyze(evidence("+61851234567"), OPTS); // au 08 landline seed
  for (const x of [r, r2]) {
    assert.notEqual(x.state, "signals_present");
  }
  const r3 = analyze(evidence("+59821234567"), OPTS); // uy: unseeded market
  assert.equal(r3.state, "unknown");
  assert.ok(r3.limitations.some((l) => l.code === "numbering_plan"));
});

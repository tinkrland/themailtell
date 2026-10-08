// fixture eval corpus. these are synthetic, assembled shapes that prove
// the component's own consistency: contrast pairs (same market, different
// shapes), adapter coverage semantics, withdrawal decay, declared
// comparisons and honest unknowns. fixture passes prove consistency only;
// they are not a measurement against real traffic, and no accuracy claim
// may be made from them. accuracy claims require the authorized corpus
// (docs/authorized-corpus.md).

import type { CarrierEvidence } from "../tables.js";

const NOW = "2026-10-08T00:00:00Z";

function carrier(line_type: CarrierEvidence["line_type"], coverage: "full" | "partial" | "none" = "full", extra: Partial<CarrierEvidence> = {}): CarrierEvidence {
  return { source: "fixture adapter", observed_at: NOW, coverage, line_type, ...extra };
}

export interface FixtureCase {
  id: string;
  input: string;
  carriers: CarrierEvidence[];
  declared_voip?: boolean | null;
  expectations: {
    state?: string;
    findings?: Record<string, string>;
    forbid_findings?: Record<string, string>;
    signals?: Array<{ name: string; strength?: string }>;
    forbid_signals?: string[];
    limitations?: string[];
    declared_comparison?: string;
    market?: string | null;
    parse_valid?: boolean;
  };
}

export const FIXTURES: FixtureCase[] = [
  // ---- contrast pairs: numbering plan, same market ----
  {
    id: "gb-07-mobile-vs-shape",
    input: "+447400900123",
    carriers: [],
    expectations: {
      state: "mixed_evidence",
      findings: { mobile: "evidence_found" },
      forbid_findings: { landline: "evidence_found", virtual_number: "evidence_found" },
      signals: [{ name: "numbering_plan_range", strength: "suggestive" }],
      market: "gb",
    },
  },
  {
    id: "gb-01x-landline-shape",
    input: "+442079460958",
    carriers: [],
    expectations: {
      state: "mixed_evidence",
      findings: { landline: "evidence_found" },
      forbid_findings: { mobile: "evidence_found", virtual_number: "evidence_found" },
      market: "gb",
    },
  },
  {
    id: "gb-056-virtual-vs-landline",
    input: "+445612345678",
    carriers: [],
    expectations: {
      state: "signals_present",
      findings: { virtual_number: "evidence_found" },
      forbid_findings: { mobile: "evidence_found", landline: "evidence_found" },
      signals: [{ name: "numbering_plan_range", strength: "recognized" }],
    },
  },
  {
    id: "de-032-virtual-vs-017-mobile",
    input: "+493212345678",
    carriers: [],
    expectations: {
      state: "signals_present",
      findings: { virtual_number: "evidence_found" },
      forbid_findings: { mobile: "evidence_found", landline: "evidence_found" },
    },
  },
  {
    id: "de-017-mobile-shape",
    input: "+4915123456789",
    carriers: [],
    expectations: {
      state: "mixed_evidence",
      findings: { mobile: "evidence_found" },
      forbid_findings: { virtual_number: "evidence_found" },
    },
  },
  {
    id: "nl-085-virtual-vs-06-mobile",
    input: "+31851234567",
    carriers: [],
    expectations: {
      state: "signals_present",
      findings: { virtual_number: "evidence_found" },
      forbid_findings: { mobile: "evidence_found" },
    },
  },
  {
    id: "nl-06-mobile-shape",
    input: "+31612345678",
    carriers: [],
    expectations: {
      state: "mixed_evidence",
      findings: { mobile: "evidence_found" },
      forbid_findings: { virtual_number: "evidence_found" },
    },
  },

  // ---- contrast pairs: adapter line type, same national range ----
  {
    id: "us-mobile-adapter",
    input: "+12125550123",
    carriers: [carrier("mobile")],
    expectations: {
      state: "signals_present",
      findings: { mobile: "evidence_found", landline: "no_evidence_found", virtual_number: "no_evidence_found" },
      market: "us",
    },
  },
  {
    id: "us-nonfixed-voip-same-range",
    input: "+12125550124",
    carriers: [carrier("non_fixed_voip")],
    expectations: {
      state: "signals_present",
      findings: { non_fixed_voip: "evidence_found", mobile: "no_evidence_found", virtual_number: "evidence_found" },
    },
  },
  {
    id: "us-coverage-none-never-clean",
    input: "+12125550125",
    carriers: [carrier(null, "none")],
    expectations: {
      state: "unknown",
      findings: { mobile: "unknown", landline: "unknown", virtual_number: "unknown" },
      forbid_findings: { mobile: "no_evidence_found", landline: "no_evidence_found" },
      limitations: ["carrier_coverage"],
    },
  },
  {
    id: "us-no-adapter-nanp-honesty",
    input: "+12125550126",
    carriers: [],
    expectations: {
      state: "unknown",
      findings: { mobile: "unknown", landline: "unknown" },
      limitations: ["numbering_plan"],
    },
  },
  {
    id: "ca-no-adapter-nanp-honesty",
    input: "+14165550123",
    carriers: [],
    expectations: {
      state: "unknown",
      limitations: ["numbering_plan"],
    },
  },

  // ---- fixed voip vs landline: distinct, never one blob ----
  {
    id: "fixed-voip-cable-voice",
    input: "+18005551234",
    carriers: [carrier("fixed_voip")],
    expectations: {
      state: "signals_present",
      findings: { fixed_voip: "evidence_found", non_fixed_voip: "no_evidence_found" },
      forbid_findings: { virtual_number: "evidence_found" },
    },
  },
  {
    id: "landline-same-range-contrast",
    input: "+18005551235",
    carriers: [carrier("landline")],
    expectations: {
      state: "signals_present",
      findings: { landline: "evidence_found", fixed_voip: "no_evidence_found" },
    },
  },

  // ---- withdrawal decay ----
  {
    id: "ie-076-withdrawn-never-asserts",
    input: "+353761234567",
    carriers: [],
    expectations: {
      state: "unknown",
      findings: { virtual_number: "unknown" },
      forbid_findings: { virtual_number: "evidence_found" },
      signals: [{ name: "numbering_plan_range", strength: "unresolved" }],
      limitations: ["withdrawn_range"],
    },
  },
  {
    id: "ie-085-mobile-contrast",
    input: "+353851234567",
    carriers: [],
    expectations: {
      state: "mixed_evidence",
      findings: { mobile: "evidence_found" },
      forbid_findings: { virtual_number: "evidence_found" },
    },
  },

  // ---- ported number: contradiction reported, never resolved ----
  {
    id: "gb-ported-mobile-to-landline",
    input: "+447400900123",
    carriers: [carrier("landline", "full", { ported: true })],
    expectations: {
      state: "contradictory",
      limitations: ["contradictory_line_type"],
      signals: [{ name: "carrier_line_type", strength: "recognized" }],
    },
  },

  // ---- declared voip comparison ----
  {
    id: "declared-voip-agree",
    input: "+445612345678",
    carriers: [],
    declared_voip: true,
    expectations: { declared_comparison: "agree" },
  },
  {
    id: "declared-voip-disagree",
    input: "+445612345678",
    carriers: [],
    declared_voip: false,
    expectations: { declared_comparison: "disagree" },
  },
  {
    id: "declared-voip-unknown-never-silent",
    input: "+12125550127",
    carriers: [],
    declared_voip: true,
    expectations: { declared_comparison: "unknown" },
  },

  // ---- invalid inputs: honest reasons ----
  {
    id: "invalid-too-short",
    input: "+44123",
    carriers: [],
    expectations: {
      state: "unknown",
      parse_valid: false,
      findings: { format_validity: "evidence_found", mobile: "unknown" },
      forbid_signals: ["numbering_plan_range"],
    },
  },
  {
    id: "invalid-garbage",
    input: "hello",
    carriers: [],
    expectations: {
      state: "unknown",
      parse_valid: false,
      findings: { format_validity: "evidence_found" },
    },
  },
  {
    id: "valid-no-format-problem",
    input: "+61412345678",
    carriers: [],
    expectations: {
      findings: { format_validity: "no_evidence_found", mobile: "evidence_found" },
      market: "au",
    },
  },

  // ---- honest gaps ----
  {
    id: "mx-shared-areacode-honesty",
    input: "+525512345678",
    carriers: [],
    expectations: {
      state: "unknown",
      findings: { mobile: "unknown", landline: "unknown" },
      limitations: ["numbering_plan"],
    },
  },
  {
    id: "unseeded-market-uy",
    input: "+59821234567",
    carriers: [],
    expectations: {
      state: "unknown",
      limitations: ["numbering_plan"],
    },
  },
  {
    id: "community-list-snapshot",
    input: "+12125550128",
    carriers: [],
    expectations: {
      findings: { virtual_number: "evidence_found" },
      signals: [{ name: "community_list", strength: "suggestive" }],
    },
  },
  {
    id: "staleness-decay-of-verified-row",
    input: "+445612345678",
    carriers: [],
    expectations: {
      findings: { virtual_number: "unknown" },
      forbid_findings: { virtual_number: "evidence_found" },
      signals: [{ name: "numbering_plan_range", strength: "unresolved" }],
    },
    // evaluated with now far past the verification date: see run-eval
  },
];

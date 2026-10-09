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
  // the evaluation instant for this case, when it differs from the default.
  // harness metadata: it says when staleness math must run, never what the
  // result should be
  now?: string;
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
  {
    id: "us-veriphone-landline-google",
    // case: us live-recorded    shape: "us live-recorded: veriphone confirms google's mountain view switchboard as a landline on verizon, but performs no in-service check",
    carriers: [
      carrier("landline", "full", {
        source: "recorded live response: veriphone.io v2 verify, lookup 2026-10-09 (data/recorded/veriphone-16502530000.json)",
        observed_at: "2026-10-09T11:25:33.999Z",
        carrier_name: "Verizon",
        active: null,
        detail:
          "veriphone reports phone_type fixed_line, carrier Verizon, phone_valid true; no in-service (hlr) check was performed, so line existence is untouched",
      }),
    ],
    input: "+16502530000",
    expectations: {
      findings: { landline: "evidence_found", line_existence: "unknown" },
      limitations: ["existence_not_checked"],
    },
  },
  {
    id: "gb-veriphone-fixed-line-british-library",
    // case: gb live-recorded    shape: "gb live-recorded: veriphone confirms the british library switchboard as a fixed line; the carrier field is empty, which is an absence, never a carrier called nothing",
    carriers: [
      carrier("landline", "full", {
        source: "recorded live response: veriphone.io v2 verify, lookup 2026-10-09 (data/recorded/veriphone-442079304832.json)",
        observed_at: "2026-10-09T11:25:34.218Z",
        carrier_name: null,
        active: null,
        detail:
          "veriphone reports phone_type fixed_line, phone_valid true, and no carrier name; no in-service (hlr) check was performed, so line existence is untouched",
      }),
    ],
    input: "+442079304832",
    expectations: {
      findings: { landline: "evidence_found", line_existence: "unknown" },
      limitations: ["existence_not_checked"],
    },
  },
  {
    id: "us-veriphone-toll-free-not-guessed",
    // case: us live-recorded    shape: "us live-recorded: veriphone reports toll_free, a type the schema cannot express; every line-type finding stays unknown rather than being guessed into a class",
    carriers: [
      carrier(null, "full", {
        source: "recorded live response: veriphone.io v2 verify, lookup 2026-10-09 (data/recorded/veriphone-18004633339.json)",
        observed_at: "2026-10-09T11:25:34.444Z",
        carrier_name: null,
        active: null,
        detail:
          "veriphone reports phone_type toll_free, phone_valid true; toll free is not a line type the schema expresses, so no line-type claim is made; no in-service (hlr) check was performed",
      }),
    ],
    input: "+18004633339",
    expectations: {
      findings: { mobile: "unknown", landline: "unknown", non_fixed_voip: "unknown", line_existence: "unknown" },
      limitations: ["existence_not_checked"],
    },
  },
  {
    id: "us-veriphone-invalid-555",
    // case: us live-recorded    shape: "us live-recorded: veriphone says phone_valid false for a 555 number, a format-level claim; the local parser is stricter and already rejects it as unassigned, and existence stays unknown either way",
    carriers: [
      carrier(null, "full", {
        source: "recorded live response: veriphone.io v2 verify, lookup 2026-10-09 (data/recorded/veriphone-15551234567.json)",
        observed_at: "2026-10-09T11:25:34.660Z",
        carrier_name: null,
        active: null,
        detail:
          "veriphone reports phone_valid false (phone_type unknown): a format-level claim, never an in-service claim",
      }),
    ],
    input: "+15551234567",
    expectations: {
      findings: { format_validity: "evidence_found", line_existence: "unknown" },
    },
  },
  {
    id: "us-hlr-inactive",
    input: "+12125550128",
    carriers: [carrier("non_fixed_voip", "full", { not_in_service: true, active: null })],
    expectations: {
      findings: { line_existence: "disconfirmed" },
    },
  },
  {
    id: "gb-hlr-active",
    input: "+447400123456",
    carriers: [carrier("mobile", "full", { active: true })],
    expectations: {
      findings: { line_existence: "confirmed_active", mobile: "evidence_found" },
    },
  },
  {
    id: "us-hlr-stale",
    input: "+12125550128",
    carriers: [
      carrier("non_fixed_voip", "full", {
        active: true,
        observed_at: "2025-01-01T00:00:00Z",
      }),
    ],
    expectations: {
      findings: { line_existence: "unknown" },
      limitations: ["existence_evidence_stale"],
    },
  },
  // ---- contrast pairs: numbering plan, same market ----
  {
    id: "gb-07-mobile-vs-shape",
    input: "+447400900123",
    carriers: [],
    expectations: {
      // the gb rows are verified against ofcom's numbering data page now,
      // so this is recognized evidence, not a suggestive seed
      state: "signals_present",
      findings: { mobile: "evidence_found" },
      forbid_findings: { landline: "evidence_found", virtual_number: "evidence_found" },
      signals: [{ name: "numbering_plan_range", strength: "recognized" }],
      market: "gb",
    },
  },
  {
    id: "gb-01x-landline-shape",
    input: "+442079460958",
    carriers: [],
    expectations: {
      state: "signals_present",
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
    now: "2027-10-08T00:00:00Z",
    expectations: {
      findings: { virtual_number: "unknown" },
      forbid_findings: { virtual_number: "evidence_found" },
      signals: [{ name: "numbering_plan_range", strength: "unresolved" }],
    },
  },

  // ---- stale community-list evidence stays visible but never asserts ----
  {
    id: "stale-community-list-never-asserts",
    input: "+12125550128",
    carriers: [],
    now: "2027-10-08T00:00:00Z",
    expectations: {
      // the snapshot (2026-09-01) is more than a year old at this instant:
      // the signal stays at unresolved strength with its stale detail, and
      // virtual_number must not flip to evidence_found
      state: "unknown",
      findings: { virtual_number: "unknown" },
      forbid_findings: { virtual_number: "evidence_found" },
      signals: [{ name: "community_list", strength: "unresolved" }],
      limitations: ["stale_virtual_evidence"],
    },
  },

  // ---- gb 07x split: 070 personal vs 079 mobile, 076 radiopaging ----
  {
    id: "gb-070-personal-number",
    input: "+447090123456",
    carriers: [],
    expectations: {
      // 070 is ofcom's personal numbering range (call-forwarding
      // services), not a mobile range: virtual-style, never mobile
      state: "signals_present",
      findings: { virtual_number: "evidence_found" },
      forbid_findings: { mobile: "evidence_found", landline: "evidence_found" },
      market: "gb",
    },
  },
  {
    id: "gb-079-mobile-contrast",
    input: "+447979123456",
    carriers: [],
    expectations: {
      // the contrast pair: 079 is a mobile services range per ofcom
      state: "signals_present",
      findings: { mobile: "evidence_found" },
      forbid_findings: { virtual_number: "evidence_found" },
      market: "gb",
    },
  },
  {
    id: "gb-076-radiopaging-not-withdrawn",
    input: "+447601234567",
    carriers: [],
    expectations: {
      // 076 is ofcom's radiopaging range and is still allocated: it is
      // neither mobile nor landline, and unlike ireland's 076 it carries
      // no withdrawal
      state: "signals_present",
      findings: { virtual_number: "evidence_found" },
      forbid_findings: { mobile: "evidence_found", landline: "evidence_found" },
      signals: [{ name: "numbering_plan_range", strength: "recognized" }],
      market: "gb",
    },
  },
  // (the 07624 isle of man allocation inside the 076 radiopaging range is
  // covered in the unit tests: libphonenumber assigns 07624 numbers to the
  // im market, so through the default parser they land in the unseeded im
  // market rather than the gb tables, and a corpus case cannot express it)

  // ---- gb derived rows: 0808, 03xx, 055, 09xx ----
  {
    id: "gb-0808-freephone",
    input: "+448088012345",
    carriers: [],
    expectations: {
      // 0808 freephone was invisible when only 0800 had a row
      state: "signals_present",
      forbid_findings: { mobile: "evidence_found", landline: "evidence_found", virtual_number: "evidence_found" },
      signals: [{ name: "numbering_plan_range", strength: "recognized" }],
      market: "gb",
    },
  },
  {
    id: "gb-03-ngn",
    input: "+443331231234",
    carriers: [],
    expectations: {
      state: "signals_present",
      forbid_findings: { mobile: "evidence_found", landline: "evidence_found", virtual_number: "evidence_found" },
      market: "gb",
    },
  },
  {
    id: "gb-055-corporate",
    input: "+445512345678",
    carriers: [],
    expectations: {
      state: "signals_present",
      findings: { virtual_number: "evidence_found" },
      forbid_findings: { mobile: "evidence_found", landline: "evidence_found" },
      market: "gb",
    },
  },
  {
    id: "gb-090-premium",
    input: "+449012345678",
    carriers: [],
    expectations: {
      state: "signals_present",
      forbid_findings: { mobile: "evidence_found", landline: "evidence_found", virtual_number: "evidence_found" },
      market: "gb",
    },
  },

  // ---- extension exclusion is reported, never silent ----
  {
    id: "extension-excluded-noted",
    input: "+44 7400 900123 ext. 4567",
    carriers: [],
    expectations: {
      state: "signals_present",
      findings: { mobile: "evidence_found" },
      limitations: ["extension_excluded"],
      parse_valid: true,
      market: "gb",
    },
  },
];

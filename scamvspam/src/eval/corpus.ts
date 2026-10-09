import type {
  Artifact,
  AxisFinding,
  Limitation,
  Quadrant,
  Signal,
} from "../schema.js";

export const T0 = "2026-10-09T00:00:00.000Z";
const FRESH = "2026-09-01T00:00:00.000Z";
const STALE = "2025-01-01T00:00:00.000Z";

export interface FixtureCase {
  id: string;
  shape: string;
  artifact: Artifact;
  signals: Signal[];
  expectations: {
    spam?: AxisFinding;
    scam?: AxisFinding;
    quadrant?: Quadrant;
    limitations?: string[];
  };
  now?: string;
}

export const FIXTURES: FixtureCase[] = [
  {
    id: "spearphish-targeted",
    shape: "email a lookalike bank domain with a reply-to mismatch, sent to one person: scam evidence, no bulk evidence. a spearphish is scam and not spam",
    artifact: { channel: "email", summary: "lookalike bank domain, reply-to mismatch, single recipient" },
    signals: [
      { name: "homoglyph_domain", channel: "email", axis: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "the from domain substitutes a unicode lookalike character" },
      { name: "reply_to_mismatch", channel: "email", axis: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "reply-to domain differs from the from domain" },
      { name: "bulk_campaign_search", channel: "email", axis: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no campaign or bulk-sender evidence found for this artifact", nothing_found: true },
    ],
    expectations: { spam: "no_evidence_found", scam: "evidence_found", quadrant: "scam_not_spam" },
  },
  {
    id: "newsletter-list-acquired",
    shape: "email an honest bulk newsletter on a list-acquired address: bulk and consent evidence, no deception evidence. spam without scam",
    artifact: { channel: "email", summary: "marketing blast to a purchased-list address, consistent sender identity" },
    signals: [
      { name: "bulk_sender", channel: "email", axis: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "identical campaign across many recipients" },
      { name: "list_acquired_address", channel: "email", axis: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "the address appears on an acquired list without consent trail" },
      { name: "deception_pattern_search", channel: "email", axis: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no lookalike, mismatch, or fraud-script patterns found", nothing_found: true },
    ],
    expectations: { spam: "evidence_found", scam: "no_evidence_found", quadrant: "spam_not_scam" },
  },
  {
    id: "phish-blast",
    shape: "email a phishing campaign blasted to a purchased list: both axes. volume and deception do not imply each other, but they can co-occur",
    artifact: { channel: "email", summary: "credential-harvest blast on a purchased list" },
    signals: [
      { name: "homoglyph_domain", channel: "email", axis: "scam", strength: "verified", coverage: "full", observed_at: FRESH, detail: "the from domain substitutes a unicode lookalike character" },
      { name: "bulk_sender", channel: "email", axis: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "identical campaign across many recipients" },
    ],
    expectations: { spam: "evidence_found", scam: "evidence_found", quadrant: "scam_and_spam" },
  },
  {
    id: "transactional-searched",
    shape: "email a receipt from a known sender, both axes searched and nothing found: neither, with the caveat that neither is about this search",
    artifact: { channel: "email", summary: "order receipt from a known sender, consistent domains" },
    signals: [
      { name: "bulk_campaign_search", channel: "email", axis: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no campaign or bulk-sender evidence found", nothing_found: true },
      { name: "deception_pattern_search", channel: "email", axis: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no fraud patterns found", nothing_found: true },
    ],
    expectations: { spam: "no_evidence_found", scam: "no_evidence_found", quadrant: "neither", limitations: ["neither_is_about_this_search"] },
  },
  {
    id: "nothing-provided",
    shape: "no evidence at all: both axes unknown, unplaced. absence of evidence is never a clean bill of health",
    artifact: { channel: "phone", summary: "a number with no lookups performed" },
    signals: [],
    expectations: { spam: "unknown", scam: "unknown", quadrant: "unplaced", limitations: ["no_evidence_provided"] },
  },
  {
    id: "stale-blast",
    shape: "signals from january 2025: old evidence decays to silence, both axes unknown, unplaced",
    artifact: { channel: "phone", summary: "a number with only year-old campaign evidence" },
    signals: [
      { name: "bulk_sender", channel: "phone", axis: "spam", strength: "recognized", coverage: "full", observed_at: STALE, detail: "an old bulk-campaign record" },
      { name: "spoofed_caller_id", channel: "phone", axis: "scam", strength: "recognized", coverage: "full", observed_at: STALE, detail: "an old spoofing report" },
    ],
    expectations: { spam: "unknown", scam: "unknown", quadrant: "unplaced", limitations: ["stale_intelligence"] },
  },
  {
    id: "parcel-locker-shape-only",
    shape: "address a freight forwarder shape with no axis evidence: the shape is recorded, infrastructure is not intent, nothing moves",
    artifact: { channel: "address", summary: "parcel locker address on a reshipping route" },
    signals: [
      { name: "freight_forwarder_shape", channel: "address", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "the address matches a known freight-forwarder facility pattern" },
    ],
    expectations: { spam: "unknown", scam: "unknown", quadrant: "unplaced", limitations: ["infrastructure_is_not_intent"] },
  },
  {
    id: "wangiri-missed-call",
    shape: "phone a one-ring missed call to a premium-rate destination range: scam evidence on the plan, no bulk evidence. wangiri is scam and not spam",
    artifact: { channel: "phone", summary: "one-ring missed call from a premium-rate destination" },
    signals: [
      { name: "premium_rate_destination", channel: "phone", axis: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "the callback destination sits in a premium-rate range" },
      { name: "campaign_volume_search", channel: "phone", axis: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no bulk-campaign data found for this number", nothing_found: true },
    ],
    expectations: { spam: "no_evidence_found", scam: "evidence_found", quadrant: "scam_not_spam" },
  },
  {
    id: "cross-channel-mismatch",
    shape: "a phone artifact with email evidence: the signals are ignored, nothing is inferred across channels",
    artifact: { channel: "phone", summary: "a number evaluated with email signals by mistake" },
    signals: [
      { name: "homoglyph_domain", channel: "email", axis: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "an email signal about a phone artifact" },
    ],
    expectations: { spam: "unknown", scam: "unknown", quadrant: "unplaced", limitations: ["channel_mismatch", "no_evidence_provided"] },
  },
];

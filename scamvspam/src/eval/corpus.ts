import type {
  Artifact,
  Limitation,
  OperationPlacement,
  PoleFinding,
  Quadrant,
  IntentPlacement,
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
    spam?: PoleFinding;
    scam?: PoleFinding;
    automated?: PoleFinding;
    human?: PoleFinding;
    intent?: IntentPlacement;
    operation?: OperationPlacement;
    quadrant?: Quadrant;
    limitations?: string[];
  };
  now?: string;
}

export const FIXTURES: FixtureCase[] = [
  {
    id: "bec-invoice-fraud",
    shape: "email invoice redirection with an impersonated executive and manual replies: human fraud, the top-right corner",
    artifact: { channel: "email", summary: "invoice redirection targeting a finance team, executive impersonation" },
    signals: [
      { name: "invoice_redirection", channel: "email", pole: "scam", strength: "verified", coverage: "full", observed_at: FRESH, detail: "payment details changed to a new account mid-conversation" },
      { name: "executive_impersonation", channel: "email", pole: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "the sender impersonates a real executive of the target org" },
      { name: "manual_reply_behavior", channel: "email", pole: "human", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "replies adapt to the target's answers, conversation-specific" },
      { name: "handwritten_personalization", channel: "email", pole: "human", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "details only a person reading the thread would include" },
      { name: "bulk_campaign_search", channel: "email", pole: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no campaign or bulk-sender evidence found", nothing_found: true },
      { name: "automation_marker_search", channel: "email", pole: "automated", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no template, scripting, or bulk-send markers found", nothing_found: true },
    ],
    expectations: { spam: "no_evidence_found", scam: "evidence_found", automated: "no_evidence_found", human: "evidence_found", intent: "scam", operation: "human", quadrant: "scam_human" },
  },
  {
    id: "spearphish-targeted",
    shape: "email a lookalike bank domain with a reply-to mismatch, one recipient, hand-written: human fraud again",
    artifact: { channel: "email", summary: "lookalike bank domain, reply-to mismatch, single recipient" },
    signals: [
      { name: "homoglyph_domain", channel: "email", pole: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "the from domain substitutes a unicode lookalike character" },
      { name: "reply_to_mismatch", channel: "email", pole: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "reply-to domain differs from the from domain" },
      { name: "handwritten_personalization", channel: "email", pole: "human", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "recipient-specific bait a script would not know" },
      { name: "bulk_campaign_search", channel: "email", pole: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no campaign or bulk-sender evidence found", nothing_found: true },
      { name: "automation_marker_search", channel: "email", pole: "automated", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no automation markers found", nothing_found: true },
    ],
    expectations: { intent: "scam", operation: "human", quadrant: "scam_human" },
  },
  {
    id: "ai-phish-blast",
    shape: "email a credential-harvest blast on a purchased list, identical template at volume: bot fraud, and the intent sits between poles, because a blast is both scam and spam",
    artifact: { channel: "email", summary: "credential-harvest blast, identical template, purchased list" },
    signals: [
      { name: "homoglyph_domain", channel: "email", pole: "scam", strength: "verified", coverage: "full", observed_at: FRESH, detail: "lookalike from domain" },
      { name: "bulk_sender", channel: "email", pole: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "identical campaign across many recipients" },
      { name: "list_acquired_address", channel: "email", pole: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "the address appears on an acquired list without consent trail" },
      { name: "identical_template_volume", channel: "email", pole: "automated", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "byte-identical body across recipients, bulk-send infrastructure" },
      { name: "human_operation_search", channel: "email", pole: "human", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no conversation-specific adaptation found", nothing_found: true },
    ],
    expectations: { intent: "spam_and_scam", operation: "automated", quadrant: "mixed", limitations: ["mixed_placement"] },
  },
  {
    id: "robocall-telemarketing",
    shape: "phone a prerecorded telemarketing campaign: bot spam, the bottom-left corner",
    artifact: { channel: "phone", summary: "prerecorded sales robocall campaign" },
    signals: [
      { name: "bulk_campaign", channel: "phone", pole: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "the same campaign rings many numbers without consent" },
      { name: "prerecorded_script", channel: "phone", pole: "automated", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "identical recorded audio across calls, no live agent" },
      { name: "deception_pattern_search", channel: "phone", pole: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no fraud-script or deception patterns found", nothing_found: true },
      { name: "human_operation_search", channel: "phone", pole: "human", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no live-agent adaptation found", nothing_found: true },
    ],
    expectations: { intent: "spam", operation: "automated", quadrant: "spam_automated" },
  },
  {
    id: "solo-newsletter-hand-sent",
    shape: "email unsolicited outreach sent by hand by a small operator: human hustle, the top-left corner",
    artifact: { channel: "email", summary: "manually sent unsolicited pitch to a hand-assembled list" },
    signals: [
      { name: "unsolicited_acquired_list", channel: "email", pole: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no consent trail for the recipients" },
      { name: "manual_send_pattern", channel: "email", pole: "human", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "irregular send times, individually composed messages" },
      { name: "deception_pattern_search", channel: "email", pole: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no deception patterns found", nothing_found: true },
      { name: "automation_marker_search", channel: "email", pole: "automated", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no bulk-send or template markers found", nothing_found: true },
    ],
    expectations: { intent: "spam", operation: "human", quadrant: "spam_human" },
  },
  {
    id: "voice-clone-fraud-call",
    shape: "phone a voice-clone impersonation call: bot fraud, the bottom-right corner. adversarial ai is automation",
    artifact: { channel: "phone", summary: "voice-clone impersonation of a family member requesting money" },
    signals: [
      { name: "voice_clone_impersonation", channel: "phone", pole: "scam", strength: "verified", coverage: "full", observed_at: FRESH, detail: "clone of a known person's voice requesting urgent payment" },
      { name: "ai_voice_clone_markers", channel: "phone", pole: "automated", strength: "recognized", coverage: "partial", observed_at: FRESH, detail: "synthetic-speech artifacts in the audio" },
      { name: "bulk_campaign_search", channel: "phone", pole: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no bulk-campaign data found for this number", nothing_found: true },
      { name: "human_operation_search", channel: "phone", pole: "human", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no live-operator adaptation found", nothing_found: true },
    ],
    expectations: { intent: "scam", operation: "automated", quadrant: "scam_automated" },
  },
  {
    id: "romance-scam-hybrid",
    shape: "email a long-running romance scam with scripted canned openers and manual personalization: hybrid operation, the center of the operation axis",
    artifact: { channel: "email", summary: "romance scam thread, scripted opening adapted by a human operator" },
    signals: [
      { name: "payment_redirection_pattern", channel: "email", pole: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "eventually requests gift cards and wire transfers" },
      { name: "manual_conversation", channel: "email", pole: "human", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "replies adapt over weeks to the target's life details" },
      { name: "scripted_followup_sequence", channel: "email", pole: "automated", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "boiler-room script opens with canned lines" },
      { name: "bulk_campaign_search", channel: "email", pole: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no campaign evidence found", nothing_found: true },
    ],
    expectations: { intent: "scam", operation: "hybrid", quadrant: "mixed", limitations: ["mixed_placement"] },
  },
  {
    id: "transactional-searched",
    shape: "email a receipt from a known sender: all four poles searched and nothing found. both axes center, with the caveat",
    artifact: { channel: "email", summary: "order receipt from a known sender, consistent domains" },
    signals: [
      { name: "bulk_campaign_search", channel: "email", pole: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no campaign evidence found", nothing_found: true },
      { name: "deception_pattern_search", channel: "email", pole: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no deception patterns found", nothing_found: true },
      { name: "automation_marker_search", channel: "email", pole: "automated", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "automated sending by a legit sender is not fraud automation; no adversarial automation found", nothing_found: true },
      { name: "human_operation_search", channel: "email", pole: "human", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "no human deception operator found", nothing_found: true },
    ],
    expectations: { intent: "neither", operation: "neither", quadrant: "mixed", limitations: ["mixed_placement", "neither_is_about_this_search"] },
  },
  {
    id: "nothing-provided",
    shape: "no evidence at all: both axes unknown, unplaced. absence of evidence is never a clean bill of health",
    artifact: { channel: "phone", summary: "a number with no lookups performed" },
    signals: [],
    expectations: { intent: "unknown", operation: "unknown", quadrant: "unplaced", limitations: ["no_evidence_provided"] },
  },
  {
    id: "stale-blast",
    shape: "signals from january 2025: old evidence decays to silence, unplaced",
    artifact: { channel: "phone", summary: "a number with only year-old campaign evidence" },
    signals: [
      { name: "bulk_sender", channel: "phone", pole: "spam", strength: "recognized", coverage: "full", observed_at: STALE, detail: "an old bulk-campaign record" },
      { name: "spoofed_caller_id", channel: "phone", pole: "scam", strength: "recognized", coverage: "full", observed_at: STALE, detail: "an old spoofing report" },
    ],
    expectations: { intent: "unknown", operation: "unknown", quadrant: "unplaced", limitations: ["stale_intelligence"] },
  },
  {
    id: "parcel-locker-shape-only",
    shape: "address a freight forwarder shape with no pole evidence: the shape is recorded, infrastructure is not intent, nothing moves",
    artifact: { channel: "address", summary: "parcel locker address on a reshipping route" },
    signals: [
      { name: "freight_forwarder_shape", channel: "address", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "the address matches a known freight-forwarder facility pattern" },
    ],
    expectations: { intent: "unknown", operation: "unknown", quadrant: "unplaced", limitations: ["infrastructure_is_not_intent"] },
  },
  {
    id: "cross-channel-mismatch",
    shape: "a phone artifact with email evidence: the signals are ignored, nothing is inferred across channels",
    artifact: { channel: "phone", summary: "a number evaluated with email signals by mistake" },
    signals: [
      { name: "homoglyph_domain", channel: "email", pole: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "an email signal about a phone artifact" },
    ],
    expectations: { intent: "unknown", operation: "unknown", quadrant: "unplaced", limitations: ["channel_mismatch", "no_evidence_provided"] },
  },
];

// scamvspam schema 0.2.0. the quadrant has two axes:
//   intent: spam <-> scam. spam is unsolicited bulk (a volume and
//     consent claim), scam is deceptive intent (a fraud claim). an
//     artifact can sit at a pole or between them: a phishing blast is
//     both, and lands in the middle, honestly.
//   operation: human-operated <-> automated. automated covers bots and
//     adversarial ai; hybrid is real and lands in the middle too.
// unknown is first-class on both axes: absence of evidence is a
// statement about the search, never a verdict
export const SCHEMA_VERSION = "0.2.0";

export type Channel = "email" | "address" | "phone";

// the four poles of the quadrant
export type Pole = "spam" | "scam" | "automated" | "human";

// same vocabulary as the sibling engines, per pole
export type PoleFinding = "unknown" | "no_evidence_found" | "evidence_found";

export type Strength = "verified" | "recognized" | "suggestive";
export type Coverage = "full" | "partial" | "none";

export interface Signal {
  name: string;
  channel: Channel;
  // absent = an infrastructure/shape signal: it describes what something
  // IS (a relay, a locker, a voip range) and never moves a pole,
  // because infrastructure is not intent
  pole?: Pole;
  strength: Strength;
  coverage: Coverage;
  observed_at: string;
  detail: string;
  // true when this signal means "this pole was searched at this
  // coverage and nothing was found": an absence claim from a search that
  // ran, which is the only honest way to reach no_evidence_found
  nothing_found?: boolean;
}

export interface Artifact {
  channel: Channel;
  summary: string;
}

// placement on the intent axis
export type IntentPlacement =
  | "spam"
  | "scam"
  | "spam_and_scam"
  | "neither"
  | "unknown";

// placement on the operation axis
export type OperationPlacement =
  | "human"
  | "automated"
  | "hybrid"
  | "neither"
  | "unknown";

export type Quadrant =
  | "scam_human"
  | "scam_automated"
  | "spam_human"
  | "spam_automated"
  | "mixed"
  | "unplaced";

export interface Limitation {
  code: string;
  text: string;
}

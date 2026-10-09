// scamvspam schema 0.1.0. spam and scam are independent axes: spam is
// unsolicited bulk (a volume and consent claim), scam is deceptive
// intent (a fraud claim). neither implies the other, and both can be
// unknown at once. unknown is first-class: absence of evidence is a
// statement about the search, never a verdict
export const SCHEMA_VERSION = "0.1.0";

export type Channel = "email" | "address" | "phone";
export type Axis = "spam" | "scam";

// same vocabulary as the sibling engines, per axis
export type AxisFinding = "unknown" | "no_evidence_found" | "evidence_found";

export type Strength = "verified" | "recognized" | "suggestive";
export type Coverage = "full" | "partial" | "none";

export interface Signal {
  name: string;
  channel: Channel;
  // absent = an infrastructure/shape signal: it describes what something
  // IS (a relay, a locker, a voip range) and never moves either axis,
  // because infrastructure is not intent
  axis?: Axis;
  strength: Strength;
  coverage: Coverage;
  observed_at: string;
  detail: string;
  // true when this signal means "this axis was searched at this
  // coverage and nothing was found": an absence claim from a search that
  // ran, which is the only honest way to reach no_evidence_found
  nothing_found?: boolean;
}

export interface Artifact {
  channel: Channel;
  summary: string;
}

export type Quadrant =
  | "scam_and_spam"
  | "scam_not_spam"
  | "spam_not_scam"
  | "neither"
  | "unplaced";

export interface Limitation {
  code: string;
  text: string;
}

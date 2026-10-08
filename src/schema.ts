// schema.ts — versioned result format.
// required concepts, deliberately not invented probabilities, and no
// street-shape verdict: an address with no box-shaped evidence is reported
// as no such evidence found, never as a verified street address.

export const SCHEMA_VERSION = "0.3.0";

// the signal kinds. each is independent evidence, never a verdict.
export type SignalName =
  | "po_box_equivalent" // po box / postfach / locked bag / apartado / cedex and other po box shapes
  | "parcel_locker_or_pickup_point" // a carrier's locker or pickup-point address format
  | "cmra_or_virtual_mailbox" // commercial mail receiving agency, virtual mailbox, virtual office
  | "mail_forwarding_or_reshipping" // parcel-forwarding / reshipping facility (myus, stackry-style consolidators)
  | "format_issue" // missing or malformed fields against the market's format rules
  | "street_delivery_point_confirmed" // an adapter confirmed a deliverable street address (adapter-only)
  // adapter-only: a delivery point validation service (usps dpv, google
  // address validation) reported on whether the address, including its
  // secondary unit, exists. the offline core never emits this: existence
  // is fundamentally an external question, and claiming it locally is
  // exactly the guessing this component refuses
  | "delivery_point_validation"
  // adapter-only: the building at this address is commercial (office,
  // retail, mixed-use), per a building-use dataset. reported as
  // independent evidence and deliberately NOT mapped into any shape
  // finding: commercial buildings can legally hold residences, and
  // whether business-use buildings are acceptable is a consumer policy
  // question (residences-only services), never this component's decision
  | "commercial_building_indicator";

// what the signal is about, not what it proves.
//   address   — evidence in the given address text itself
//   market    — evidence from the market's documented format rules
//   carrier   — evidence matched a carrier's documented address format
export type SignalScope = "address" | "market" | "carrier";

// evidence strength with explicit meanings. never a probability.
//   recognized  — matched a verified, maintained table pattern or an evaluated adapter check
//   suggestive  — matched an unverified seed pattern; structural evidence only
//   unresolved  — evidence exists but the shape could not be established
export type EvidenceStrength = "recognized" | "suggestive" | "unresolved";

// coverage semantics on every signal. an unevaluated check is coverage
// "none", never a clean result.
//   full    — an evaluated external check covers this signal's claim
//   partial — an external check ran, but its reach does not cover the whole claim
//   none    — no external check ran; the signal rests on local tables only
export type Coverage = "full" | "partial" | "none";

export interface Signal {
  name: SignalName;
  scope: SignalScope;
  // provenance: builtin table version and row citation, or adapter name+version
  source: string;
  // iso 8601. for builtin-table signals this is the table row's verification
  // for adapter signals carrying a validation result: what the source said
  // about the address's existence. only meaningful with the
  // delivery_point_validation signal name
  existence?: "confirmed_exists" | "disconfirmed";
  // date, so the knowledge itself ages; for adapter findings it is the
  // observation time. see the aggregation stage for staleness.
  observed_at: string;
  strength: EvidenceStrength;
  coverage: Coverage;
  detail: string;
}

// aggregate states. unknown is a first-class answer, never flattened.
//   signals_present — consistent evidence collected, no contradiction
//   mixed_evidence  — recognized signals from different shape classes that do not share one source
//   contradictory   — recognized evidence disagrees
//   unknown         — nothing established, or evidence gathering failed
export type ResultState =
  | "signals_present"
  | "mixed_evidence"
  | "contradictory"
  | "unknown";

// what was found per shape class. "no_evidence_found" is a statement about
// the search, never about the address: it is not a street-address verdict.
export type ShapeFinding = "evidence_found" | "no_evidence_found" | "unknown";

// format validity is the one offline-checkable claim, so it gets its own
// vocabulary rather than pretending it is a shape class.
export type FormatFinding = "valid" | "issues_found" | "unknown";

// whether the address exists as a deliverable point. "disconfirmed" is
// the apartment-f case: a real building whose recognized units are a-e
// and the given unit is f. it is never an absolute metaphysical claim:
// it means the validation source said so, at its own coverage and
// observation date, and it ages like every other piece of evidence.
// the offline core always reports unknown here; only a validation
// adapter can say anything else.
export type ExistenceFinding = "confirmed_exists" | "disconfirmed" | "unknown";

export interface ShapeFindings {
  po_box_equivalent: ShapeFinding;
  parcel_locker_or_pickup_point: ShapeFinding;
  cmra_or_virtual_mailbox: ShapeFinding;
  // a parcel-forwarding / reshipping facility: a distinct commercial class
  // from a virtual mailbox, with its own finding because consumers may
  // treat the two differently. the component never decides which.
  mail_forwarding_or_reshipping: ShapeFinding;
  format_validity: FormatFinding;
  // adapter-only, like the existence claim it carries: unknown unless a
  // delivery point validation adapter ran
  address_existence: ExistenceFinding;
}

export interface DetectionResult {
  schema_version: string;
  // the market only. the address lines are not echoed back or logged here.
  market: string;
  input_valid: boolean;
  invalid_reason?: string;
  signals: Signal[];
  state: ResultState;
  shape_findings: ShapeFindings;
  limitations: string[];
  evaluated_at: string;
}

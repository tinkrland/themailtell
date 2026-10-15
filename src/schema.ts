export const ENGINE_VERSION = "0.2.0";
// 0.2.0: age and era bounds. domain age composes from rdap adapter
// findings (structured dates, coverage semantics); email era bounds
// surface verbatim from the provider rows, never parsed into
// numbers. issuance_scope is now composed as structured context

export type FieldType = "email" | "phone" | "payment" | "domain";

export interface OnboardingObservation {
  field: FieldType;
  value: string;
  // optional upstream classification (adapter contract with coverage
  // semantics): the engine binds the hint if it cannot bind the raw
  instrument_hint?: string;
  // optional age finding from a network adapter (rdap): the pure
  // core never touches the network, it composes what is handed in
  age_finding?: AgeFinding;
}

// a structured age observation about a field's instrument. adapters
// produce these outside the pure core, with coverage semantics
export interface AgeFinding {
  source: string;
  // ISO date from the registry event, or null when the registry did
  // not serve one. null is a coverage fact, never "young"
  created_on: string | null;
  fetched_at: string;
  coverage: "read" | "unknown";
  coverage_note?: string;
}

export interface AgeReading {
  source: string | null;
  created_on: string | null;
  age_days: number | null;
  coverage: "read" | "unknown";
  coverage_note?: string;
  // era-bound text from the provider rows, carried verbatim:
  // advisory bounds like "cannot predate the 2022 domain launch",
  // never parsed into numbers the source does not give
  age_signal_notes?: string[];
}

export interface OnboardingInput {
  observed_at: string;
  observations: OnboardingObservation[];
}

// what identity stands behind the instrument occupying a field
export type TetherDepth =
  | "none"
  | "registration_only"
  | "partial"
  | "full_kyc"
  | "unknown";

export interface EvidenceReading {
  age_days: number | null;
  cadence_days: number;
  verified_on: string | null;
  // 1.0 inside the cadence window, decaying linearly to 0 across one
  // more window, 0 for unverified rows. staleness is priced, not hidden
  confidence: number;
}

export interface InstrumentBinding {
  radar: string;
  name: string;
  kind: string;
  row_snapshot_commit: string;
}

export interface FieldReading {
  field: FieldType;
  value: string;
  normalized: {
    domain?: string;
    tld?: string;
    bin?: string;
    card_network?: string;
    digits?: string;
  };
  instrument: InstrumentBinding | null;
  tether: TetherDepth;
  rotation: string;
  evidence: EvidenceReading;
  // ambiguous bindings list their candidates instead of guessing
  candidates: string[];
  // age: composed from adapter findings for domains, era bounds
  // verbatim for email inboxes, unknown when nothing is known
  age: AgeReading;
  issuance_scope?: string;
  unknowns: string[];
}

export interface CounterSuggestion {
  field: FieldType;
  instrument_kind: string;
  counter: string;
}

export interface SurfaceReading {
  engine_version: string;
  observed_at: string;
  fields: FieldReading[];
  // fields whose instruments are low-tether or on-demand-rotatable:
  // a capacity description of the surface, never an accusation
  substitutable_fields: FieldType[];
  counters: CounterSuggestion[];
  unknowns: string[];
  non_verdict: string;
}

export const NON_VERDICT =
  "a composition of instrument signals, never a verdict about a " +
  "person: every instrument here has lawful holders, and one of " +
  "them is this registry family's author";

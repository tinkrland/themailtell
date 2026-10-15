export const ENGINE_VERSION = "0.1.0";

export type FieldType = "email" | "phone" | "payment" | "domain";

export interface OnboardingObservation {
  field: FieldType;
  value: string;
  // optional upstream classification (adapter contract with coverage
  // semantics): the engine binds the hint if it cannot bind the raw
  instrument_hint?: string;
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

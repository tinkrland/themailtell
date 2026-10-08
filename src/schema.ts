// versioned result schema. every result carries schema_version so consumers
// can pin a format. the schema never asserts a verdict about a person or an
// account; it reports line-type and virtual-number evidence with scope,
// strength, coverage and observed time, and unknown is first-class.

export const SCHEMA_VERSION = "1.0.0" as const;

/** where the evidence comes from and what it describes */
export type SignalScope = "number" | "range" | "provider" | "adapter";

/**
 * evidence strength with explicit meanings:
 * - recognized: verified table row or an adapter result with coverage for
 *   this check.
 * - suggestive: unverified seed rows, community lists, or an adapter result
 *   with partial coverage.
 * - unresolved: stale evidence that may once have been recognized but whose
 *   verification window has passed. never silently trusted, never silently
 *   dropped.
 */
export type EvidenceStrength = "recognized" | "suggestive" | "unresolved";

/**
 * coverage semantics for external checks. an unevaluated check is "none",
 * never a clean verdict: an adapter that was not configured, was called and
 * failed, or does not cover this number yields coverage "none" and the
 * corresponding finding stays unknown, never "no evidence found".
 */
export type Coverage = "full" | "partial" | "none";

/** which line type a piece of evidence indicates */
export type LineType = "mobile" | "landline" | "fixed_voip" | "non_fixed_voip";

/** a single piece of evidence */
export interface Signal {
  name:
    | "numbering_plan_range"
    | "carrier_line_type"
    | "known_virtual_provider"
    | "community_list"
    | "declared_comparison";
  scope: SignalScope;
  /** the market (iso 3166-1 alpha-2) this evidence was evaluated under */
  market: string | null;
  source: string;
  observed_at: string;
  strength: EvidenceStrength;
  /** for adapter signals: what the adapter actually covered */
  coverage: Coverage;
  line_type?: LineType;
  detail?: string;
  citation?: string;
  /** for numbering-plan range rows that have been withdrawn by the regulator */
  withdrawn_on?: string;
}

export type Finding = "evidence_found" | "no_evidence_found" | "unknown";

export interface ShapeFindings {
  mobile: Finding;
  landline: Finding;
  fixed_voip: Finding;
  non_fixed_voip: Finding;
  virtual_number: Finding;
  format_validity: Finding;
}

export type AggregateState =
  | "signals_present"
  | "mixed_evidence"
  | "contradictory"
  | "unknown";

export interface Limitation {
  code: string;
  detail: string;
}

/** comparison against a caller-declared voip flag, never a verification */
export interface DeclaredComparison {
  comparison: "agree" | "disagree" | "unknown";
  detail: string;
}

export interface ClassificationResult {
  schema_version: typeof SCHEMA_VERSION;
  /** the input exactly as given, never rewritten */
  input: string;
  /** the e.164 form used for evaluation, reported for traceability */
  evaluated_number: string | null;
  market: string | null;
  parse: {
    valid: boolean;
    /** honest invalid reasons from the parser, when parse failed */
    reason?: string;
  };
  signals: Signal[];
  shape_findings: ShapeFindings;
  state: AggregateState;
  declared_comparison: DeclaredComparison | null;
  limitations: Limitation[];
}

// table row types. every row carries its regulator or provider citation and
// a verification date, or an honest null. rows age: a stale row downgrades to
// unresolved strength in aggregation rather than asserting.

import type { LineType, Coverage } from "./schema.js";

/**
 * one numbering-plan range. prefix is matched against the national
 * significant number (no trunk prefix, no country code). "market" in data
 * and user-facing strings, never "country".
 */
export interface NumberingPlanRow {
  prefix: string;
  /** the line type this range indicates in the numbering plan */
  line_type: LineType | "ngn" | "tollfree" | "other";
  /** the official designation, in the regulator's own vocabulary */
  official_name: string;
  citation: string;
  verified_on: string | null;
  withdrawn_on?: string;
  note?: string;
}

/** known virtual-number providers, cross-market */
export interface ProviderRow {
  provider: string;
  /** consumer app, cpaas, or business virtual-number service */
  kind: "consumer_app" | "cpaas" | "business";
  /** markets the provider is known to issue numbers in */
  markets: string[];
  /** e.164 prefixes the provider is known to use, or null when the
   * provider's numbers are not distinguishable by range */
  prefixes: string[] | null;
  note?: string;
  citation: string;
  verified_on: string | null;
}

/**
 * a community list of numbers seen on public sms-receive websites. these are
 * crowd-sourced observations with their own staleness: each snapshot carries
 * its date, and a stale snapshot downgrades rather than asserting.
 */
export interface CommunityListRow {
  list: string;
  snapshot_date: string;
  /** e.164 numbers observed on the list */
  numbers: string[];
  citation: string;
  note?: string;
}

export interface MarketTables {
  regulator: string;
  ranges: NumberingPlanRow[];
  /** honest note when the numbering plan encodes no line-type signal */
  note?: string;
}

/** input parse evidence, produced by an injected parser (never the core) */
export interface ParseEvidence {
  valid: boolean;
  /** honest machine reason when the parse failed */
  reason?: string;
  /** e.164 when valid */
  e164: string | null;
  /** national significant number (digits only, no trunk prefix) */
  national_significant_number: string | null;
  /** calling code digits */
  country_code: string | null;
  /** the market the parser assigned, iso 3166-1 alpha-2 */
  market: string | null;
  /** the original input, preserved verbatim */
  input: string;
  observed_at: string;
}

/**
 * carrier or line-type adapter evidence. the adapter contract is in
 * adapters.ts; this is the neutral evidence a carrier lookup produced.
 */
export interface CarrierEvidence {
  source: string;
  observed_at: string;
  coverage: Coverage;
  line_type: LineType | null;
  carrier_name?: string | null;
  /** the adapter believes the number was ported */
  ported?: boolean | null;
  /** the adapter checked and knows the number is not in service */
  not_in_service?: boolean;
  detail?: string;
}

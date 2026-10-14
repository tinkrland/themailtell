// thetldradar schema 0.1.0. entry shape for the tld reputation
// registry: an abuse band traced to a dataset snapshot, plus price
// observations traced to named registrars with their own dates.
// unknown is first-class; snapshots are never timeless facts
export const SCHEMA_VERSION = "0.1.0";

// relative band under a dataset's coverage, traced to a snapshot.
// high/elevated/moderate/low describe abuse share, never raw counts
export type AbuseBand =
  | "high"
  | "elevated"
  | "moderate"
  | "low"
  | "unknown";

export interface PriceObservation {
  registrar: string;
  first_year_price_usd: number | null;
  renewal_price_usd: number | null;
  // price snapshots decay fast: promo economics move on weekly
  // timescales
  observed_at: string;
  citation: string;
}

export interface TldRiskEntry {
  tld: string;
  abuse_band: AbuseBand;
  // dataset + snapshot date the band was read from
  abuse_citation: string;
  // null = unverified seed: flagged for verification, never relied on
  abuse_verified_on: string | null;
  price_observations: PriceObservation[];
  recheck_cadence_days: number;
  honest_notes: string;
}

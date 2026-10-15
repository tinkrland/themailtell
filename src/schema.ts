// thetldradar schema 0.1.0. entry shape for the tld reputation
// registry: an abuse band traced to a dataset snapshot, plus price
// observations traced to named registrars with their own dates.
// unknown is first-class; snapshots are never timeless facts
export const SCHEMA_VERSION = "0.6.0";
// 0.2.0: bands defined against a named dataset snapshot (interisle
// phishing per-100k rates, feb-apr 2026): high >= 100, elevated 40-100,
// moderate 15-40, low < 15 per 100k domains. spam rates carried in
// honest_notes. a band is a snapshot reading, never a tld property

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

// 0.4.0: the premierity axis. some tlds cannot just be bought, no
// matter how cheap: a price requires a path through eligibility first.
// the barrier changes what a cheap promo even means: a sale on a
// nexus-attested tld still runs through the attestation
export type RegistrationBarrier =
  // anyone with a payment method
  | "open"
  // attested qualifying connection, e.g. .us usTLD nexus policy
  | "nexus_required"
  // documented claim checked by the registry, e.g. .ie connection claim
  | "claim_required"
  // holder address verification under registry rules, e.g. .de NIS2
  | "presence_verified"
  // eu/eea residency or an established organization, e.g. .eu
  | "residency_required"
  | "unknown";

export interface TldRiskEntry {
  tld: string;
  registration_barrier: RegistrationBarrier;
  barrier_citation: string;
  // null = unverified seed: flagged for verification, never relied on
  barrier_verified_on: string | null;
  abuse_band: AbuseBand;
  // dataset + snapshot date the band was read from
  abuse_citation: string;
  // null = unverified seed: flagged for verification, never relied on
  abuse_verified_on: string | null;
  price_observations: PriceObservation[];
  recheck_cadence_days: number;
  honest_notes: string;
}

// 0.3.0: the registrar axis. the aggregate telemetry radars measure
// what shows up in feeds, and feeds are dominated by api-scale bulk
// purchase. this registry's factor is the other path: the human who
// buys one or two domains at a polished consumer checkout, at a sale
// price, sometimes with bitcoin, sometimes through a privacy buffer
// that owns the domain for them. invisible to aggregate telemetry
// until the domain is used

export type RegistrarKind =
  // polished consumer storefront with sale-driven pricing
  | "consumer_boutique"
  // wholesale pricing with no promos: no price-pressure signal
  | "at_cost"
  // owns the domain for the registrant: anonymity by architecture
  | "privacy_buffer"
  // the registry itself selling direct to consumers, cutting out
  // registrars: gen.xyz is the .xyz registry's own storefront
  | "registry_storefront"
  // on-chain naming: nft-based web3 domains, not dns; no renewal
  // cliff, one-time mint economics
  | "web3_naming"
  | "unknown";

export type SalePattern =
  // struck-through renewal prices against sale registration prices
  | "first_year_sales"
  // published rotating coupon codes
  | "monthly_coupons"
  | "none"
  | "unknown";

export interface BoutiqueRegistrarEntry {
  registrar: string;
  kind: RegistrarKind;
  sale_pattern: SalePattern;
  // payment privacy as the registrar or its reporting publishes it
  payment_privacy: string;
  ownership_note: string;
  citation: string;
  // null = unverified seed: flagged for verification, never relied on
  verified_on: string | null;
  recheck_cadence_days: number;
  honest_notes: string;
}

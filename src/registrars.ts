// thetldradar registrar table 0.3.0. the human path is the factor:
// aggregate abuse telemetry is dominated by api-scale bulk purchase,
// which big tech radars already measure. what they do not carry is
// the boutique storefront: the polished consumer checkout where a
// human buys one or two sale-priced domains, with a card, with
// bitcoin, or through a privacy buffer that owns the domain for
// them. this table enumerates that landscape, cited and dated.
//
// a registrar row is never a verdict about its customers: sales and
// privacy shields serve dissidents and abusers alike, and the row
// records architecture and economics, never intent.
//
// row provenance: verified rows were read from their cited sources
// on the recorded date; null rows are unverified seeds.

import type { BoutiqueRegistrarEntry } from "./schema.js";

export const REGISTRAR_REGISTRY: BoutiqueRegistrarEntry[] = [
  {
    registrar: "Spaceship",
    kind: "consumer_boutique",
    sale_pattern: "first_year_sales",
    payment_privacy: "not verified in this pass",
    ownership_note:
      "operates as a project of Namecheap, Inc, the world's " +
      "second-largest registrar (namecheap's own april 2024 press " +
      "release; grokipedia's registrar profile)",
    citation:
      "https://www.namecheap.com/about/press-releases/24-04-16/the-new-domain-registration-web-service " +
      "(read 2026-10-15), https://grokipedia.com/page/Spaceship_domain_registrar, " +
      "https://www.spaceship.com/domains/",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "the boutique storefront is a sales channel of a major " +
      "incumbent, not a small operator: the $4 first-year .ltd " +
      "observed 2026-10-14 against a $25.04 renewal is namecheap " +
      "running consumer-storefront economics on a niche tld. the " +
      "sale is visible to any human at the checkout; no api needed",
  },
  {
    registrar: "Porkbun",
    kind: "consumer_boutique",
    sale_pattern: "first_year_sales",
    payment_privacy: "not verified in this pass",
    ownership_note: "independent; not verified in this pass",
    citation:
      "https://porkbun.com/products/domains (live pricing page, read " +
      "2026-10-15: sale registration prices with struck-through " +
      "renewal prices)",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "the clearest sale-churn pattern found, read from its own live " +
      "pricing page today: .top $1.63 first year against $4.63 " +
      "renewal, .click $1.54/$10.81, .xyz $2.04/$14.21, " +
      ".icu $3.59/$15.96, .ltd $5.66/$34.50. .top and .click sit " +
      "inside the interisle us$2-or-less abuse-price zone, and .xyz " +
      "at $2.04 is a cent past its border: the highest-rate tlds " +
      "carry the steepest human-checkout sales",
  },
  {
    registrar: "Namecheap",
    kind: "consumer_boutique",
    sale_pattern: "monthly_coupons",
    payment_privacy:
      "accepts bitcoin (own support page: namecheap.com/support/payment/bitcoin)",
    ownership_note:
      "the world's second-largest registrar; spaceship is its storefront",
    citation:
      "https://www.namecheap.com/promos/coupons/ (monthly coupon codes, " +
      "read 2026-10-15), https://www.namecheap.com/support/payment/bitcoin, " +
      "https://www.namecheap.com/about/press-releases/24-04-16/the-new-domain-registration-web-service",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "monthly rotating coupons push first-year prices below list on " +
      "top of per-tld promos, and bitcoin acceptance widens the human " +
      "payment-privacy path. the same organization operates the " +
      "spaceship storefront, so both rows trace to one incumbent",
  },
  {
    registrar: "Dynadot",
    kind: "consumer_boutique",
    sale_pattern: "unknown",
    payment_privacy:
      "lists many payment options including alipay, e-cash, bank wire " +
      "(own pricing page)",
    ownership_note: "california-based, icann-accredited since 2002 (phishunt registrar profile)",
    citation:
      "https://www.dynadot.com/domain/info (payment and pricing page), " +
      "https://www.dynadot.com/blog/price-changes-for-over-200-identity-digital-tlds " +
      "(read 2026-10-15), https://phishunt.io/registrar/Dynadot%20Inc/",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "announced identity digital registry price changes for 227 tlds " +
      "effective october 6, 2026 on its own blog: the renewal economics " +
      "of niche tlds like .ltd are actively moving. a third-party feed " +
      "(phishunt) lists phishing domains registered through dynadot, " +
      "which is an association in one feed, never a verdict about the " +
      "registrar or its customers",
  },
  {
    registrar: "Cloudflare Registrar",
    kind: "at_cost",
    sale_pattern: "none",
    payment_privacy: "not verified in this pass",
    ownership_note: "Cloudflare, Inc",
    citation:
      "https://www.cloudflare.com/application-services/products/registrar/ " +
      "family of pages (read 2026-10-15: 'charges the wholesale price " +
      "for domains... no markups or hidden fees')",
    verified_on: "2026-10-15",
    recheck_cadence_days: 180,
    honest_notes:
      "the control row: at-cost pricing removes the price-pressure " +
      "signal entirely, no first-year sales, no renewal cliffs. a " +
      "domain bought here carries no sale-churn prior either way, " +
      "which is exactly why the radar records the absence of the " +
      "signal instead of assuming it everywhere",
  },
  {
    registrar: "Njalla",
    kind: "privacy_buffer",
    sale_pattern: "unknown",
    payment_privacy:
      "accepts bitcoin; domains about $15/yr (reclaimthenet reporting, " +
      "2026-10-15)",
    ownership_note:
      "founded 2017 by peter sunde; based in nevis; njalla owns the " +
      "domain for the registrant (own about page + reclaimthenet)",
    citation:
      "https://njal.la/about/ (read 2026-10-15), " +
      "https://reclaimthenet.org/?p=241864",
    verified_on: "2026-10-15",
    recheck_cadence_days: 180,
    honest_notes:
      "the extreme privacy path: the registrant is not the owner of " +
      "record, njalla is, which removes the human from the paper " +
      "trail entirely. privacy is a right that shields dissidents " +
      "and abusers alike; the row records the architecture, never " +
      "the user",
  },
];

// thetldradar registry table 0.2.0. one row per tld: an abuse band
// traced to a dataset snapshot, price observations traced to named
// registrars with their own observation dates. the twist is carried
// explicitly: interisle documents that phishers exploit cheap tlds,
// so promo pricing is radar evidence about registration economics.
// it is never proof about a registrant.
//
// band scale, defined against the interisle phishing table for
// february-april 2026 (cybercrimeinfocenter.org, read 2026-10-14):
// per-100k malicious phishing domain rates. high >= 100, elevated
// 40-100, moderate 15-40, low < 15. raw counts are never bands: .com
// leads every table on count and sits at the bottom on rate.
//
// row provenance: rows with abuse_verified_on were read from their
// cited sources on that date. rows with null are unverified seeds
// and say so in honest_notes.

import type { TldRiskEntry } from "./schema.js";

export const TLD_REGISTRY: TldRiskEntry[] = [
  {
    tld: ".com",
    registration_barrier: "open",
    barrier_citation: "no eligibility policy exists: the gtld program registers to any buyer",
    barrier_verified_on: "2026-10-15",
    abuse_band: "low",
    abuse_citation:
      "interisle/cybercrimeinfocenter phishing activity in tlds, " +
      "february-april 2026 (read 2026-10-14): rank 1 by count, 188,756 " +
      "malicious phishing domains of 161,935,002, rate 11.7 per 100k. " +
      "spam table december-february: 972,033 domains, 60.7 per 100k",
    abuse_verified_on: "2026-10-14",
    price_observations: [
      {
        registrar: "Spaceship",
        first_year_price_usd: 2.90,
        renewal_price_usd: 9.98,
        observed_at: "2026-10-14",
        citation:
          "https://www.spaceship.com/domains/ plus tldbee.com/registrars/spaceship " +
          "and tabswire.com/spaceship-review (promo range 2.90-9 first year, " +
          "renewal ~9.98-10.18)",
      },
    ],
    recheck_cadence_days: 180,
    honest_notes:
      "the share-vs-count honesty row: .com leads every dataset on raw " +
      "count because it is the largest tld; by rate it sits at the bottom " +
      "of the band scale (11.7 per 100k). spaceship's ~$2.90 first-year " +
      "promo does not make .com an abuse tld, and that is exactly why " +
      "rate and count are never conflated here",
  },
  {
    tld: ".top",
    registration_barrier: "open",
    barrier_citation: "no eligibility policy exists: the gtld program registers to any buyer",
    barrier_verified_on: "2026-10-15",
    abuse_band: "high",
    abuse_citation:
      "interisle/cybercrimeinfocenter phishing activity in tlds, " +
      "february-april 2026 (read 2026-10-14): rank 2 by count, 124,452 " +
      "malicious phishing domains of 6,299,448, rate 197.6 per 100k. " +
      "spam table: rank 2, 468,529 domains, 794.9 per 100k",
    abuse_verified_on: "2026-10-14",
    price_observations: [
      {
        registrar: "Porkbun",
        first_year_price_usd: 1.63,
        renewal_price_usd: 4.63,
        observed_at: "2026-10-15",
        citation:
          "porkbun.com/products/domains, live pricing page read " +
          "2026-10-15: $1.63 sale registration against a struck-through " +
          "$4.63 renewal",
      },
      {
        registrar: "Spaceship",
        first_year_price_usd: 2.90,
        renewal_price_usd: 9.98,
        observed_at: "2026-10-14",
        citation:
          "https://www.spaceship.com/domains/ plus tldbee.com/registrars/spaceship " +
          "and tabswire.com/spaceship-review (promo range 2.90-9 first year, " +
          "renewal ~9.98-10.18)",
      },
    ],
    recheck_cadence_days: 180,
    honest_notes:
      "seventeen times the .com phishing rate on a tld one twenty-sixth " +
      "its size, and porkbun sells it at $1.63 first year (own pricing " +
      "page, 2026-10-15): inside the interisle us$2-or-less abuse-price " +
      "zone, the exact economics their finding describes, at a polished " +
      "human checkout no bot api is needed to reach",
  },
  {
    tld: ".icu",
    registration_barrier: "open",
    barrier_citation: "no eligibility policy exists: the gtld program registers to any buyer",
    barrier_verified_on: "2026-10-15",
    abuse_band: "high",
    abuse_citation:
      "interisle/cybercrimeinfocenter phishing activity in tlds, " +
      "february-april 2026 (read 2026-10-14): rate 305.0 per 100k " +
      "(465,381 domains, 14,196 malicious). spam table: 937.9 per 100k, " +
      "the highest spam rate in the ranked tables",
    abuse_verified_on: "2026-10-14",
    price_observations: [
      {
        registrar: "Porkbun",
        first_year_price_usd: 3.59,
        renewal_price_usd: 15.96,
        observed_at: "2026-10-15",
        citation:
          "porkbun.com/products/domains, live pricing page read " +
          "2026-10-15: $3.59 sale registration against a struck-through " +
          "$15.96 renewal",
      },
    ],
    recheck_cadence_days: 180,
    honest_notes:
      "the worst spam rate in the current tables and a phishing rate in " +
      "the top band, on a small cheap tld: the interisle price-abuse " +
      "pattern in one row, sold to humans at $3.59 first year against " +
      "a $15.96 renewal",
  },
  {
    tld: ".click",
    registration_barrier: "open",
    barrier_citation: "no eligibility policy exists: the gtld program registers to any buyer",
    barrier_verified_on: "2026-10-15",
    abuse_band: "high",
    abuse_citation:
      "interisle/cybercrimeinfocenter phishing activity in tlds, " +
      "february-april 2026 (read 2026-10-14): rank 15 by count, 10,391 " +
      "malicious phishing domains, rate 143.6 per 100k. spam table: " +
      "39,799 domains, 578.7 per 100k",
    abuse_verified_on: "2026-10-14",
    price_observations: [
      {
        registrar: "Porkbun",
        first_year_price_usd: 1.54,
        renewal_price_usd: 10.81,
        observed_at: "2026-10-15",
        citation:
          "porkbun.com/products/domains, live pricing page read " +
          "2026-10-15: $1.54 sale registration against a struck-through " +
          "$10.81 renewal",
      },
    ],
    recheck_cadence_days: 180,
    honest_notes:
      "high-band phishing rate, near-top spam rate, and porkbun sells " +
      "it at $1.54 first year (2026-10-15): the cheapest sale in the " +
      "registry, deep inside the interisle us$2-or-less abuse-price " +
      "zone, seven cents under .top. the name itself is bait for " +
      "click-themed lures",
  },
  {
    tld: ".xyz",
    registration_barrier: "open",
    barrier_citation: "no eligibility policy exists: the gtld program registers to any buyer",
    barrier_verified_on: "2026-10-15",
    abuse_band: "moderate",
    abuse_citation:
      "interisle/cybercrimeinfocenter phishing activity in tlds, " +
      "february-april 2026 (read 2026-10-14): rank 6 by count, 20,738 " +
      "malicious phishing domains of 7,948,829, rate 26.1 per 100k. " +
      "spam table: 67,244 domains, 82.8 per 100k. spamhaus worst-tld " +
      "lists have repeatedly ranked .xyz by share of domains flagged, " +
      "a different metric (https://www.spamhaus.org/reputation-statistics/)",
    abuse_verified_on: "2026-10-14",
    price_observations: [
      {
        registrar: "Porkbun",
        first_year_price_usd: 2.04,
        renewal_price_usd: 14.21,
        observed_at: "2026-10-15",
        citation:
          "porkbun.com/products/domains, live pricing page read " +
          "2026-10-15: $2.04 sale registration against a struck-through " +
          "$14.21 renewal",
      },
    ],
    recheck_cadence_days: 180,
    honest_notes:
      "the canonical abused tld, but the current interisle rate table is " +
      "honest about it: 26.1 per 100k is moderate, roughly twice the .com " +
      "rate and far below .top and .icu. spamhaus share-metrics have " +
      "ranked it worse; both metrics are carried, neither is timeless. " +
      "cheap first-year pricing is part of its story: porkbun's $2.04 " +
      "sale sits a cent past the interisle us$2-or-less border, with a " +
      "seven-fold renewal cliff behind it",
  },
  {
    tld: ".ltd",
    registration_barrier: "open",
    barrier_citation: "no eligibility policy exists: the gtld program registers to any buyer",
    barrier_verified_on: "2026-10-15",
    abuse_band: "unknown",
    abuse_citation:
      "not ranked in the interisle/cybercrimeinfocenter phishing table " +
      "for february-april 2026 nor the spam table for " +
      "december-february (both threshold by tld size and minimum " +
      "counts; read 2026-10-14). absence from a thresholded table is a " +
      "statement about size, never about safety",
    abuse_verified_on: "2026-10-14",
    price_observations: [
      {
        registrar: "Spaceship",
        first_year_price_usd: 4.00,
        renewal_price_usd: 25.04,
        observed_at: "2026-10-14",
        citation:
          "renewal $25.04 read from domainoffer.net/tld/ltd/spaceship " +
          "(2026-10-14); the $4 first-year price is an owner-reported " +
          "observation on spaceship.com the same day, verify the promo " +
          "at the registrar before citing",
      },
      {
        registrar: "Porkbun",
        first_year_price_usd: 5.66,
        renewal_price_usd: 34.50,
        observed_at: "2026-10-15",
        citation:
          "porkbun.com/products/domains, live pricing page read " +
          "2026-10-15: $5.66 sale registration against a struck-through " +
          "$34.50 renewal; dynadot's blog (read 2026-10-15) reports " +
          "identity digital registry price changes for 227 tlds " +
          "effective october 6, 2026, so these renewals are moving",
      },
    ],
    recheck_cadence_days: 90,
    honest_notes:
      "the twist row: a $4 first year against a $25.04 renewal is " +
      "churn-driven registration economics, exactly the cheap-year " +
      "pattern interisle documents phishers exploiting (top 27 " +
      "highest-abuse tlds priced at us$2 or less; 51% of abusive " +
      "registrations in the new gtlds). the pattern holds across " +
      "storefronts: porkbun runs the same cliff, $5.66 first year " +
      "against $34.50 (2026-10-15). and the renewal is where they get " +
      "you: a $4 .ltd registered two years ago has paid $25.04 twice, " +
      "and each paid renewal weakens the sale-price prior, because " +
      "keeping the domain now costs real money. registration age is " +
      "per-domain evidence read at engine time (whois creation date), " +
      "never a class verdict. price pressure raises a prior about " +
      "economics; the abuse band stays unknown because the current " +
      "datasets do not rank it, and a cheap promo alone proves " +
      "nothing about abuse",
  },
  {
    tld: ".party",
    registration_barrier: "open",
    barrier_citation: "no eligibility policy exists: the gtld program registers to any buyer",
    barrier_verified_on: "2026-10-15",
    abuse_band: "high",
    abuse_citation:
      "spamhaus top-10 worst tlds snapshot via cisco community blocking " +
      "list (community.cisco.com/t5/network-security/), listed among " +
      "study, accountant, click, top, life, yokohama, ml",
    abuse_verified_on: "2026-10-14",
    price_observations: [],
    recheck_cadence_days: 180,
    honest_notes:
      "cited to an older spamhaus-sourced snapshot; not ranked in the " +
      "current interisle tables (below their size thresholds). the band " +
      "is a snapshot reading that predates the current dataset, recheck " +
      "against the live spamhaus chart per cadence",
  },
  {
    tld: ".accountant",
    registration_barrier: "open",
    barrier_citation: "no eligibility policy exists: the gtld program registers to any buyer",
    barrier_verified_on: "2026-10-15",
    abuse_band: "high",
    abuse_citation:
      "spamhaus top-10 worst tlds snapshot via cisco community blocking " +
      "list (community.cisco.com/t5/network-security/)",
    abuse_verified_on: "2026-10-14",
    price_observations: [],
    recheck_cadence_days: 180,
    honest_notes:
      "cited to an older spamhaus-sourced snapshot; not ranked in the " +
      "current interisle tables (below their size thresholds). recheck " +
      "against the live spamhaus chart per cadence",
  },
  {
    tld: ".ml",
    registration_barrier: "open",
    barrier_citation: "no eligibility policy exists: the gtld program registers to any buyer",
    barrier_verified_on: "2026-10-15",
    abuse_band: "high",
    abuse_citation:
      "spamhaus top-10 worst tlds snapshot via cisco community blocking " +
      "list (community.cisco.com/t5/network-security/)",
    abuse_verified_on: "2026-10-14",
    price_observations: [],
    recheck_cadence_days: 180,
    honest_notes:
      "historically a free-registry tld, pricing pressure in its purest " +
      "form; not ranked in the current interisle tables (below their " +
      "size thresholds). recheck per cadence",
  },
  {
    tld: ".dev",
    registration_barrier: "open",
    barrier_citation: "no eligibility policy exists: the gtld program registers to any buyer",
    barrier_verified_on: "2026-10-15",
    abuse_band: "unknown",
    abuse_citation:
      "not ranked in the interisle/cybercrimeinfocenter tables for the " +
      "current periods (read 2026-10-14), which threshold by tld size; " +
      "no dataset read yet places .dev's abuse share",
    abuse_verified_on: "2026-10-14",
    price_observations: [],
    recheck_cadence_days: 180,
    honest_notes:
      "google-registry tld with https enforced by hsts preload, which " +
      "raises the cost of phishing infrastructure: verified today from " +
      "dev.to/julianneagu's google-registry overview and " +
      "seo.domains' sourced .dev/.app guide. the preload fact is about " +
      "protocol, not registrants; the abuse band stays unknown until a " +
      "dataset ranks it",
  },  {
    tld: ".us",
    registration_barrier: "nexus_required",
    barrier_citation:
      "usTLD Nexus Requirements (ntia.gov usTLD policy PDF): a " +
      "registrant must be a us citizen, permanent resident, or a us " +
      "business/organization with a us nexus; cloudflare's registrar " +
      "docs confirm registrants identify their qualifying category. " +
      "read 2026-10-15",
    barrier_verified_on: "2026-10-15",
    abuse_band: "unknown",
    abuse_citation:
      "not ranked in the interisle top tables read 2026-10-14: the " +
      "tables are top-20 by count and rate and .us did not make the " +
      "cut, which is a coverage statement, never a safety claim",
    abuse_verified_on: "2026-10-14",
    price_observations: [],
    recheck_cadence_days: 180,
    honest_notes:
      "premierity: no sale price changes the barrier. a cheap .us " +
      "promo still runs through an attested us nexus, so the human " +
      "path here is shaped by eligibility, not economics. the honest " +
      "nuance: the nexus is attested by the registrant at most " +
      "registrars, an attestation is a raised cost of entry, not a " +
      "document check; what each registrar actually verifies is a " +
      "per-registrar fact for the registrar table",
  },
  {
    tld: ".ie",
    registration_barrier: "claim_required",
    barrier_citation:
      "IEDR registration and naming policy (iedr.ie policy PDF): a " +
      "documented claim of a real and substantive connection to " +
      "ireland, with supporting documentation whose expiry must be in " +
      "the future; the 2018 liberalisation removed the claim to the " +
      "name but kept the documented connection claim. read 2026-10-15",
    barrier_verified_on: "2026-10-15",
    abuse_band: "unknown",
    abuse_citation:
      "not ranked in the interisle top tables read 2026-10-14 " +
      "(coverage statement, never a safety claim)",
    abuse_verified_on: "2026-10-14",
    price_observations: [],
    recheck_cadence_days: 180,
    honest_notes:
      "the barrier is a document-checked claim, stronger than an " +
      "attestation: the registry checks the paperwork before the " +
      "domain goes live. cheap .ie promos, where they exist, still " +
      "require the claim, so price pressure alone cannot inflate " +
      "registrations here the way it can on an open tld",
  },
  {
    tld: ".de",
    registration_barrier: "presence_verified",
    barrier_citation:
      "DENIC verification for .de domains (denic.de: verification by " +
      "letter or email from DENIC); germany implemented the EU NIS2 " +
      "directive into national law effective 2025-12-06, imposing new " +
      "holder verification requirements on registration and " +
      "management of .de domains (IONOS help center, read 2026-10-15)",
    barrier_verified_on: "2026-10-15",
    abuse_band: "unknown",
    abuse_citation:
      "not ranked in the interisle top tables read 2026-10-14 " +
      "(coverage statement, never a safety claim)",
    abuse_verified_on: "2026-10-14",
    price_observations: [],
    recheck_cadence_days: 180,
    honest_notes:
      "the barrier is holder address verification under NIS2: the " +
      "registry verifies the registrant, not just takes an " +
      "attestation. the newest barrier in the registry (effective " +
      "2025-12-06) and the one most likely to keep changing; recheck " +
      "the policy at every cadence tick",
  },
  {
    tld: ".eu",
    registration_barrier: "residency_required",
    barrier_citation:
      "EURid eligibility (eurid help pages; gov.uk guidance): only " +
      "an eu/eea resident, citizen, or an organization established in " +
      "the eu/eea may register or renew .eu domains. read 2026-10-15",
    barrier_verified_on: "2026-10-15",
    abuse_band: "unknown",
    abuse_citation:
      "not ranked in the interisle top tables read 2026-10-14 " +
      "(coverage statement, never a safety claim)",
    abuse_verified_on: "2026-10-14",
    price_observations: [],
    recheck_cadence_days: 180,
    honest_notes:
      "the barrier is residency itself: no price opens it to a buyer " +
      "outside the eu/eea. residency restrictions shape who can " +
      "register at all, which is a different fact from whether " +
      "residents are more or less trustworthy; the row records the " +
      "gate, never a verdict about who is behind it",
  },
];

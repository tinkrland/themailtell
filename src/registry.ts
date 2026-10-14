// thetldradar registry table 0.1.0. one row per tld: an abuse band
// traced to a dataset snapshot, price observations traced to named
// registrars with their own observation dates. the twist is carried
// explicitly: interisle documents that phishers exploit cheap tlds,
// so promo pricing is radar evidence about registration economics.
// it is never proof about a registrant.
//
// row provenance: rows with abuse_verified_on were read from their
// cited sources on that date. rows with null are unverified seeds and
// say so in honest_notes.

import type { TldRiskEntry } from "./schema.js";

export const TLD_REGISTRY: TldRiskEntry[] = [
  {
    tld: ".xyz",
    abuse_band: "high",
    abuse_citation:
      "spamhaus 'the world's worst top level domains' top-10 list " +
      "(https://www.spamhaus.org/resource-hub/domain-reputation/), " +
      "recurring appearance in spamhaus worst-tld rankings; live chart " +
      "at https://www.spamhaus.org/reputation-statistics/",
    abuse_verified_on: null,
    price_observations: [],
    recheck_cadence_days: 180,
    honest_notes:
      "the canonical abused tld: appears repeatedly across spamhaus " +
      "worst-tld snapshots and industry reporting. unverified seed " +
      "today: read the live spamhaus chart before relying on the band. " +
      "cheap first-year pricing across registrars is part of its story",
  },
  {
    tld: ".top",
    abuse_band: "high",
    abuse_citation:
      "spamhaus top-10 worst tlds snapshot via cisco community blocking " +
      "list (community.cisco.com/t5/network-security/), listed among " +
      "study, accountant, party, click, life, yokohama, ml",
    abuse_verified_on: "2026-10-14",
    price_observations: [],
    recheck_cadence_days: 180,
    honest_notes:
      "verified today against a spamhaus-sourced snapshot of the " +
      "worst-tld list; the live chart moves, recheck per cadence. one " +
      "of the classic cheap-and-abused tlds",
  },
  {
    tld: ".click",
    abuse_band: "high",
    abuse_citation:
      "spamhaus top-10 worst tlds snapshot via cisco community blocking " +
      "list (community.cisco.com/t5/network-security/)",
    abuse_verified_on: "2026-10-14",
    price_observations: [],
    recheck_cadence_days: 180,
    honest_notes:
      "verified today against a spamhaus-sourced snapshot; the live " +
      "chart moves, recheck per cadence",
  },
  {
    tld: ".party",
    abuse_band: "high",
    abuse_citation:
      "spamhaus top-10 worst tlds snapshot via cisco community blocking " +
      "list (community.cisco.com/t5/network-security/)",
    abuse_verified_on: "2026-10-14",
    price_observations: [],
    recheck_cadence_days: 180,
    honest_notes:
      "verified today against a spamhaus-sourced snapshot; the live " +
      "chart moves, recheck per cadence",
  },
  {
    tld: ".accountant",
    abuse_band: "high",
    abuse_citation:
      "spamhaus top-10 worst tlds snapshot via cisco community blocking " +
      "list (community.cisco.com/t5/network-security/)",
    abuse_verified_on: "2026-10-14",
    price_observations: [],
    recheck_cadence_days: 180,
    honest_notes:
      "verified today against a spamhaus-sourced snapshot; the live " +
      "chart moves, recheck per cadence",
  },
  {
    tld: ".com",
    abuse_band: "low",
    abuse_citation:
      "suped.com blocklist overview (six-month dataset: .com carries the " +
      "most malicious domains by raw count); csc 'the highest threat tlds' " +
      "series for the share-vs-count distinction",
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
      "malicious-domain count because it is the largest tld; by share " +
      "it is ordinary. spaceship's ~$2.90 first-year promo does not " +
      "make .com an abuse tld, and that is exactly why rate and count " +
      "are never conflated here",
  },
  {
    tld: ".ltd",
    abuse_band: "unknown",
    abuse_citation: "none read yet",
    abuse_verified_on: null,
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
    ],
    recheck_cadence_days: 90,
    honest_notes:
      "the twist row: a $4 first year against a $25.04 renewal is " +
      "churn-driven registration economics, exactly the cheap-year " +
      "pattern interisle documents phishers exploiting (top 27 " +
      "highest-abuse tlds priced at us$2 or less; 51% of abusive " +
      "registrations in the new gtlds). price pressure raises a prior " +
      "about economics; abuse_band stays unknown until a dataset is " +
      "read, because a cheap promo alone proves nothing about abuse",
  },
  {
    tld: ".ml",
    abuse_band: "high",
    abuse_citation:
      "spamhaus top-10 worst tlds snapshot via cisco community blocking " +
      "list (community.cisco.com/t5/network-security/)",
    abuse_verified_on: "2026-10-14",
    price_observations: [],
    recheck_cadence_days: 180,
    honest_notes:
      "verified today against a spamhaus-sourced snapshot; historically " +
      "a free-registry tld, which is pricing pressure in its purest form",
  },
  {
    tld: ".dev",
    abuse_band: "low",
    abuse_citation:
      "registry policy (HSTS preload) at https://nic.dev/ (to verify)",
    abuse_verified_on: null,
    price_observations: [],
    recheck_cadence_days: 180,
    honest_notes:
      "unverified seed from general knowledge: google-registry tld with " +
      "https enforced by hsts preload, which raises the cost of " +
      "phishing infrastructure. verify the abuse band against a " +
      "dataset and the policy at the registry before relying",
  },
];

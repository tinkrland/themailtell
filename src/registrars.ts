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
  },  {
    registrar: "gen.xyz",
    kind: "registry_storefront",
    sale_pattern: "unknown",
    payment_privacy: "not verified in this pass",
    ownership_note:
      "the .xyz registry's own direct storefront: the same organization " +
      "sets the tld's wholesale pricing and sells retail here, so the " +
      ".xyz row in the tld registry and this storefront row trace to " +
      "one registry",
    citation:
      "https://gen.xyz/pricing (default price $15 per year to create, " +
      "renew, and transfer, including the icann fee; read via research " +
      "pass 2026-10-15), https://gen.xyz/account/knowledgebase.php " +
      "(registry claims fraud detection software against malicious " +
      "registrations). gen.xyz is cloudflare-gated to direct automated " +
      "reads today, observed 2026-10-15, so both readings came through " +
      "a search cache, re-verify in a browser",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "the registry storefront: one organization on both sides of the " +
      "wholesale/retail line for .xyz, which is the vertical integration " +
      "the boutique-registrar story misses. its own knowledgebase " +
      "claims fraud detection software, and that claim is recorded as a " +
      "claim. standard .xyz sales are open registration: no content " +
      "requirements, no mandatory audits, standard gtld policy, per " +
      "tld-list's verified reading today",
  },  {
    registrar: "get.tech",
    kind: "registry_storefront",
    sale_pattern: "unknown",
    payment_privacy: "not verified in this pass",
    ownership_note:
      "radix registry's direct storefront for .tech: radix markets " +
      "itself as one of the world's largest portfolio registries, " +
      "and get.tech answers 'how do I get a .tech domain' with " +
      "'you can get it right here'",
    citation:
      "https://get.tech/ and https://radix.website/ (read via " +
      "research pass 2026-10-15)",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "a second registry storefront beside gen.xyz: the registry that " +
      "sets .tech wholesale pricing also retails it directly. sale " +
      "pattern not characterized in this pass; read get.tech's own " +
      "pricing before relying",
  },
  {
    registrar: "Gandi",
    kind: "consumer_boutique",
    sale_pattern: "unknown",
    payment_privacy: "not verified in this pass",
    ownership_note: "long-standing french registrar (not verified in this pass)",
    citation:
      "https://www.gandi.net/en-GB/domain/tld (own pricing page read " +
      "via research pass 2026-10-15: per-tld creation, transfer, " +
      "renewal, owner-change and restore prices in five transparent " +
      "columns, promo marks on some creation prices)",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "the transparent-pricing end of the boutique spectrum: renewal " +
      "prices are published per tld rather than discovered at the " +
      "renewal charge, which lowers the churn-cliff signal even where " +
      "promo creation prices exist. verify ownership and crypto " +
      "acceptance at the next cadence tick",
  },
  {
    registrar: "Sav",
    kind: "consumer_boutique",
    sale_pattern: "first_year_sales",
    payment_privacy: "not verified in this pass",
    ownership_note: "not verified in this pass",
    citation:
      "https://tld-list.com/registrars/sav (read 2026-10-15: " +
      "'extensions on sav prices from $0.65' across 527 tlds), " +
      "https://www.whtop.com/review/sav.com (third-party review, " +
      "2fa required for sign-in and key actions)",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "the deepest discount rack found in this pass: some extensions " +
      "from $0.65, well under the interisle us$2-or-less abuse-price " +
      "zone's floor. read from a third-party price aggregator, not " +
      "sav's own pages; verify at the registrar before relying on " +
      "specific prices. named by the owner as a registrar to carry",
  },
  {
    registrar: "Unstoppable Domains",
    kind: "web3_naming",
    sale_pattern: "none",
    payment_privacy: "not verified in this pass; web3 rails imply crypto payment",
    ownership_note:
      "'the #1 provider of nft domains' (its own github org readme, " +
      "read 2026-10-15)",
    citation:
      "https://github.com/unstoppabledomains (own readme), " +
      "https://support.unstoppabledomains.com/support/solutions/articles/48001283098 " +
      "(own support: expired domains not renewed during the grace " +
      "period may be listed in its expired auctions marketplace)",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "web3 naming is a different instrument from dns: nft domains " +
      "minted on-chain, one-time purchase, no renewal cliff, so the " +
      "sale-churn economics of this table do not apply. the honest " +
      "tension is carried verbatim: the marketing says own-forever, " +
      "while its own support describes expired-domain auctions with " +
      "grace periods. resolution is not dns: web3 names need browser " +
      "or extension support, so their abuse path runs through where " +
      "they do resolve",
  },  {
    registrar: "FlokiNET",
    kind: "consumer_boutique",
    sale_pattern: "unknown",
    payment_privacy: "accepts cryptocurrency (privacy community vetting)",
    ownership_note:
      "iceland-based, founded by activists and digital rights " +
      "advocates (its own site, read via research pass 2026-10-15)",
    citation:
      "https://flokinet.is/privacy (own site, read 2026-10-15), " +
      "http://www.privacytools.io/private-hosting (community vetting)",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "community-sourced: privacy-first iceland registrar-host, " +
      "bitcoin-accepting, surfaced by the privacytools crowd rather " +
      "than seo. not a buffer: the registrant owns the domain, " +
      "unlike njalla. records architecture, never the user",
  },
  {
    registrar: "1984 Hosting",
    kind: "consumer_boutique",
    sale_pattern: "unknown",
    payment_privacy: "accepts cryptocurrency (privacy community vetting)",
    ownership_note: "iceland-based privacy-first host and registrar (not verified in this pass)",
    citation:
      "http://www.privacytools.io/private-hosting (community vetting, " +
      "read 2026-10-15), https://1984.hosting/ (to verify)",
    verified_on: null,
    recheck_cadence_days: 90,
    honest_notes:
      "unverified seed from the community pass: the iceland privacy " +
      "registrar named by the privacytools crowd. verify against its " +
      "own pages before relying on any field of this row",
  },  {
    registrar: "Hover",
    kind: "consumer_boutique",
    sale_pattern: "unknown",
    payment_privacy: "not verified in this pass",
    ownership_note:
      "subsidiary of tucows inc., one of the oldest and third-largest " +
      "icann-accredited registrars (third-party reviews, read " +
      "2026-10-15); launched 2009, toronto",
    citation:
      "https://support.hover.com/support/solutions/articles/201000064738 " +
      "(own support: gdpr redaction of registration data for " +
      "applicable domains, read via research pass 2026-10-15), " +
      "https://www.traffictsunami.com/?p=3839 and " +
      "https://pricingsaas.com/companies/hover (third-party profiles)",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "owner-named, community-familiar consumer registrar under a " +
      "large icann parent. read via own support page plus third-party " +
      "profiles, not a full pricing read: verify pricing and payment " +
      "rails before relying. records architecture, never the user",
  },
];

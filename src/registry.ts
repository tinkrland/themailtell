// theccradar registry table 0.1.0. one row per payment instrument:
// kind, kyc posture, kyc scope, funding anonymity, caps, each cited
// and dated. a row is a fact about the tether behind the money,
// never a verdict about the spender.
//
// row provenance: rows with verified_on were read from their cited
// sources on that date. rows with null are unverified seeds and say
// so in honest_notes.

import type { PaymentInstrumentEntry } from "./schema.js";

export const INSTRUMENT_REGISTRY: PaymentInstrumentEntry[] = [
  {
    instrument: "Visa gift card",
    provider: "giftcards.com",
    kind: "retail_gift_card",
    card_network: "visa",
    number_rotation: "static",
    kyc_posture: "registration_only",
    kyc_scope:
      "card registration asks for a billing address or zip to enable " +
      "online use (giftcards.com's own FAQ: 'how do I register my Visa " +
      "or Mastercard gift card'); no identity documents for the card's " +
      "user, and the card is transferable by design, it is a gift",
    jurisdiction: "us",
    issuance_scope: "unknown",
    funding_anonymity:
      "bought online with a payment method, so the buyer leaves a " +
      "purchase trail with the issuer site, or bought at retail with " +
      "cash; the user of the card at the merchant is not the " +
      "necessarily the buyer, and nothing ties the user to an identity",
    caps: "fixed face value, spend down to zero; reloadability varies by product line (verify per card)",
    citation:
      "https://www.giftcards.com/us/en/trust/faq and " +
      "https://www.giftcards.com/us/en/blog/how-to-activate-giftcards " +
      "(issuer's own pages, read via research pass 2026-10-15)",
    verified_on: "2026-10-15",
    recheck_cadence_days: 180,
    honest_notes:
      "activation and registration are friction, not kyc: a zip code " +
      "is not an identity. the instrument is anonymous for its user by " +
      "design, which is a fact about the tether. gift cards are among " +
      "the most-gifted objects in the world; the row is not a verdict " +
      "about anyone holding one",
  },
  {
    instrument: "Privacy virtual card",
    provider: "Privacy.com",
    kind: "bank_linked_virtual_card",
    card_network: "unknown",
    number_rotation: "on_demand",
    kyc_posture: "full_kyc",
    kyc_scope:
      "issuer's own page: 'some personal information is required for a " +
      "mandatory bank verification procedure called Know Your Customer " +
      "(KYC) that must be conducted before our customers can start " +
      "using our Privacy virtual cards'; the same page states privacy " +
      "never conducts credit pulls",
    jurisdiction: "us",
    issuance_scope: "us_resident_only",
    funding_anonymity:
      "tethered to a us bank account: the virtual number shields the " +
      "merchant from the real card, not the bank from the customer. the " +
      "instrument is privacy against merchant-side leaks, with a " +
      "verified identity behind it. the holder can mint a fresh number " +
      "per website and pause or close cards at will (the issuer's own " +
      "marketing: 'get a new card number for every website you shop " +
      "with'), which is also the free-trial-recycling capability",
    caps: "not read in this pass",
    citation:
      "https://www.privacy.com/ (issuer's own pages, read via research " +
      "pass 2026-10-15)",
    verified_on: "2026-10-15",
    recheck_cadence_days: 180,
    honest_notes:
      "the row that proves kyc and privacy are not opposites: privacy.com " +
      "is a privacy tool that runs on full kyc, protecting card numbers " +
      "from merchants while the bank knows the customer. a different " +
      "point on the radar from an anonymous instrument, and both are " +
      "legitimate",
  },
  {
    instrument: "Pockets prepaid wallet",
    provider: "ICICI Bank (Pockets)",
    kind: "regulated_prepaid_wallet",
    card_network: "unknown",
    number_rotation: "static",
    kyc_posture: "limited_kyc_ladder",
    kyc_scope:
      "RBI master directions on prepaid payment instruments govern the " +
      "instrument: minimum-detail PPIs carry small caps, and ICICI's " +
      "own pages distinguish limited-kyc from full-kyc prepaid cards " +
      "with a ladder between them. the 2018 kyc deadline (hindustan " +
      "times, feb 2018) forced existing wallet users to complete kyc " +
      "or lose wallet use",
    jurisdiction: "india",
    issuance_scope: "india_resident_only",
    funding_anonymity:
      "a bank-issued wallet reachable with less identity than a bank " +
      "account at the minimum-detail tier, funded from cards, bank and " +
      "upi; the app also carries upi send/collect via a virtual " +
      "payment address",
    caps:
      "loadable up to rs 10,000 in a month under minimum details, per " +
      "ICICI's own Pockets pages read 2026-10-15; full-kyc tiers above " +
      "that (verify current caps against RBI's directions)",
    citation:
      "https://www.icicibank.com/personal-banking/bank-wallet/pockets/ " +
      "(own pages, read via research pass 2026-10-15), " +
      "https://www.icici.bank.in/personal-banking/cards/prepaid-card/prepaid-card-faqs " +
      "(limited vs full kyc), https://www.hindustantimes.com/business-news/ " +
      "kyc-for-mobile-wallets coverage (feb 2018), " +
      "https://www.pwc.in/industries/financial-services/fintech/payments/ppi-interoperability " +
      "(on the master directions)",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "the regulator built the ladder into law: anonymity priced in " +
      "caps, with full kyc above. RBI directions move, so this row " +
      "carries a fast recheck cadence. a pockets wallet is many " +
      "people's first banking product; the row describes the tether " +
      "the regulator designed, never the holder",
  },
  {
    instrument: "direct crypto payment",
    provider: "public blockchains",
    kind: "web3_direct_payment",
    card_network: "none",
    number_rotation: "none",
    kyc_posture: "no_kyc_by_design",
    kyc_scope:
      "on-chain transfers carry no instrument-level identity by " +
      "protocol design; the kyc lives at the fiat on-ramps and " +
      "off-ramps, not in the payment itself. chain analysis can " +
      "link addresses, which is a different fact from kyc",
    jurisdiction: "global",
    issuance_scope: "global",
    funding_anonymity:
      "self-custodied funds move with no issuer in the middle; " +
      "caveat: buying crypto with a card or bank passes through " +
      "kyc'd on-ramps, so the anonymous tier starts after the ramp",
    caps: "none at protocol level",
    citation: "to verify: blockchain protocol documentation and on-ramp KYC policies",
    verified_on: null,
    recheck_cadence_days: 180,
    honest_notes:
      "unverified seed: the protocol-level claim is well-known but " +
      "was not verified from primary documentation in this pass. " +
      "verify the on-ramp and off-ramp kyc claims before relying. " +
      "included as the far end of the scale the other rows anchor",
  },  {
    instrument: "Pockit prepaid account and card",
    provider: "Pockit",
    kind: "regulated_prepaid_wallet",
    card_network: "mastercard",
    number_rotation: "static",
    kyc_posture: "full_kyc",
    kyc_scope:
      "uk e-money account under uk AML rules: identity checks exist, " +
      "but registration requires little personal information (finder " +
      "review, read 2026-10-15), there is no credit check ('get your " +
      "card no matter your credit history', the provider's own site), " +
      "and the account is marketed to people banks decline, including " +
      "a dedicated youth card",
    jurisdiction: "uk",
    issuance_scope: "uk_resident_only",
    funding_anonymity:
      "bank-transfer, card and cash-adjacent funding at a uk e-money " +
      "issuer; the tether is lighter-friction than a bank account but " +
      "is a real uk-regulated tether, not an anonymous instrument",
    caps: "up to gbp 10,000 on the account (the provider's play store listing, read 2026-10-15)",
    citation:
      "https://hello.pockit.com/card/everyday (own site, read via " +
      "research pass 2026-10-15), https://www.finder.com/uk/digital-banking/pockit-review, " +
      "https://play.google.com/store/apps/details?id=com.pockit.mobile.android",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "the technically-mastercard row the scale needed: the card rides " +
      "the mastercard network and is accepted 'wherever you see the " +
      "mastercard sign' (own site), so the merchant sees mastercard " +
      "while the issuer holds a light-friction e-money tether. the " +
      "network logo is never the tether, which is the point. pockit's " +
      "whole legitimate market is the underbanked and the thin-file, " +
      "and the row records the tether, never the cardholder",
  },  {
    instrument: "fixed-balance crypto-funded prepaid card",
    provider: "Ezzocard",
    kind: "crypto_funded_prepaid_card",
    card_network: "unknown",
    number_rotation: "static",
    kyc_posture: "no_kyc_observed",
    kyc_scope:
      "per third-party reporting (izipay comparison, read 2026-10-15): " +
      "selling prepaid virtual cards since 2016 with no kyc at all, " +
      "bought with crypto, fixed balance with the fee in the price. " +
      "the provider's own site was not read in this pass",
    jurisdiction: "unknown",
    issuance_scope: "global",
    funding_anonymity:
      "crypto-funded by design: the card is bought with crypto and " +
      "spent down, so the tether sits at the crypto on-ramp, not at " +
      "the card issuer",
    caps: "fixed face value per card, spend down to zero",
    citation:
      "https://izipay.me/blog/best-crypto-card-no-kyc-2026 (read " +
      "2026-10-15), https://www.ucardcrypto.com/best-crypto-cards-with-no-kyc-2026/ " +
      "(second comparison), https://discuss.grapheneos.org/d/36096 " +
      "(community thread asking the grapheneos forum exactly about " +
      "these cards: experiences, fees, vpn policies), provider site to verify",
    verified_on: null,
    recheck_cadence_days: 90,
    honest_notes:
      "community-sourced row: the instrument the privacy forums " +
      "actually discuss for everyday no-kyc spending, surfaced by " +
      "scanning grapheneos and no-kyc roundups rather than seo. " +
      "recorded from reporting, not from the provider's own pages, so " +
      "the honest ceiling is what reporting says, and this no-kyc " +
      "card ecosystem churns fast: recheck at every cadence tick. the " +
      "row is the tether, never the spender",
  },  {
    instrument: "Halocard virtual card",
    provider: "Halocard",
    kind: "prepaid_card_platform",
    card_network: "visa",
    number_rotation: "on_demand",
    kyc_posture: "full_kyc",
    kyc_scope:
      "the issuer's own pages: identity check with a national id card " +
      "and a selfie, usually under 3 minutes; us residents may be " +
      "asked for an ssn or itin. funding via debit or credit card, " +
      "apple pay, google pay, bank transfer, stablecoins (usdc, usdt) " +
      "or crypto (btc, eth, sol)",
    jurisdiction: "us-issued, global membership",
    issuance_scope: "global",
    funding_anonymity:
      "not anonymous: a real identity check stands behind every card. " +
      "the privacy model is per-card control, not issuer blindness: " +
      "lock or cancel any card, and set the billing address per card " +
      "yourself ('merchants verify against what you set, not against " +
      "where you live', the issuer's own words)",
    caps: "not read in this pass",
    citation:
      "https://halocard.co/ (own homepage schema and support pages, " +
      "read directly 2026-10-15): 'us-issued visa cards to consumers " +
      "and businesses around the world', custom billing address per " +
      "card, per-card lock and cancel",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "the global-us-card axis made explicit: a us-issued visa a " +
      "non-us person can hold, the exact capability privacy.com " +
      "cannot serve, and the issuer's own description is the " +
      "citation. most holders are in good faith: paying for us " +
      "services unavailable in their region is ordinary. kyc exists, " +
      "so the tether is the issuer; the capability is the card's " +
      "geography, and the row records both",
  },
  {
    instrument: "MySudo virtual card",
    provider: "MySudo (Anonyome)",
    kind: "prepaid_card_platform",
    card_network: "mastercard",
    number_rotation: "unknown",
    kyc_posture: "unknown",
    kyc_scope:
      "not verified in this pass; the privacy app itself is the " +
      "known product",
    jurisdiction: "us",
    issuance_scope: "us_resident_only",
    funding_anonymity: "not read in this pass",
    caps: "not read in this pass",
    citation:
      "https://support.mysudo.com/hc/en-us/articles/360041302414-Do-virtual-cards-work-worldwide " +
      "and 360041302294 (issuer's own FAQs, read via research pass " +
      "2026-10-15): virtual cards available to us-based users, for " +
      "us-based merchants, in us dollars only, wherever mastercard is " +
      "accepted",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "owner-named as a global card option, and its own faq is the " +
      "honest correction recorded verbatim: us-based users, us " +
      "merchants, usd only. the row records what the issuer says, " +
      "which is the discipline",
  },
  {
    instrument: "Cloaked virtual card",
    provider: "Cloaked",
    kind: "prepaid_card_platform",
    card_network: "unknown",
    number_rotation: "unknown",
    kyc_posture: "unknown",
    kyc_scope: "not verified in this pass",
    jurisdiction: "unknown",
    issuance_scope: "global",
    funding_anonymity: "not read in this pass",
    caps: "not read in this pass",
    citation:
      "owner-named 2026-10-15 (community knowledge), https://cloaked.app/ " +
      "to verify",
    verified_on: null,
    recheck_cadence_days: 90,
    honest_notes:
      "unverified seed from the owner's community knowledge, " +
      "surfaced with the global-us-card group: verify against its own " +
      "pages before relying on any field",
  },
  {
    instrument: "Ucards virtual card",
    provider: "Ucards",
    kind: "prepaid_card_platform",
    card_network: "unknown",
    number_rotation: "unknown",
    kyc_posture: "unknown",
    kyc_scope: "not verified in this pass",
    jurisdiction: "unknown",
    issuance_scope: "global",
    funding_anonymity: "not read in this pass",
    caps: "not read in this pass",
    citation: "owner-named 2026-10-15 (community knowledge), to research and verify",
    verified_on: null,
    recheck_cadence_days: 90,
    honest_notes:
      "unverified seed from the owner's community knowledge, named " +
      "with the global-us-card group: no primary source found in the " +
      "pass that looked, which is itself recorded. verify before " +
      "relying",
  },
];

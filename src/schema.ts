// theccradar schema 0.1.0. the entry shape for the payment instrument
// registry: what identity stands behind the money, cited and dated.
// unknown is first-class; registration is never conflated with kyc
export const SCHEMA_VERSION = "0.4.0";
// 0.4.0: issuance_scope and the prepaid_card_platform kind. the
// capability privacy.com cannot serve: a us-issued card available to
// a non-us person, which is how global users reach us-card-only
// onboarding, mostly in good faith
// 0.3.0: crypto_funded_prepaid_card kind. fixed-balance virtual cards
// bought with crypto and no kyc: the community's no-kyc spending
// instrument, distinct from gift cards and bank-tethered masking
// 0.2.0: card_network and number_rotation. an instrument can ride the
// visa/mastercard rails while the tether behind it is an e-money
// issuer with light friction: the network logo is never the tether.
// and the consumer-abuse axis is not "no kyc" (aml reaches nearly
// every payment rail) but number rotation: can the holder mint a
// fresh number, which is what recycles free trials

export type InstrumentKind =
  // retail gift cards: fixed face value, transferable, no identity
  // for the user
  | "retail_gift_card"
  // issuer-verified virtual cards tethered to a bank account
  | "bank_linked_virtual_card"
  // regulator-governed prepaid wallets, often with a kyc ladder
  | "regulated_prepaid_wallet"
  // on-chain payment rails with no instrument-level identity
  | "web3_direct_payment"
  // fixed-balance virtual cards bought with crypto, no issuer kyc
  | "crypto_funded_prepaid_card"
  // balance-funded virtual card platforms with their own identity
  // check: privacy.com-like issuers, some global
  | "prepaid_card_platform"
  | "unknown";

export type CardNetwork =
  | "visa"
  | "mastercard"
  | "none"
  | "unknown";

export type NumberRotation =
  // the holder can mint fresh numbers at will (per website, pausable)
  | "on_demand"
  // one fixed number for the life of the instrument
  | "static"
  // no card number at all
  | "none"
  | "unknown";

export type IssuanceScope =
  | "us_resident_only"
  | "uk_resident_only"
  | "india_resident_only"
  // a us-issued card a non-us person can hold
  | "global"
  | "unknown";

export type KycPosture =
  // issuer verified the account holder before first use
  | "full_kyc"
  // a regulator-capped low-identity tier with a documented ladder above
  | "limited_kyc_ladder"
  // a billing zip or address, which is friction, not an identity
  | "registration_only"
  // no verification at all for the user of the instrument
  | "no_kyc_by_design"
  // no verification found in the pass that read the sources
  | "no_kyc_observed"
  | "unknown";

export interface PaymentInstrumentEntry {
  // external names keep exact case
  instrument: string;
  provider: string;
  kind: InstrumentKind;
  // the network the instrument rides: the logo is not the tether
  card_network: CardNetwork;
  // can the holder mint fresh numbers: the free-trial-recycling axis
  number_rotation: NumberRotation;
  kyc_posture: KycPosture;
  // what is verified, by whom, under which regulation
  kyc_scope: string;
  jurisdiction: string;
  // who can actually hold the instrument: the global-us-card axis
  issuance_scope: IssuanceScope;
  // funding rails as published: cash, cards, bank, crypto
  funding_anonymity: string;
  // load and spend caps as published, with their source
  caps: string;
  citation: string;
  // null = unverified seed: flagged for verification, never relied on
  verified_on: string | null;
  recheck_cadence_days: number;
  honest_notes: string;
}

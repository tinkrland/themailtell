// theccradar schema 0.1.0. the entry shape for the payment instrument
// registry: what identity stands behind the money, cited and dated.
// unknown is first-class; registration is never conflated with kyc
export const SCHEMA_VERSION = "0.1.0";

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
  | "unknown";

export interface PaymentInstrumentEntry {
  // external names keep exact case
  instrument: string;
  provider: string;
  kind: InstrumentKind;
  kyc_posture: KycPosture;
  // what is verified, by whom, under which regulation
  kyc_scope: string;
  jurisdiction: string;
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

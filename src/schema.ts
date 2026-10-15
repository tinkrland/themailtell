// thevoipradar schema 0.1.0. the entry shape for the voip provider
// registry: tier, kyc posture, kyc scope, market, cited and dated.
// unknown is first-class; observed absence is recorded as observed
// absence, never as proof
export const SCHEMA_VERSION = "0.3.0";
// 0.3.0: public_sms_receiver tier. the phone analog of a public
// disposable inbox: shared numbers whose sms land in public view, the
// most disposable layer of the onboarding stack
// 0.2.0: payment_privacy joins the axes, because the payment rail is
// part of the anonymity path: crypto buys with no card trail are a
// different fact from card billing, whatever the kyc posture says

export type ProviderTier =
  // the pipes: carries numbers others resell (twilio, bandwidth)
  | "upstream_carrier"
  // consumer storefront selling numbers, often riding upstream pipes
  | "retail_front"
  // end-user product with an app in front
  | "consumer_app"
  // shared public numbers whose incoming sms are publicly visible
  | "public_sms_receiver";

export type KycPosture =
  // documents or identity verification required for the covered scope
  | "kyc_required"
  // an account and a payment method, no documents
  | "identity_light"
  // no verification found in the pass that read the provider's pages
  | "no_kyc_observed"
  | "unknown";

export interface VoipProviderEntry {
  // external names keep exact case
  provider: string;
  tier: ProviderTier;
  kyc_posture: KycPosture;
  // what is verified, for which product, in which jurisdiction
  kyc_scope: string;
  market: string;
  // payment rails as the provider's own pages or reporting carry them;
  // owner-reported facts are marked owner-reported until verified
  payment_privacy: string;
  citation: string;
  // null = unverified seed: flagged for verification, never relied on
  verified_on: string | null;
  recheck_cadence_days: number;
  honest_notes: string;
}

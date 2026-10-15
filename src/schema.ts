// thevoipradar schema 0.1.0. the entry shape for the voip provider
// registry: tier, kyc posture, kyc scope, market, cited and dated.
// unknown is first-class; observed absence is recorded as observed
// absence, never as proof
export const SCHEMA_VERSION = "0.5.0";
// 0.5.0: client_model. voip providers differ in how you consume the
// number: turnkey providers ship the dialer (an app, or a web client
// like fanytel's), while byod storefronts hand you sip credentials
// and you bring your own client: linphone, zoiper, 3cx, asterisk,
// an ata. the axis is the technical barrier, a capability fact: a
// web dialer is minutes from signup to call, a sip trunk is a
// configuration step that self-selects for technical users
// 0.4.0: us_sms_capability. many cpaaS and voip stacks cannot deliver
// sms to us numbers at all (a2p compliance) while calls work fine,
// and platforms that offer voice-call otp let a voice-only number
// complete verification anyway. capability, never accusation
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

export type UsSmsCapability =
  // can send and receive us sms (subject to each provider's rules)
  | "sms_supported"
  // calls work, us sms does not: the a2p wall
  | "voice_only"
  // a shared public receive-only inbox
  | "receive_only"
  | "unknown";

export type KycPosture =
  // documents or identity verification required for the covered scope
  | "kyc_required"
  // an account and a payment method, no documents
  | "identity_light"
  // no verification found in the pass that read the provider's pages
  | "no_kyc_observed"
  | "unknown";

export type ClientModel =
  // provider ships the client: a phone app, signup to call in minutes
  | "turnkey_app"
  // provider ships a web dialer, no install at all
  | "turnkey_web"
  // sip credentials and the user brings a client: linphone, zoiper,
  // 3cx, asterisk, an ata. the trunking-and-client class
  | "sip_credentials"
  // consumed programmatically: api and trunking, developer-facing
  | "api_trunk"
  // the number arrives as an esim profile, no client at all
  | "esim"
  // rides an xmpp jabber client
  | "xmpp"
  | "unknown";

export interface VoipProviderEntry {
  // external names keep exact case
  provider: string;
  tier: ProviderTier;
  // how the number is consumed: the technical barrier axis
  client_model: ClientModel;
  kyc_posture: KycPosture;
  // what is verified, for which product, in which jurisdiction
  kyc_scope: string;
  market: string;
  // payment rails as the provider's own pages or reporting carry them;
  // owner-reported facts are marked owner-reported until verified
  payment_privacy: string;
  // whether the provider's us numbers can do sms at all, or voice only
  us_sms_capability: UsSmsCapability;
  citation: string;
  // null = unverified seed: flagged for verification, never relied on
  verified_on: string | null;
  recheck_cadence_days: number;
  honest_notes: string;
}

// theproviderradar schema 0.1.0. the entry shape for the provider risk
// registry: attributes about a provider's published architecture and
// posture, each of which a row must cite. unknown is first-class and
// recorded with its reason, never guessed
export const SCHEMA_VERSION = "0.3.0";
// 0.3.0: account_age_signal. providers rarely expose creation dates,
// but some expose era bounds: the domain part of an address often
// cannot predate a known launch or rebrand, and free tiers often
// delete inactive accounts on a published schedule. bounds, never
// dates; a fresh account and a longstanding one read differently,
// and neither is a verdict about the person
// 0.2.0: content_access gains public_inboxes_by_design, because
// mailinator's own documentation says its inboxes are in the public
// domain, readable by anyone: which is a different fact from
// provider-accessible, and conflating them would be a lie

export type ProviderKind =
  | "privacy_provider"
  | "mainstream_provider"
  | "disposable_provider"
  | "relay_or_forwarder";

export type ContentAccess =
  // mail is zero-access encrypted or end-to-end encrypted by default,
  // per the provider's own published architecture
  | "zero_access_or_e2e_by_default"
  // end-to-end encryption exists but is off by default or requires setup
  | "e2e_available_optional"
  // mail content is accessible to the provider by default
  | "provider_accessible_by_default"
  // inboxes are public: readable by anyone, per the provider's own
  // documentation, not just by the provider
  | "public_inboxes_by_design"
  | "unknown";

export type TransparencyPosture =
  | "publishes_transparency_report"
  | "publishes_none"
  | "unknown";

export type AbusePosture =
  // inboxes are public, short-lived, or otherwise abuse-cheap by design
  | "disposable_by_design"
  // a mainstream provider operating an abuse desk
  | "mainstream_abuse_desk"
  | "unknown";

export interface ProviderRiskEntry {
  // external names keep exact case
  provider: string;
  kind: ProviderKind;
  content_access: ContentAccess;
  transparency: TransparencyPosture;
  abuse_posture: AbusePosture;
  jurisdiction: string;
  // what era/age signals the provider's addresses honestly expose,
  // cited: domain-era bounds, inactivity-deletion policies, or
  // "meaningless by design" for disposables
  account_age_signal: string;
  citation: string;
  // null = unverified seed: flagged for verification, never relied on
  verified_on: string | null;
  recheck_cadence_days: number;
  honest_notes: string;
}

// theproviderradar schema 0.1.0. the entry shape for the provider risk
// registry: attributes about a provider's published architecture and
// posture, each of which a row must cite. unknown is first-class and
// recorded with its reason, never guessed
export const SCHEMA_VERSION = "0.1.0";

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
  citation: string;
  // null = unverified seed: flagged for verification, never relied on
  verified_on: string | null;
  recheck_cadence_days: number;
  honest_notes: string;
}

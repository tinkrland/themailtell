// theproviderradar registry table 0.1.0. one row per provider, every
// attribute cited and dated, recheck cadences attached, honest notes
// carried verbatim. a row is a set of facts about a provider, never a
// verdict about any sender using it: infrastructure is not intent.
//
// row provenance: rows with verified_on were read from their cited
// pages on that date. rows with verified_on: null are unverified seeds
// from general knowledge and say so in their honest_notes; they are
// flagged for verification, never relied on.

import type { ProviderRiskEntry } from "./schema.js";

export const PROVIDER_REGISTRY: ProviderRiskEntry[] = [
  {
    provider: "Proton Mail",
    kind: "privacy_provider",
    content_access: "zero_access_or_e2e_by_default",
    transparency: "publishes_transparency_report",
    abuse_posture: "mainstream_abuse_desk",
    jurisdiction: "Switzerland",
    citation:
      "https://proton.me/mail/security (zero-access architecture), " +
      "https://proton.me/legal/transparency (transparency report), " +
      "https://proton.me/blog/switzerland (jurisdiction analysis)",
    verified_on: "2026-10-14",
    recheck_cadence_days: 180,
    honest_notes:
      "read from proton's own pages on 2026-10-14: zero-access plus " +
      "end-to-end encryption between proton accounts, aggregate swiss " +
      "legal-order statistics published. sits at the privacy end of the " +
      "radar on architecture, not on the character of its users",
  },
  {
    provider: "Tuta",
    kind: "privacy_provider",
    content_access: "zero_access_or_e2e_by_default",
    transparency: "unknown",
    abuse_posture: "mainstream_abuse_desk",
    jurisdiction: "Germany",
    citation: "https://tuta.com/security (to verify)",
    verified_on: null,
    recheck_cadence_days: 180,
    honest_notes:
      "unverified seed from general knowledge: encrypted mailbox " +
      "provider based in germany. verify every attribute against the " +
      "cited page before relying on this row",
  },
  {
    provider: "Gmail",
    kind: "mainstream_provider",
    content_access: "provider_accessible_by_default",
    transparency: "publishes_transparency_report",
    abuse_posture: "mainstream_abuse_desk",
    jurisdiction: "United States",
    citation: "https://transparencyreport.google.com (to verify)",
    verified_on: null,
    recheck_cadence_days: 180,
    honest_notes:
      "unverified seed from general knowledge: content accessible to " +
      "the provider by default, not end-to-end encrypted by default; " +
      "google publishes a transparency report. verify against citations",
  },
  {
    provider: "Outlook.com",
    kind: "mainstream_provider",
    content_access: "provider_accessible_by_default",
    transparency: "publishes_transparency_report",
    abuse_posture: "mainstream_abuse_desk",
    jurisdiction: "United States",
    citation: "https://www.microsoft.com/en-us/corporate-responsibility/digital-safety-content (to verify)",
    verified_on: null,
    recheck_cadence_days: 180,
    honest_notes:
      "unverified seed from general knowledge: mainstream consumer " +
      "provider, content accessible by default. verify against citations",
  },
  {
    provider: "Yahoo Mail",
    kind: "mainstream_provider",
    content_access: "provider_accessible_by_default",
    transparency: "unknown",
    abuse_posture: "mainstream_abuse_desk",
    jurisdiction: "United States",
    citation: "https://www.yahoo.com/everywhere/ (to verify)",
    verified_on: null,
    recheck_cadence_days: 180,
    honest_notes:
      "unverified seed from general knowledge: mainstream consumer " +
      "provider. verify against citations",
  },
  {
    provider: "Mailinator",
    kind: "disposable_provider",
    content_access: "unknown",
    transparency: "publishes_none",
    abuse_posture: "disposable_by_design",
    jurisdiction: "United States",
    citation: "https://www.mailinator.com/ (to verify)",
    verified_on: null,
    recheck_cadence_days: 180,
    honest_notes:
      "unverified seed from general knowledge: public inboxes by design, " +
      "anyone can read any inbox. disposable by design makes abuse cheap, " +
      "which is a fact about the service, never proof about a sender. " +
      "verify against the cited page",
  },
  {
    provider: "10 Minute Mail",
    kind: "disposable_provider",
    content_access: "unknown",
    transparency: "publishes_none",
    abuse_posture: "disposable_by_design",
    jurisdiction: "unknown",
    citation: "https://10minutemail.com/ (to verify)",
    verified_on: null,
    recheck_cadence_days: 180,
    honest_notes:
      "unverified seed from general knowledge: short-lived disposable " +
      "inboxes. verify against the cited page",
  },
  {
    provider: "Guerrilla Mail",
    kind: "disposable_provider",
    content_access: "unknown",
    transparency: "publishes_none",
    abuse_posture: "disposable_by_design",
    jurisdiction: "unknown",
    citation: "https://www.guerrillamail.com/ (to verify)",
    verified_on: null,
    recheck_cadence_days: 180,
    honest_notes:
      "unverified seed from general knowledge: disposable inboxes with " +
      "outbound sending. verify against the cited page",
  },
];

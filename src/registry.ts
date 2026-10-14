// theproviderradar registry table 0.2.0. one row per provider, every
// attribute cited and dated, recheck cadences attached, honest notes
// carried verbatim. a row is a set of facts about a provider, never a
// verdict about any sender using it: infrastructure is not intent.
//
// row provenance: rows with verified_on were read from their cited
// sources on that date (querit research pass plus primary sources,
// 2026-10-14). rows with verified_on: null are unverified seeds and
// say so in their honest_notes; they are flagged for verification,
// never relied on.

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
    citation:
      "https://euvetted.com/de/p/tuta (hannover-based, end-to-end " +
      "encrypted, own german data centre, formerly tutanota), " +
      "https://proton.me/blog/proton-vs-tuta-encryption (both proton " +
      "and tuta use end-to-end encryption, a competitor's published " +
      "comparison, read 2026-10-14)",
    verified_on: "2026-10-14",
    recheck_cadence_days: 180,
    honest_notes:
      "verified via a third-party compliance profile and a competitor's " +
      "published comparison, not yet from tuta's own security page; " +
      "transparency posture stays unknown because no transparency " +
      "report was found in this pass. re-verify against tuta's own " +
      "pages at the next cadence tick",
  },
  {
    provider: "Gmail",
    kind: "mainstream_provider",
    content_access: "provider_accessible_by_default",
    transparency: "publishes_transparency_report",
    abuse_posture: "mainstream_abuse_desk",
    jurisdiction: "United States",
    citation:
      "https://www.mailhippo.com/blog/are-emails-encrypted/ (gmail " +
      "encrypts in transit and at rest, but not end to end, read " +
      "2026-10-14), https://transparencyreport.google.com/safer-email/ " +
      "(google publishes real-time email encryption transparency)",
    verified_on: "2026-10-14",
    recheck_cadence_days: 180,
    honest_notes:
      "content accessible to the provider by default, confirmed in this " +
      "pass; google publishes encryption transparency and a separate " +
      "government-requests report. sits mid-radar on architecture: " +
      "mainstream posture with published transparency, no default e2e",
  },
  {
    provider: "Outlook.com",
    kind: "mainstream_provider",
    content_access: "provider_accessible_by_default",
    transparency: "publishes_transparency_report",
    abuse_posture: "mainstream_abuse_desk",
    jurisdiction: "United States",
    citation:
      "https://www.microsoft.com/en-us/corporate-responsibility/reports/government-requests/customer-data " +
      "(government requests for customer data report, covering " +
      "july-december 2025, read 2026-10-14)",
    verified_on: "2026-10-14",
    recheck_cadence_days: 180,
    honest_notes:
      "transparency report verified today from microsoft's own csr " +
      "pages, which also state microsoft does not provide governments " +
      "its encryption keys. content-access posture is the mainstream " +
      "default, not e2e by default; re-verify that attribute against " +
      "microsoft's security documentation at the next cadence tick",
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
      "still an unverified seed: the 2026-10-14 research pass found no " +
      "primary transparency or security page for yahoo mail, and " +
      "third-party coverage was deliverability-oriented, not " +
      "architecture-oriented. transparency stays unknown; verify " +
      "against primary sources before relying on this row",
  },
  {
    provider: "Mailinator",
    kind: "disposable_provider",
    content_access: "public_inboxes_by_design",
    transparency: "publishes_none",
    abuse_posture: "disposable_by_design",
    jurisdiction: "United States",
    citation:
      "https://www.mailinator.com/documentation/docs/core/publicmailbox/ " +
      "(read 2026-10-14: 'all inboxes and emails are in the public " +
      "domain. they are readable and delete-able by anyone')",
    verified_on: "2026-10-14",
    recheck_cadence_days: 180,
    honest_notes:
      "verified from mailinator's own documentation today: every " +
      "possible address at the domain exists and its inbox is public, " +
      "readable by anyone, not just the provider. public inboxes make " +
      "abuse cheap, which is a fact about the service, never proof " +
      "about a sender",
  },
  {
    provider: "10 Minute Mail",
    kind: "disposable_provider",
    content_access: "unknown",
    transparency: "publishes_none",
    abuse_posture: "disposable_by_design",
    jurisdiction: "unknown",
    citation:
      "https://10minutemail.com/vi/what-is-temporary-email and " +
      "https://10minutemail.com/throwaway-email (read 2026-10-14: " +
      "self-destructing addresses; 'memory-only storage: all data " +
      "lives in ram only')",
    verified_on: "2026-10-14",
    recheck_cadence_days: 180,
    honest_notes:
      "verified from the service's own pages today: short-lived " +
      "disposable addresses, memory-only storage. jurisdiction and " +
      "transparency posture remain unknown",
  },
  {
    provider: "Guerrilla Mail",
    kind: "disposable_provider",
    content_access: "unknown",
    transparency: "publishes_none",
    abuse_posture: "disposable_by_design",
    jurisdiction: "unknown",
    citation:
      "https://www.guerrillamail.com/ (read 2026-10-14: disposable " +
      "email service, 'keeping your real inbox safe and clean', " +
      "21.5 billion emails processed)",
    verified_on: "2026-10-14",
    recheck_cadence_days: 180,
    honest_notes:
      "verified from the service's own homepage today: disposable " +
      "inboxes by design, operating since 2006. jurisdiction and " +
      "transparency posture remain unknown; outbound sending is part " +
      "of the service but was not re-verified from the site in this " +
      "pass",
  },
];

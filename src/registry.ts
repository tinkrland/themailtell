// thevoipradar registry table 0.1.0. one row per voip provider: tier,
// kyc posture, kyc scope, market, each cited and dated. a row is a
// fact about a shop, never a verdict about a caller: infrastructure
// is not intent.
//
// row provenance: rows with verified_on were read from their cited
// sources on that date. rows with null are unverified seeds and say
// so in honest_notes.

import type { VoipProviderEntry } from "./schema.js";

export const VOIP_REGISTRY: VoipProviderEntry[] = [
  {
    provider: "Twilio",
    tier: "upstream_carrier",
    kyc_posture: "kyc_required",
    kyc_scope:
      "tiered by product and jurisdiction: toll-free verification is " +
      "required before a toll-free number can send messages; australia's " +
      "scam prevention framework imposes kyc obligations; regulatory " +
      "bundles apply per country; a bare us local number purchase is " +
      "lighter than the messaging products",
    market: "global",
    citation:
      "https://help.twilio.com/articles/49291010297883 (kyc in australia), " +
      "https://www.twilio.com/blog/developers/tutorials/product/self-service-kyc-toll-free-verif " +
      "(toll-free verification before messaging), read 2026-10-15",
    verified_on: "2026-10-15",
    recheck_cadence_days: 180,
    honest_notes:
      "twilio's kyc is real but not uniform: reading every twilio " +
      "number as bought under full kyc would overstate, and the scope " +
      "field carries that nuance. the upstream posture is the ceiling " +
      "of what its resellers inherit, not a floor they must match",
  },
  {
    provider: "Fanytel",
    tier: "retail_front",
    kyc_posture: "no_kyc_observed",
    kyc_scope:
      "no identity verification found in the pass that read the " +
      "provider's own pages (2026-10-15); owner-reported no-kyc; the " +
      "marketing targets multiple WhatsApp and Telegram accounts and " +
      "privacy use",
    market: "global retail",
    citation:
      "https://fanytel.com/blog/virtual-number-for-whatsapp-2025 and " +
      "https://fanytel.com/blog/f/virtual-number-for-telegram (read " +
      "2026-10-15)",
    verified_on: "2026-10-15",
    recheck_cadence_days: 90,
    honest_notes:
      "no kyc observed on the provider's own pages read today; the tos " +
      "and checkout flow were not read line by line, so this is " +
      "observed absence with a date, not proof. verify at the next " +
      "cadence tick before relying on it as a strong claim",
  },
  {
    provider: "TextNow",
    tier: "consumer_app",
    kyc_posture: "identity_light",
    kyc_scope:
      "free signup without document verification, per third-party " +
      "coverage read 2026-10-15; major platforms treat its numbers as " +
      "voip and some reject them for verification",
    market: "us, canada",
    citation:
      "https://mail.pvacodes.com/textnow-free-virtual-number-what-it-does-where-it-fails-and-better-al " +
      "(third-party coverage, read 2026-10-15), own signup flow not read",
    verified_on: null,
    recheck_cadence_days: 180,
    honest_notes:
      "unverified seed: the identity-light posture comes from " +
      "third-party coverage, not from textnow's own pages read in " +
      "this pass. verify against the signup flow before relying",
  },
  {
    provider: "Google Voice",
    tier: "consumer_app",
    kyc_posture: "identity_light",
    kyc_scope:
      "requires a google account; us-only availability; porting in " +
      "requires an active us mobile number; no document kyc",
    market: "us",
    citation:
      "https://support.google.com/voice/answer/1065667 (porting " +
      "requirements read 2026-10-15), " +
      "https://knowledge.workspace.google.com/admin/voice/number-porting-requirements-for-google-voice",
    verified_on: "2026-10-15",
    recheck_cadence_days: 180,
    honest_notes:
      "identity-light, not anonymous: the google account is a real " +
      "identity tether, and the us-only availability is its own " +
      "barrier. a different point on the radar than a no-kyc retail " +
      "front selling to anyone",
  },
  {
    provider: "Bandwidth",
    tier: "upstream_carrier",
    kyc_posture: "unknown",
    kyc_scope: "not researched in this pass",
    market: "us",
    citation: "https://www.bandwidth.com/ (to verify)",
    verified_on: null,
    recheck_cadence_days: 180,
    honest_notes:
      "unverified seed: the classic upstream whose numbers many retail " +
      "fronts resell. its compliance posture is a required fact for " +
      "reading the resale rows, verify against its own compliance " +
      "pages before relying",
  },
  {
    provider: "Hushed",
    tier: "retail_front",
    kyc_posture: "unknown",
    kyc_scope: "not researched in this pass",
    market: "global retail",
    citation: "https://hushed.com/ (to verify)",
    verified_on: null,
    recheck_cadence_days: 180,
    honest_notes:
      "unverified seed: anonymous second-number storefront. verify " +
      "against its own pages before relying",
  },
  {
    provider: "Burner",
    tier: "consumer_app",
    kyc_posture: "unknown",
    kyc_scope: "not researched in this pass",
    market: "us",
    citation: "https://www.burnerapp.com/ (to verify)",
    verified_on: null,
    recheck_cadence_days: 180,
    honest_notes:
      "unverified seed: disposable-number consumer app. verify against " +
      "its own pages before relying",
  },
];

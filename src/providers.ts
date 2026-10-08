// known virtual-number providers. cross-market, honest about what local
// detection can and cannot see: most consumer voip apps draw numbers from
// the same national blocks as real carrier numbers, so a provider row
// without prefixes exists to document a detection gap, not to pretend a
// match exists. twilio's line type intelligence documentation names google
// voice and enflick (textnow's parent company) as examples of non-fixed
// voip numbers, which verifies those two rows' service class.

import type { ProviderRow, CommunityListRow } from "./tables.js";

const TWILIO_LTI = "https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence";

export const PROVIDERS: ProviderRow[] = [
  {
    provider: "Google Voice",
    kind: "consumer_app",
    markets: ["us", "ca"],
    prefixes: null,
    note:
      "google voice numbers are drawn from ordinary national blocks and are " +
      "not distinguishable from carrier numbers by range. twilio's line type " +
      "intelligence documentation names google voice as an example of " +
      "non-fixed voip; a carrier lookup is the only reliable local evidence " +
      "path, and absence of adapter evidence is unknown, never clean",
    citation: TWILIO_LTI,
    verified_on: "2026-10-08",
  },
  {
    provider: "Twilio",
    kind: "cpaas",
    markets: ["us", "ca", "gb", "de", "fr", "au", "in", "br", "mx", "ng"],
    prefixes: null,
    note:
      "twilio programmable voice numbers are drawn from national blocks and " +
      "are not distinguishable by range; non-fixed voip line type from a " +
      "carrier lookup is the evidence path",
    citation: "https://www.twilio.com/docs/phone-numbers",
    verified_on: null,
  },
  {
    provider: "TextNow",
    kind: "consumer_app",
    markets: ["us", "ca"],
    prefixes: null,
    note:
      "twilio's line type intelligence documentation names enflick " +
      "(textnow's parent company) alongside google voice as an example of " +
      "non-fixed voip numbers; range detection is not possible",
    citation: TWILIO_LTI,
    verified_on: "2026-10-08",
  },
  {
    provider: "TextFree",
    kind: "consumer_app",
    markets: ["us"],
    prefixes: null,
    note: "pinger/textfree voip numbers; not distinguishable by range",
    citation: "https://www.textfree.us",
    verified_on: null,
  },
  {
    provider: "Burner",
    kind: "consumer_app",
    markets: ["us", "ca"],
    prefixes: null,
    note: "subscription burner numbers layered on carrier numbers; not distinguishable by range",
    citation: "https://www.burnerapp.com",
    verified_on: null,
  },
  {
    provider: "Hushed",
    kind: "consumer_app",
    markets: ["us", "ca", "gb"],
    prefixes: null,
    note: "hushed voip numbers; not distinguishable by range",
    citation: "https://hushed.com",
    verified_on: null,
  },
  {
    provider: "MySudo",
    kind: "consumer_app",
    markets: ["us", "ca", "gb", "au", "ie", "fr", "de", "nl", "ch", "at", "be", "es", "it", "dk", "nz", "se", "pt", "fi", "no", "lu"],
    prefixes: null,
    note: "mysudo issues multiple virtual numbers per account; not distinguishable by range",
    citation: "https://www.mysudo.com",
    verified_on: null,
  },
  {
    provider: "Sonetel",
    kind: "business",
    markets: ["us", "gb", "de", "fr", "nl", "es", "it", "se", "dk", "ch", "at", "be", "in", "ae", "ke", "za", "ng"],
    prefixes: null,
    note: "sonetel virtual numbers across many markets; virtual ranges where they exist (gb 056, de 032, nl 085) are the local signal",
    citation: "https://sonetel.com",
    verified_on: null,
  },
  {
    provider: "Zadarma",
    kind: "business",
    markets: ["us", "gb", "de", "fr", "nl", "es", "it", "ch", "at", "be", "pl", "cz"],
    prefixes: null,
    note: "zadarma voip numbers; virtual ranges where they exist are the local signal",
    citation: "https://zadarma.com",
    verified_on: null,
  },
  {
    provider: "Sipgate",
    kind: "business",
    markets: ["de", "gb", "at"],
    prefixes: null,
    note:
      "sipgate issues german numbers, including from geographic ranges, so " +
      "a sipgate number can look exactly like a landline; range detection " +
      "is not possible and this row documents that gap",
    citation: "https://www.sipgate.de",
    verified_on: null,
  },
  {
    provider: "DIDWW",
    kind: "cpaas",
    markets: ["us", "ca", "gb", "de", "fr", "nl", "es", "it", "ch", "at", "be", "au", "nz", "ie", "se", "dk", "pt", "tr", "cy", "il", "jo", "eg", "ma", "in", "pk", "bd", "my", "id", "ph", "mx", "br", "ar", "cl", "co", "pe", "za", "ng", "gh"],
    prefixes: null,
    note: "didww wholesale did numbers across all seeded markets; virtual ranges where they exist are the local signal",
    citation: "https://www.didww.com",
    verified_on: null,
  },
];

/**
 * public sms-receive-website number lists, as community observations with
 * their own staleness. seeded empty: populating it requires a recorded
 * snapshot (list, date, url, numbers), and a snapshot ages on its own
 * schedule, downgrading to unresolved rather than asserting.
 */
export const COMMUNITY_LISTS: CommunityListRow[] = [];

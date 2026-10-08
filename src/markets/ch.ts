// ch market tables. switzerland is quadrilingual: german, french, italian
// and romansh are official, and the postal service publishes its services
// in german, french and italian. the post.ch po box page confirms the
// service; the french and italian lexical labels carry their own rows so a
// later verification of each language label is an additive row change.
// fetched and verified 2026-10-08 where noted.

import type { MarketTables } from "../tables.js";

export const CH: MarketTables = {
  po_box_equivalents: [
    {
      label: "postfach",
      languages: ["de"],
      patterns: ["\\bpostfach\\b"],
      citation: "https://www.post.ch/en/receiving-mail/receipt-locations/po-box",
      verified_on: "2026-10-08",
    },
    {
      label: "case postale",
      languages: ["fr"],
      patterns: ["\\bcase\\s+postale\\b", "\\bc\\.?\\s?p\\.?\\s*\\d"],
      note:
        "the po box service is confirmed on post.ch; this french-language " +
        "lexical label still needs a french-page verification of its own",
      citation: "https://www.post.ch/fr/recevoir/adresses-privees/case-postale",
      verified_on: null,
    },
    {
      label: "casella postale",
      languages: ["it"],
      patterns: ["\\bcasella\\s+postale\\b", "\\bc\\.?\\s?p\\.?\\s*\\d"],
      note:
        "the po box service is confirmed on post.ch; this italian-language " +
        "lexical label still needs an italian-page verification of its own",
      citation: "https://www.post.ch/it/ricevere/indirizzi-privati/casella-postale",
      verified_on: null,
    },
  ],
  carrier_points: [
    {
      carrier: "swiss post",
      service: "pickpost",
      patterns: ["\\bpickpost\\b"],
      format_note:
        "pickpost points are staffed locations confirmed on post.ch; the " +
        "address is the location's street address with the parcel held for " +
        "pickup",
      recheck_cadence_days: 180,
      citation: "https://www.post.ch/en/receiving-mail/receipt-locations/pickpost-my-post-24/pickpost",
      verified_on: "2026-10-08",
    },
  ],
  format: {
    postal_code_pattern: "^\\d{4}$",
    required_fields: ["street", "city", "postal_code"],
    citation: "https://www.post.ch/en/receiving-mail/receipt-locations/po-box",
    verified_on: null,
  },
};

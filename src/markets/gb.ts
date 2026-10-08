// gb market tables. royal mail's hm forces page documents bfpo addressing;
// the po box lexical shape is a long-standing royal mail service. inpost
// lockers exist in gb but are selected in the carrier flow at checkout
// rather than written as free text, which the row says honestly. fetched
// and verified 2026-10-08 where noted.

import type { MarketTables } from "../tables.js";

export const GB: MarketTables = {
  po_box_equivalents: [
    {
      label: "po box",
      languages: ["en"],
      patterns: ["\\bp\\.?\\s?o\\.?\\s?box\\b", "\\bpost\\s+office\\s+box\\b"],
      citation: "https://www.royalmail.com/sending/letters-and-parcels",
      verified_on: null,
    },
    {
      label: "bfpo",
      languages: ["en"],
      patterns: ["\\bbfpo\\s*\\d"],
      note:
        "the british forces post office: royal mail's hm forces page " +
        "confirms bfpo delivery and that the destination country is not " +
        "written on the address",
      citation: "https://www.royalmail.com/sending/hm-forces",
      verified_on: "2026-10-08",
    },
  ],
  carrier_points: [
    {
      carrier: "inpost",
      service: "locker",
      patterns: ["\\binpost\\b", "\\binpost\\s+locker\\b"],
      format_note:
        "the locker service is confirmed on inpost's own pages, but inpost " +
        "lockers are selected in the carrier checkout flow rather than " +
        "typed as a free-text address, so the token rarely appears in " +
        "written lines; a match here is real evidence, but absence is not " +
        "evidence of a street address",
      recheck_cadence_days: 180,
      citation: "https://inpost.co.uk/how-to-send-a-parcel",
      verified_on: "2026-10-08",
    },
  ],
  format: {
    postal_code_pattern: "^[a-z]{1,2}\\d[a-z\\d]? ?\\d[a-z]{2}$",
    required_fields: ["street", "city", "postal_code"],
    citation: "https://www.royalmail.com/find-a-postcode",
    verified_on: null,
  },
};

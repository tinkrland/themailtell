// se market tables. the swedish po box shape ("box 1234") is still an
// unverified seed: the pages fetched so far document postnord's paketbox
// product (a different, property-owner-facing parcel box service), not the
// po box addressing format. postnord also runs ombud (staffed pickup
// agents). fetched 2026-10-08.

import type { MarketTables } from "../tables.js";

export const SE: MarketTables = {
  po_box_equivalents: [
    {
      label: "box / boxadress",
      languages: ["sv"],
      patterns: ["\\bbox\\s*\\d"],
      note:
        "the box shape is common in swedish addressing; this row still " +
        "needs a postnord page verifying the format before its signals " +
        "reach recognized strength",
      citation: "https://www.postnord.se/verktyg/om-postnord/adressera-ratt",
      verified_on: null,
    },
  ],
  carrier_points: [
    {
      carrier: "postnord",
      service: "ombud / terminal pickup",
      patterns: ["\\bpostnord\\s+terminal\\b", "\\bterminal\\s+\\d+\\s*,?\\s*\\d{3}\\s*\\d{2}\\b"],
      format_note:
        "parcels can be released to a postnord terminal or ombud (staffed " +
        "agent) for pickup; ombud addresses are the shop's ordinary street " +
        "address. this row's format claims are unverified seeds",
      recheck_cadence_days: 180,
      citation: "https://www.postnord.se/verktyg/hitta-ombud",
      verified_on: null,
    },
    {
      carrier: "postnord",
      service: "paketbox",
      patterns: ["\\bpaketbox\\b"],
      format_note:
        "postnord's paketbox network (8000+ parcel boxes, open around the " +
        "clock) is confirmed on postnord's own pages; these are property " +
        "parcel boxes for receiving, a distinct locker shape",
      recheck_cadence_days: 180,
      citation: "https://www.postnord.se/privat/paketboxar/",
      verified_on: "2026-10-08",
    },
  ],
  format: {
    postal_code_pattern: "^\\d{3}\\s?\\d{2}$",
    required_fields: ["street", "city", "postal_code"],
    citation: "https://www.postnord.se",
    verified_on: null,
  },
};

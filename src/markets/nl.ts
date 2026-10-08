// nl market tables. postnl's pages document the postbus (the business
// postbox service and the address format with the postbus number) and the
// postnl-punt pickup network. fetched and verified 2026-10-08.

import type { MarketTables } from "../tables.js";

export const NL: MarketTables = {
  po_box_equivalents: [
    {
      label: "postbus",
      languages: ["nl"],
      patterns: ["\\bpostbus\\s*\\d"],
      citation:
        "https://www.postnl.nl/versturen/brief-of-kaart-versturen/hoe-verstuur-ik-een-brief-of-kaart/brief-adresseren/",
      verified_on: "2026-10-08",
    },
  ],
  carrier_points: [
    {
      carrier: "postnl",
      service: "postnl-punt (ophaalpunt)",
      patterns: ["\\bpostnl[\\s-]*punt\\b", "\\bophaalpunt\\b"],
      format_note:
        "postnl's pickup network is branded postnl-punt (historically also " +
        "called ophaalpunt); parcels are held at the shop or locker and the " +
        "address is the location's own street address unless the checkout " +
        "writes the brand into the lines",
      recheck_cadence_days: 180,
      citation:
        "https://www.postnl.nl/ontvangen/pakket-ontvangen/ophalen-op-een-postnl-locatie/",
      verified_on: "2026-10-08",
    },
  ],
  format: {
    postal_code_pattern: "^\\d{4}\\s?[a-z]{2}$",
    required_fields: ["street", "city", "postal_code"],
    citation:
      "https://www.postnl.nl/versturen/brief-of-kaart-versturen/hoe-verstuur-ik-een-brief-of-kaart/brief-adresseren/",
    verified_on: "2026-10-08",
  },
};

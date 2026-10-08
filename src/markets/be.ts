// be market tables. belgium is multilingual (dutch, french, german), and
// its po box shape appears under both postbus (nl) and bp (fr) labels. the
// bpost pages fetched so far document the points-of-sale locator, not the
// postbus addressing format, so both lexical rows are honest unverified
// seeds. fetched 2026-10-08.

import type { MarketTables } from "../tables.js";

export const BE: MarketTables = {
  po_box_equivalents: [
    {
      label: "postbus",
      languages: ["nl"],
      patterns: ["\\bpostbus\\s*\\d"],
      note:
        "bpost's business po box service; verify the dutch-language page " +
        "before this row reaches recognized strength",
      citation: "https://www.bpost.be/portal/zakelijkNL",
      verified_on: null,
    },
    {
      label: "bp (boite postale)",
      languages: ["fr"],
      patterns: ["\\bb\\.?\\s?p\\.?\\s*\\d"],
      note:
        "the french-language label of the same bpost po box service; verify " +
        "the french-language page before this row reaches recognized strength",
      citation: "https://www.bpost.be/portal/proFR",
      verified_on: null,
    },
  ],
  carrier_points: [
    {
      carrier: "bpost",
      service: "punt / post point pickup",
      patterns: ["\\bbpost\\s*punt\\b", "\\bpost\\s+point\\b"],
      format_note:
        "bpost's points of sale are confirmed on bpost's own locator pages " +
        "as staffed locations accepting parcels for pickup; the address is " +
        "the shop's ordinary street address, so absence of the token is not " +
        "evidence of a street address",
      recheck_cadence_days: 180,
      citation: "https://www.bpost.be/en/points-of-sale",
      verified_on: "2026-10-08",
    },
  ],
  format: {
    postal_code_pattern: "^\\d{4}$",
    required_fields: ["street", "city", "postal_code"],
    citation: "https://www.bpost.be",
    verified_on: null,
  },
};

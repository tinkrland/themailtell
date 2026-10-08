// it market tables. poste italiane's caselle postali page documents the
// casella postale format ("casella postale 14123"), and the punto poste
// pages document the poste locker and staffed punto poste pickup network.
// fetched and verified 2026-10-08.

import type { MarketTables } from "../tables.js";

export const IT: MarketTables = {
  po_box_equivalents: [
    {
      label: "casella postale / cp",
      languages: ["it"],
      patterns: ["\\bc\\.?\\s?p\\.?\\s*\\d", "\\bcasella\\s+postale\\b"],
      citation: "https://www.poste.it/soluzioni-recapito/caselle-postali",
      verified_on: "2026-10-08",
    },
  ],
  carrier_points: [
    {
      carrier: "poste italiane",
      service: "punto poste / poste locker",
      patterns: ["\\bpunto\\s+poste\\b", "\\bposte\\s+locker\\b", "\\blocker\\s+poste\\b"],
      format_note:
        "the rete punto poste is a network of staffed pickup points and " +
        "automatic lockers (locker automatici, self-service). staffed " +
        "points are ordinary street addresses; the token appears when a " +
        "checkout writes the brand into the lines",
      recheck_cadence_days: 180,
      citation: "https://www.poste.it/punto-poste/rete-punto-poste",
      verified_on: "2026-10-08",
    },
    {
      carrier: "amazon",
      service: "locker",
      patterns: ["\\bamazon\\s+locker\\b", "\\bamazon\\s+hub\\b"],
      format_note:
        "amazon lockers also operate in it; same shape as the us amazon " +
        "row, with the location's street address in the lines",
      recheck_cadence_days: 180,
      citation: "https://www.amazon.it",
      verified_on: null,
    },
  ],
  format: {
    postal_code_pattern: "^\\d{5}$",
    required_fields: ["street", "city", "postal_code"],
    citation: "https://www.poste.it",
    verified_on: null,
  },
};

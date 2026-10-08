// dk market tables. the danish carriers share the pakkeshop token: dao's
// network is branded daoshop, GLS runs pakkeshop pickup points, and bring
// has its own pickup locations. the dao pages confirm the daoshop service;
// the postboks and postnord format rows remain unverified seeds until a
// postnord addressing page verifies them. fetched 2026-10-08.

import type { MarketTables } from "../tables.js";

export const DK: MarketTables = {
  po_box_equivalents: [
    {
      label: "postboks",
      languages: ["da"],
      patterns: ["\\bpostboks\\b"],
      note:
        "danish po box addressing; still needs a postnord page verifying " +
        "the format and whether the service is currently offered",
      citation: "https://www.postnord.dk",
      verified_on: null,
    },
  ],
  carrier_points: [
    {
      carrier: "dao",
      service: "daoshop",
      patterns: ["\\bdaoshop\\b", "\\bdao\\s+shop\\b"],
      format_note:
        "dao's pickup network is branded daoshop (confirmed on dao's own " +
        "pages); the generic pakkeshop token is shared across danish " +
        "carriers, see the gls and bring rows. pickup addresses are the " +
        "shop's ordinary street address",
      recheck_cadence_days: 180,
      citation: "https://dao.as/en/find-daoshop-en/",
      verified_on: "2026-10-08",
    },
    {
      carrier: "GLS",
      service: "pakkeshop",
      patterns: ["\\bgls\\s+pakkeshop\\b", "\\bpakkeshop\\b"],
      format_note:
        "gls danmark's pakkeshop pickup points (confirmed on the gls dk " +
        "site); same shape as the daoshop row",
      recheck_cadence_days: 180,
      citation: "https://gls-group.dk/DK/da/find-en-pakkeshop",
      verified_on: "2026-10-08",
    },
    {
      carrier: "bring",
      service: "pakkeshop / udleveringssted",
      patterns: ["\\bbring\\s+pakkeshop\\b", "\\budleveringssted\\b"],
      format_note:
        "bring's danish pickup locations; same shape as the daoshop row. " +
        "the bring page was not fetched yet, so this row stays an " +
        "unverified seed",
      recheck_cadence_days: 180,
      citation: "https://www.bring.dk",
      verified_on: null,
    },
  ],
  format: {
    postal_code_pattern: "^\\d{4}$",
    required_fields: ["street", "city", "postal_code"],
    citation: "https://www.postnord.dk",
    verified_on: null,
  },
};

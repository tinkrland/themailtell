// ca market tables. canada post's addressing guidelines document the po box
// format (po box 4001 stn a) and the flexdelivery service: a free staffed
// po box at a post office, with pickup after id verification. fetched and
// verified 2026-10-08.

import type { MarketTables } from "../tables.js";

export const CA: MarketTables = {
  po_box_equivalents: [
    {
      label: "po box",
      languages: ["en", "fr"],
      patterns: ["\\bp\\.?\\s?o\\.?\\s?box\\b", "\\bbox\\s+postale\\b"],
      citation:
        "https://www.canadapost-postescanada.ca/cpc/doc/en/support/addressing-guidelines.pdf",
      verified_on: "2026-10-08",
    },
  ],
  carrier_points: [
    {
      carrier: "canada post",
      service: "flexdelivery",
      patterns: ["\\bflexdelivery\\b", "\\bflex\\s+delivery\\b"],
      format_note:
        "flexdelivery is a free staffed po box at a post office, confirmed " +
        "on canada post's flexdelivery page: parcels arrive at the chosen " +
        "post office and are held for pickup after id verification. the " +
        "address itself is po box shaped, so this row also reports the po " +
        "box signal; both come from this one source",
      is_po_box_shape: true,
      recheck_cadence_days: 180,
      citation: "https://www.canadapost-postescanada.ca/cpc/en/personal/flexdelivery.page",
      verified_on: "2026-10-08",
    },
  ],
  format: {
    postal_code_pattern: "^[a-z]\\d[a-z] ?\\d[a-z]\\d$",
    required_fields: ["street", "city", "region", "postal_code"],
    citation: "https://www.canadapost-postescanada.ca/cpc/doc/en/support/addressing-guidelines.pdf",
    verified_on: "2026-10-08",
  },
};

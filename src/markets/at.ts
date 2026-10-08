// at market tables. the austrian postfach row is still an unverified seed
// (the pages fetched so far document the versandstation product, not the
// postfach format). versandstation is confirmed on post.at's own pages as
// a 24-hour self-service station. fetched 2026-10-08.

import type { MarketTables } from "../tables.js";

export const AT: MarketTables = {
  po_box_equivalents: [
    {
      label: "postfach",
      languages: ["de"],
      patterns: ["\\bpostfach\\b"],
      note:
        "austrian postfach addressing; still needs a post.at page verifying " +
        "the format before this row reaches recognized strength",
      citation: "https://www.post.at",
      verified_on: null,
    },
  ],
  carrier_points: [
    {
      carrier: "oesterreichische post",
      service: "versandstation",
      patterns: ["\\bversandstation\\b"],
      format_note:
        "post.at's versandstation is a 24-hour self-service station for " +
        "franking and sending, and for parcel pickup; confirmed on post.at. " +
        "staffed branch pickup (abholung in der filiale) uses the branch's " +
        "ordinary street address",
      recheck_cadence_days: 180,
      citation: "https://www.post.at/p/c/versandstation",
      verified_on: "2026-10-08",
    },
  ],
  format: {
    postal_code_pattern: "^\\d{4}$",
    required_fields: ["street", "city", "postal_code"],
    citation: "https://www.post.at",
    verified_on: null,
  },
};

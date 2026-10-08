// cy market tables. regulator: OCECPR. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.

import type { MarketTables } from "../tables.js";

export const CY: MarketTables = {
  regulator: "OCECPR",
  ranges: [
    {
      prefix: "9",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.ocecpr.org.cy",
      verified_on: null,
    },
    {
      prefix: "2",
      line_type: "landline",
      official_name: "geographic ranges",
      citation: "https://www.ocecpr.org.cy",
      verified_on: null,
    },
    {
      prefix: "800",
      line_type: "tollfree",
      official_name: "freephone",
      citation: "https://www.ocecpr.org.cy",
      verified_on: null,
    },
  ],
};

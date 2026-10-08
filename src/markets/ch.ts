// ch market tables. regulator: BAKOM. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.

import type { MarketTables } from "../tables.js";

export const CH: MarketTables = {
  regulator: "BAKOM",
  ranges: [
    {
      prefix: "7",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.bakom.admin.ch",
      verified_on: null,
    },
    {
      prefix: "84",
      line_type: "ngn",
      official_name: "service numbers",
      citation: "https://www.bakom.admin.ch",
      verified_on: null,
    },
    {
      prefix: "800",
      line_type: "tollfree",
      official_name: "freephone",
      citation: "https://www.bakom.admin.ch",
      verified_on: null,
    },
  ],
};

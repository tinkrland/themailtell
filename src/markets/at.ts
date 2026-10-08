// at market tables. regulator: RTR. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.

import type { MarketTables } from "../tables.js";

export const AT: MarketTables = {
  regulator: "RTR",
  ranges: [
    {
      prefix: "6",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.rtr.at",
      verified_on: null,
    },
    {
      prefix: "1",
      line_type: "landline",
      official_name: "geographic ranges",
      citation: "https://www.rtr.at",
      verified_on: null,
    },
    {
      prefix: "800",
      line_type: "tollfree",
      official_name: "freephone",
      citation: "https://www.rtr.at",
      verified_on: null,
    },
  ],
};

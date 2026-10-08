// ma market tables. regulator: ANRT. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.

import type { MarketTables } from "../tables.js";

export const MA: MarketTables = {
  regulator: "ANRT",
  ranges: [
    {
      prefix: "6",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.anrt.ma",
      verified_on: null,
    },
    {
      prefix: "7",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.anrt.ma",
      verified_on: null,
    },
    {
      prefix: "5",
      line_type: "landline",
      official_name: "geographic ranges",
      citation: "https://www.anrt.ma",
      verified_on: null,
    },
    {
      prefix: "800",
      line_type: "tollfree",
      official_name: "freephone",
      citation: "https://www.anrt.ma",
      verified_on: null,
    },
  ],
};

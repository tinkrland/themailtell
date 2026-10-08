// es market tables. regulator: CNMC. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.

import type { MarketTables } from "../tables.js";

export const ES: MarketTables = {
  regulator: "CNMC",
  ranges: [
    {
      prefix: "6",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.cnmc.es",
      verified_on: null,
    },
    {
      prefix: "7",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.cnmc.es",
      verified_on: null,
    },
    {
      prefix: "9",
      line_type: "landline",
      official_name: "geographic ranges",
      citation: "https://www.cnmc.es",
      verified_on: null,
    },
    {
      prefix: "900",
      line_type: "tollfree",
      official_name: "freephone",
      citation: "https://www.cnmc.es",
      verified_on: null,
    },
    {
      prefix: "901",
      line_type: "ngn",
      official_name: "non-geographic service numbers",
      citation: "https://www.cnmc.es",
      verified_on: null,
    },
    {
      prefix: "902",
      line_type: "ngn",
      official_name: "non-geographic service numbers",
      citation: "https://www.cnmc.es",
      verified_on: null,
    },
  ],
};

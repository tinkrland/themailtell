// cl market tables. regulator: SUBTEL. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.

import type { MarketTables } from "../tables.js";

export const CL: MarketTables = {
  regulator: "SUBTEL",
  ranges: [
    {
      prefix: "9",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.subtel.gob.cl",
      verified_on: null,
    },
    {
      prefix: "2",
      line_type: "landline",
      official_name: "geographic ranges (santiago)",
      citation: "https://www.subtel.gob.cl",
      verified_on: null,
    },
    {
      prefix: "600",
      line_type: "ngn",
      official_name: "virtual service numbers",
      citation: "https://www.subtel.gob.cl",
      verified_on: null,
    },
    {
      prefix: "800",
      line_type: "tollfree",
      official_name: "freephone",
      citation: "https://www.subtel.gob.cl",
      verified_on: null,
    },
  ],
};

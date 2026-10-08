// pe market tables. regulator: MTC / OSIPTEL. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.

import type { MarketTables } from "../tables.js";

export const PE: MarketTables = {
  regulator: "MTC / OSIPTEL",
  ranges: [
    {
      prefix: "9",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.gob.pe/mtc",
      verified_on: null,
    },
    {
      prefix: "1",
      line_type: "landline",
      official_name: "geographic ranges (lima)",
      citation: "https://www.gob.pe/mtc",
      verified_on: null,
    },
    {
      prefix: "800",
      line_type: "tollfree",
      official_name: "freephone",
      citation: "https://www.gob.pe/mtc",
      verified_on: null,
    },
  ],
};

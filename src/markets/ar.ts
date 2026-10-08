// ar market tables. regulator: ENaCom. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.

import type { MarketTables } from "../tables.js";

export const AR: MarketTables = {
  regulator: "ENaCom",
  ranges: [
    {
      prefix: "11",
      line_type: "landline",
      official_name: "geographic ranges (buenos aires)",
      citation: "https://www.enacom.gob.ar",
      verified_on: null,
    },
    {
      prefix: "800",
      line_type: "tollfree",
      official_name: "freephone",
      citation: "https://www.enacom.gob.ar",
      verified_on: null,
    },
    {
      prefix: "810",
      line_type: "ngn",
      official_name: "virtual service numbers",
      citation: "https://www.enacom.gob.ar",
      verified_on: null,
    },
    {
      prefix: "822",
      line_type: "ngn",
      official_name: "virtual service numbers",
      citation: "https://www.enacom.gob.ar",
      verified_on: null,
    },
  ],
};

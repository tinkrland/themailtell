// it market tables. regulator: AGCOM. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.

import type { MarketTables } from "../tables.js";

export const IT: MarketTables = {
  regulator: "AGCOM",
  ranges: [
    {
      prefix: "3",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.agcom.it",
      verified_on: null,
    },
    {
      prefix: "1",
      line_type: "landline",
      official_name: "geographic ranges",
      citation: "https://www.agcom.it",
      verified_on: null,
    },
    {
      prefix: "2",
      line_type: "landline",
      official_name: "geographic ranges",
      citation: "https://www.agcom.it",
      verified_on: null,
    },
    {
      prefix: "199",
      line_type: "ngn",
      official_name: "non-geographic service numbers",
      citation: "https://www.agcom.it",
      verified_on: null,
    },
  ],
};

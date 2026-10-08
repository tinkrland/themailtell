// pt market tables. regulator: ANACOM. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.

import type { MarketTables } from "../tables.js";

export const PT: MarketTables = {
  regulator: "ANACOM",
  ranges: [
    {
      prefix: "9",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.anacom.pt",
      verified_on: null,
    },
    {
      prefix: "30",
      line_type: "other",
      official_name: "voip range",
      citation: "https://www.anacom.pt",
      verified_on: null,
    },
    {
      prefix: "2",
      line_type: "landline",
      official_name: "geographic ranges",
      citation: "https://www.anacom.pt",
      verified_on: null,
    },
    {
      prefix: "800",
      line_type: "tollfree",
      official_name: "freephone",
      citation: "https://www.anacom.pt",
      verified_on: null,
    },
  ],
};

// jo market tables. regulator: TRC. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.

import type { MarketTables } from "../tables.js";

export const JO: MarketTables = {
  regulator: "TRC",
  ranges: [
    {
      prefix: "77",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.trc.gov.jo",
      verified_on: null,
    },
    {
      prefix: "78",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.trc.gov.jo",
      verified_on: null,
    },
    {
      prefix: "79",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.trc.gov.jo",
      verified_on: null,
    },
    {
      prefix: "6",
      line_type: "landline",
      official_name: "geographic ranges",
      citation: "https://www.trc.gov.jo",
      verified_on: null,
    },
    {
      prefix: "800",
      line_type: "tollfree",
      official_name: "freephone",
      citation: "https://www.trc.gov.jo",
      verified_on: null,
    },
  ],
};

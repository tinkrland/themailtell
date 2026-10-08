// tr market tables. regulator: BTK / ICTA. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.

import type { MarketTables } from "../tables.js";

export const TR: MarketTables = {
  regulator: "BTK / ICTA",
  ranges: [
    {
      prefix: "5",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.btk.gov.tr",
      verified_on: null,
    },
    {
      prefix: "212",
      line_type: "landline",
      official_name: "geographic ranges (istanbul)",
      citation: "https://www.btk.gov.tr",
      verified_on: null,
    },
    {
      prefix: "312",
      line_type: "landline",
      official_name: "geographic ranges (ankara)",
      citation: "https://www.btk.gov.tr",
      verified_on: null,
    },
    {
      prefix: "850",
      line_type: "ngn",
      official_name: "virtual service numbers",
      citation: "https://www.btk.gov.tr",
      verified_on: null,
    },
    {
      prefix: "800",
      line_type: "tollfree",
      official_name: "freephone",
      citation: "https://www.btk.gov.tr",
      verified_on: null,
    },
  ],
};

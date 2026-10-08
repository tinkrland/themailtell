// au market tables. regulator: ACMA. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.

import type { MarketTables } from "../tables.js";

export const AU: MarketTables = {
  regulator: "ACMA",
  ranges: [
    {
      prefix: "4",
      line_type: "mobile",
      official_name: "mobile ranges",
      citation: "https://www.acma.gov.au",
      verified_on: null,
    },
    {
      prefix: "2",
      line_type: "landline",
      official_name: "geographic ranges",
      citation: "https://www.acma.gov.au",
      verified_on: null,
    },
    {
      prefix: "3",
      line_type: "landline",
      official_name: "geographic ranges",
      citation: "https://www.acma.gov.au",
      verified_on: null,
    },
    {
      prefix: "7",
      line_type: "landline",
      official_name: "geographic ranges",
      citation: "https://www.acma.gov.au",
      verified_on: null,
    },
    {
      prefix: "8",
      line_type: "landline",
      official_name: "geographic ranges",
      citation: "https://www.acma.gov.au",
      verified_on: null,
    },
    {
      prefix: "1300",
      line_type: "ngn",
      official_name: "local-rate virtual numbers",
      citation: "https://www.acma.gov.au",
      verified_on: null,
    },
    {
      prefix: "1800",
      line_type: "tollfree",
      official_name: "freephone",
      citation: "https://www.acma.gov.au",
      verified_on: null,
    },
  ],
};

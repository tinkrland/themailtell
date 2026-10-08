// mx market tables. regulator: IFT. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.
// prefixes are national significant number prefixes: no trunk zero.

import type { MarketTables } from "../tables.js";

export const MX: MarketTables = {
  regulator: "IFT",
  ranges: [
    {
      prefix: "800",
      line_type: "tollfree",
      official_name: "freephone (0800)",
      citation: "https://www.ift.org.mx",
      verified_on: null,
    },
  ],
  note: "mexican mobile numbers share geographic area codes with landlines: the ift plan allocates blocks to carriers, not line types, so a 55 or 81 prefix says nothing about whether the line is mobile. only the freephone range is seeded; everything else is a carrier-adapter question and stays unknown without one.",
};

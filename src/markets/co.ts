// co market tables. regulator: MinTIC / CRC. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.
// prefixes are national significant number prefixes: no trunk zero.

import type { MarketTables } from "../tables.js";

export const CO: MarketTables = {
  regulator: "MinTIC / CRC",
  ranges: [
    {
      prefix: "3",
      line_type: "mobile",
      official_name: "mobile ranges (3xx)",
      citation: "https://www.mintic.gov.co",
      verified_on: null,
    },
    {
      prefix: "1800",
      line_type: "tollfree",
      official_name: "freephone (01 8000)",
      citation: "https://www.mintic.gov.co",
      verified_on: null,
    },
  ],
  note: "colombian mobiles occupy the 3xx national block; non-geographic 30x virtual numbers overlap it, so a sub-prefix claim would be guesswork. only the coarse mobile block and freephone are seeded.",
};

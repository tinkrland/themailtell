// br market tables. regulator: Anatel. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.
// prefixes are national significant number prefixes: no trunk zero.

import type { MarketTables } from "../tables.js";

export const BR: MarketTables = {
  regulator: "Anatel",
  ranges: [
    {
      prefix: "800",
      line_type: "tollfree",
      official_name: "freephone (0800)",
      citation: "https://www.gov.br/anatel",
      verified_on: null,
    },
  ],
  note: "brazilian mobile numbers use the same area codes as landlines with an extra digit: the prefix alone does not separate mobile from landline (anatel mandates the 9 prefix on mobile nsn within each area code, but area-code prefixes like 11 cover both). only the freephone range is seeded; line type without an adapter stays unknown.",
};

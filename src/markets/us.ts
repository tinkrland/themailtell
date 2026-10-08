// us market tables. regulator: FCC (nanp administration). fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.

import type { MarketTables } from "../tables.js";

export const US: MarketTables = {
  regulator: "FCC (nanp administration)",
  ranges: [
  ],
  note: "in the north american numbering plan, line type is not encoded in the number itself: blocks are allocated to carriers and line type is a carrier-adapter question, never a range question. this table carries no rows on purpose; a us line-type signal without an adapter is unknown, not guessed.",
};

// ca market tables. regulator: ISED (crtc administration). fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.

import type { MarketTables } from "../tables.js";

export const CA: MarketTables = {
  regulator: "ISED (crtc administration)",
  ranges: [
  ],
  note: "as in the whole nanp, line type is not encoded in the canadian numbering plan. this table carries no rows on purpose; a ca line-type signal without an adapter is unknown, not guessed.",
};

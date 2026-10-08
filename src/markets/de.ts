// de market tables. regulator: BNetzA. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.
// prefixes are national significant number prefixes: no trunk zero.

import type { MarketTables } from "../tables.js";

export const DE: MarketTables = {
  regulator: "BNetzA",
  ranges: [
    {
      prefix: "32",
      line_type: "other",
      official_name: "nationale teilnehmerrufnummern (NTR, 032)",
      note: "bnetza numbering overview lists the 032 range, nationale teilnehmerrufnummern; the range commonly used by voip and national virtual-number services. classes as a virtual-number signal, not a mobile or landline claim",
      citation: "https://www.bundesnetzagentur.de/EN/Areas/Telecommunications/Numbering/start.html",
      verified_on: "2026-10-08",
    },
    {
      prefix: "15",
      line_type: "mobile",
      official_name: "mobile ranges (015x)",
      citation: "https://www.bundesnetzagentur.de/EN/Areas/Telecommunications/Numbering/start.html",
      verified_on: null,
    },
    {
      prefix: "16",
      line_type: "mobile",
      official_name: "mobile ranges (016x)",
      citation: "https://www.bundesnetzagentur.de/EN/Areas/Telecommunications/Numbering/start.html",
      verified_on: null,
    },
    {
      prefix: "17",
      line_type: "mobile",
      official_name: "mobile ranges (017x)",
      citation: "https://www.bundesnetzagentur.de/EN/Areas/Telecommunications/Numbering/start.html",
      verified_on: null,
    },
    {
      prefix: "800",
      line_type: "tollfree",
      official_name: "freephone (0800)",
      citation: "https://www.bundesnetzagentur.de/EN/Areas/Telecommunications/Numbering/start.html",
      verified_on: null,
    },
  ],
};

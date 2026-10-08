// gb market tables. regulator: Ofcom. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.
// prefixes are national significant number prefixes: no trunk zero.

import type { MarketTables } from "../tables.js";

export const GB: MarketTables = {
  regulator: "Ofcom",
  ranges: [
    {
      prefix: "56",
      line_type: "other",
      official_name: "Location Independent Electronic Communications Services numbers (056)",
      note: "ofcom numbering data page lists 056 as corporate numbers and location independent electronic communications systems numbers; the range designated for location-independent (voip-style) services. classes as a virtual-number signal, not a mobile or landline claim",
      citation: "https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbering-data",
      verified_on: "2026-10-08",
    },
    {
      prefix: "7",
      line_type: "mobile",
      official_name: "mobile ranges (07x)",
      citation: "https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbering-data",
      verified_on: null,
    },
    {
      prefix: "1",
      line_type: "landline",
      official_name: "geographic ranges (01x, 02x)",
      citation: "https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbering-data",
      verified_on: null,
    },
    {
      prefix: "2",
      line_type: "landline",
      official_name: "geographic ranges (01x, 02x)",
      citation: "https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbering-data",
      verified_on: null,
    },
    {
      prefix: "800",
      line_type: "tollfree",
      official_name: "freephone (080x)",
      citation: "https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbering-data",
      verified_on: null,
    },
    {
      prefix: "84",
      line_type: "ngn",
      official_name: "revenue-share numbers (084x)",
      citation: "https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbering-data",
      verified_on: null,
    },
    {
      prefix: "87",
      line_type: "ngn",
      official_name: "revenue-share numbers (087x)",
      citation: "https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbering-data",
      verified_on: null,
    },
  ],
};

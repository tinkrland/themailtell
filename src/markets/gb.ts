// gb market tables. regulator: Ofcom. the rows are derived from ofcom's
// numbering data page (which publishes the uk numbering downloads per
// range) and the s7 allocations file, both fetched 2026-10-08, so every
// row here is verified against the regulator's own designations.
// prefixes are national significant number prefixes: no trunk zero.

import type { MarketTables } from "../tables.js";

const DATA = "https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbering-data";
const S7 = "https://www.ofcom.org.uk/siteassets/resources/documents/phones-telecoms-and-internet/information-for-industry/numbering/regular-updates/telephone-numbers/s7.csv";

export const GB: MarketTables = {
  regulator: "Ofcom",
  ranges: [
    // ---- 01/02: geographic ----
    {
      prefix: "1",
      line_type: "landline",
      official_name: "geographic numbers (01x)",
      citation: DATA,
      verified_on: "2026-10-08",
    },
    {
      prefix: "2",
      line_type: "landline",
      official_name: "geographic numbers (02x)",
      citation: DATA,
      verified_on: "2026-10-08",
    },

    // ---- 03xx: non-geographic at geographic rate ----
    {
      prefix: "3",
      line_type: "ngn",
      official_name: "non-geographic numbers: calls charged at a geographic rate (03xx)",
      citation: DATA,
      verified_on: "2026-10-08",
    },

    // ---- 05x: corporate and location-independent ----
    {
      prefix: "55",
      line_type: "other",
      official_name: "corporate numbers (055)",
      note:
        "ofcom lists 055 as corporate numbers alongside 056 as location " +
        "independent electronic communications systems numbers. classes as " +
        "a virtual-style signal, not a mobile or landline claim",
      citation: DATA,
      verified_on: "2026-10-08",
    },
    {
      prefix: "56",
      line_type: "other",
      official_name:
        "location independent electronic communications systems numbers (056)",
      note:
        "ofcom's numbering data page lists 056 as corporate numbers and " +
        "location independent electronic communications systems numbers; the " +
        "range designated for location-independent (voip-style) services. " +
        "classes as a virtual-number signal, not a mobile or landline claim",
      citation: DATA,
      verified_on: "2026-10-08",
    },

    // ---- 07x: split honestly, never one mobile blob ----
    {
      prefix: "70",
      line_type: "other",
      official_name: "personal numbers (070)",
      note:
        "ofcom lists 070 as personal numbers, a follow-me call-forwarding " +
        "service that forwards to the holder's real line; it is not a mobile " +
        "range despite sitting inside 07x. ofcom publishes separate " +
        "guidance on the acceptable use of 070 numbers. classes as a " +
        "virtual-style signal, never a mobile claim",
      citation: DATA,
      verified_on: "2026-10-08",
    },
    {
      prefix: "71",
      line_type: "mobile",
      official_name: "mobile services numbers (071)",
      note: "ofcom lists mobile services numbers as 071 to 075 and 077 to 079",
      citation: DATA,
      verified_on: "2026-10-08",
    },
    {
      prefix: "72",
      line_type: "mobile",
      official_name: "mobile services numbers (072)",
      note: "ofcom lists mobile services numbers as 071 to 075 and 077 to 079",
      citation: DATA,
      verified_on: "2026-10-08",
    },
    {
      prefix: "73",
      line_type: "mobile",
      official_name: "mobile services numbers (073)",
      note: "ofcom lists mobile services numbers as 071 to 075 and 077 to 079",
      citation: DATA,
      verified_on: "2026-10-08",
    },
    {
      prefix: "74",
      line_type: "mobile",
      official_name: "mobile services numbers (074)",
      note: "ofcom lists mobile services numbers as 071 to 075 and 077 to 079",
      citation: DATA,
      verified_on: "2026-10-08",
    },
    {
      prefix: "75",
      line_type: "mobile",
      official_name: "mobile services numbers (075)",
      note: "ofcom lists mobile services numbers as 071 to 075 and 077 to 079",
      citation: DATA,
      verified_on: "2026-10-08",
    },
    {
      prefix: "7624",
      line_type: "mobile",
      official_name: "isle of man mobile allocations inside the 076 range (07624)",
      note:
        "the s7 allocations file shows 07624 blocks allocated to isle of " +
        "man operators (manx telecom, sure), which sit inside the 076 " +
        "radiopaging range. longest prefix wins, so these report as mobile " +
        "rather than radiopaging",
      citation: S7,
      verified_on: "2026-10-08",
    },
    {
      prefix: "76",
      line_type: "other",
      official_name: "radiopaging service numbers (076)",
      note:
        "ofcom lists 076 as radiopaging service numbers. the range is not " +
        "withdrawn: the s7 allocations file still shows allocated 076x " +
        "blocks as of the 7 october 2026 publication, and a withdrawn claim " +
        "must come from ofcom, not from analogy with ireland's withdrawn " +
        "076 voip range. a pager number is neither a mobile nor a landline, " +
        "and classes as an other/virtual-style signal with this note. " +
        "numbers in the 07624 allocation parse as market im (isle of man) " +
        "under the default parser, so they land in the unseeded im market " +
        "rather than these gb tables; the separate 07624 row covers a " +
        "consumer that evaluates them as gb",
      citation: S7,
      verified_on: "2026-10-08",
    },
    {
      prefix: "77",
      line_type: "mobile",
      official_name: "mobile services numbers (077)",
      note: "ofcom lists mobile services numbers as 071 to 075 and 077 to 079",
      citation: DATA,
      verified_on: "2026-10-08",
    },
    {
      prefix: "78",
      line_type: "mobile",
      official_name: "mobile services numbers (078)",
      note: "ofcom lists mobile services numbers as 071 to 075 and 077 to 079",
      citation: DATA,
      verified_on: "2026-10-08",
    },
    {
      prefix: "79",
      line_type: "mobile",
      official_name: "mobile services numbers (079)",
      note: "ofcom lists mobile services numbers as 071 to 075 and 077 to 079",
      citation: DATA,
      verified_on: "2026-10-08",
    },

    // ---- 08x: freephone and revenue-share ----
    {
      prefix: "80",
      line_type: "tollfree",
      official_name: "freephone (080 numbers, covering 0800 and 0808)",
      citation: DATA,
      verified_on: "2026-10-08",
    },
    {
      prefix: "84",
      line_type: "ngn",
      official_name: "non-geographic numbers (0843, 0844 and 0845)",
      citation: DATA,
      verified_on: "2026-10-08",
    },
    {
      prefix: "87",
      line_type: "ngn",
      official_name: "non-geographic numbers (0870, 0871, 0872 and 0873)",
      citation: DATA,
      verified_on: "2026-10-08",
    },

    // ---- 09xx: premium rate ----
    {
      prefix: "90",
      line_type: "ngn",
      official_name:
        "non-geographic numbers (090, 091) and non-geographic numbers for " +
        "sexual entertainment services (098 and closed scheme numbers 0908, 0909)",
      note: "premium-rate services. a revenue-share range, never a mobile or landline claim",
      citation: DATA,
      verified_on: "2026-10-08",
    },
  ],
};

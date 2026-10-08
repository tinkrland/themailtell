// ie market tables. regulator: ComReg. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.
// prefixes are national significant number prefixes: no trunk zero.

import type { MarketTables } from "../tables.js";

export const IE: MarketTables = {
  regulator: "ComReg",
  ranges: [
    {
      prefix: "76",
      line_type: "other",
      official_name: "voip range (076, withdrawn)",
      note: "comreg withdrew the 076 voip range in january 2022 alongside 1850 and 1890; numbers may persist in databases and in the wild, so a stale range claim must decay rather than assert. this row can never produce a recognized signal; a match produces a withdrawn-range signal with the withdrawal date",
      citation: "https://www.comreg.ie/consumers-urged-to-check-new-contact-numbers-for-important-services-as-1850-1890-and-076-phone-numbers-are-withdrawn/",
      verified_on: "2026-10-08",
      withdrawn_on: "2022-01",
    },
    {
      prefix: "85",
      line_type: "mobile",
      official_name: "mobile ranges (085)",
      citation: "https://www.comreg.ie/consumers-urged-to-check-new-contact-numbers-for-important-services-as-1850-1890-and-076-phone-numbers-are-withdrawn/",
      verified_on: null,
    },
    {
      prefix: "86",
      line_type: "mobile",
      official_name: "mobile ranges (086)",
      citation: "https://www.comreg.ie/consumers-urged-to-check-new-contact-numbers-for-important-services-as-1850-1890-and-076-phone-numbers-are-withdrawn/",
      verified_on: null,
    },
    {
      prefix: "87",
      line_type: "mobile",
      official_name: "mobile ranges (087)",
      citation: "https://www.comreg.ie/consumers-urged-to-check-new-contact-numbers-for-important-services-as-1850-1890-and-076-phone-numbers-are-withdrawn/",
      verified_on: null,
    },
    {
      prefix: "89",
      line_type: "mobile",
      official_name: "mobile ranges (089)",
      citation: "https://www.comreg.ie/consumers-urged-to-check-new-contact-numbers-for-important-services-as-1850-1890-and-076-phone-numbers-are-withdrawn/",
      verified_on: null,
    },
    {
      prefix: "1",
      line_type: "landline",
      official_name: "geographic ranges (01x)",
      citation: "https://www.comreg.ie/consumers-urged-to-check-new-contact-numbers-for-important-services-as-1850-1890-and-076-phone-numbers-are-withdrawn/",
      verified_on: null,
    },
    {
      prefix: "2",
      line_type: "landline",
      official_name: "geographic ranges (02x-06x)",
      citation: "https://www.comreg.ie/consumers-urged-to-check-new-contact-numbers-for-important-services-as-1850-1890-and-076-phone-numbers-are-withdrawn/",
      verified_on: null,
    },
    {
      prefix: "4",
      line_type: "landline",
      official_name: "geographic ranges (02x-06x)",
      citation: "https://www.comreg.ie/consumers-urged-to-check-new-contact-numbers-for-important-services-as-1850-1890-and-076-phone-numbers-are-withdrawn/",
      verified_on: null,
    },
    {
      prefix: "5",
      line_type: "landline",
      official_name: "geographic ranges (02x-06x)",
      citation: "https://www.comreg.ie/consumers-urged-to-check-new-contact-numbers-for-important-services-as-1850-1890-and-076-phone-numbers-are-withdrawn/",
      verified_on: null,
    },
    {
      prefix: "6",
      line_type: "landline",
      official_name: "geographic ranges (02x-06x)",
      citation: "https://www.comreg.ie/consumers-urged-to-check-new-contact-numbers-for-important-services-as-1850-1890-and-076-phone-numbers-are-withdrawn/",
      verified_on: null,
    },
    {
      prefix: "7",
      line_type: "landline",
      official_name: "geographic ranges (071-074, 077-079)",
      citation: "https://www.comreg.ie/consumers-urged-to-check-new-contact-numbers-for-important-services-as-1850-1890-and-076-phone-numbers-are-withdrawn/",
      verified_on: null,
    },
  ],
  note: "the withdrawn 076 range is the canonical reason every table row ages: regulators retire ranges, and a withdrawn row reports its withdrawal instead of its old designation.",
};

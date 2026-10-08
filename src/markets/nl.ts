// nl market tables. regulator: ACM. fetched and
// verified 2026-10-08 where noted; unverified rows are honest seeds.
// prefixes are national significant number prefixes: no trunk zero.

import type { MarketTables } from "../tables.js";

export const NL: MarketTables = {
  regulator: "ACM",
  ranges: [
    {
      prefix: "85",
      line_type: "other",
      official_name: "elektronische communicatiediensten (085, virtual numbers)",
      note: "acm lists 085 together with 087 and 091 as numbers for personal-assistant and electronic communications services; 085 is the range used for national virtual numbers. classes as a virtual-number signal, not a mobile or landline claim",
      citation: "https://www.acm.nl/nl/telefoonnummers/nummers-en-codes-voor-telecomaanbieders/nummers-en-codes-telecomaanbieders-aanvragen",
      verified_on: "2026-10-08",
    },
    {
      prefix: "6",
      line_type: "mobile",
      official_name: "mobile ranges (06x)",
      citation: "https://www.acm.nl/nl/telefoonnummers/nummers-en-codes-voor-telecomaanbieders/nummers-en-codes-telecomaanbieders-aanvragen",
      verified_on: null,
    },
    {
      prefix: "88",
      line_type: "ngn",
      official_name: "business virtual numbers (088)",
      citation: "https://www.acm.nl/nl/telefoonnummers/nummers-en-codes-voor-telecomaanbieders/nummers-en-codes-telecomaanbieders-aanvragen",
      verified_on: null,
    },
  ],
};

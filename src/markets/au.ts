// au market tables. two anchor citations: australia post's addressing
// guidelines (po box and locked bag terms) and the official parcel locker
// and parcel collect address change page. that page documents the
// september 2026 format change, so both the old street-style format and
// the new short format are in the wild at the same time, which is exactly
// why this table carries two rows for the same service. fetched and
// verified 2026-10-08.

import type { MarketTables } from "../tables.js";

export const AU: MarketTables = {
  po_box_equivalents: [
    {
      label: "po box",
      languages: ["en"],
      patterns: ["\\bp\\.?\\s?o\\.?\\s?box\\b"],
      citation: "https://auspost.com.au/personal/sending/sending-guidelines/addressing-guidelines",
      verified_on: "2026-10-08",
    },
    {
      label: "locked bag",
      languages: ["en"],
      patterns: ["\\blocked\\s+bag\\s*\\d"],
      note: "au-specific po box shape: a numbered mail bag at an auspost outlet",
      citation: "https://auspost.com.au/personal/sending/sending-guidelines/addressing-guidelines",
      verified_on: "2026-10-08",
    },
  ],
  carrier_points: [
    {
      carrier: "australia post",
      service: "parcel locker (street-style format, pre-september 2026)",
      patterns: ["\\bparcel\\s+locker\\s*\\d"],
      format_note:
        "the pre-change format is street style: the parcel locker token and " +
        "locker id plus the 10-digit customer number, followed by the " +
        "locker site's full street address. old addresses keep working after " +
        "the change, so this row stays until the carrier retires the format",
      recheck_cadence_days: 90,
      citation: "https://auspost.com.au/ooh-address-change",
      verified_on: "2026-10-08",
    },
    {
      carrier: "australia post",
      service: "parcel locker (short format, from september 2026)",
      patterns: ["\\bparcel\\s+locker\\s*\\d+\\s*$"],
      format_note:
        "from september 2026 parcel locker addresses are short: the phrase " +
        "parcel locker and a short id in the street address field, with no " +
        "street number or name, then suburb, state and postcode as normal. " +
        "the same site is addressed both ways during the transition, so the " +
        "re-verification cadence is short",
      recheck_cadence_days: 90,
      citation: "https://auspost.com.au/ooh-address-change",
      verified_on: "2026-10-08",
    },
    {
      carrier: "australia post",
      service: "parcel collect",
      patterns: ["\\bparcel\\s*collect\\s*\\d"],
      format_note:
        "parcel collect is a staffed-counter pickup service at auspost " +
        "locations; its addresses changed shape at the same time as parcel " +
        "lockers (old: customer number plus the location's street address; " +
        "new: parcel collect plus a short id). both formats are in the wild",
      recheck_cadence_days: 90,
      citation: "https://auspost.com.au/ooh-address-change",
      verified_on: "2026-10-08",
    },
  ],
  format: {
    postal_code_pattern: "^\\d{4}$",
    required_fields: ["street", "city", "region", "postal_code"],
    citation: "https://auspost.com.au/personal/sending/sending-guidelines/addressing-guidelines",
    verified_on: "2026-10-08",
  },
};

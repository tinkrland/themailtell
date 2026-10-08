// nz market tables. nz post's terms page confirms the po box and private
// bag services as paired products. the parcel collect row is still an
// unverified seed. nz postcodes identify an area, not a delivery point.
// fetched and verified 2026-10-08 where noted.

import type { MarketTables } from "../tables.js";

export const NZ: MarketTables = {
  po_box_equivalents: [
    {
      label: "po box",
      languages: ["en"],
      patterns: ["\\bp\\.?\\s?o\\.?\\s?box\\b"],
      citation:
        "https://www.nzpost.co.nz/about-us/po-box-private-bag-terms-conditions-1-september-2023",
      verified_on: "2026-10-08",
    },
    {
      label: "private bag",
      languages: ["en"],
      patterns: ["\\bprivate\\s+bag\\s*\\d"],
      note: "a numbered mail bag at an nz post outlet, an nz-specific po box shape",
      citation:
        "https://www.nzpost.co.nz/about-us/po-box-private-bag-terms-conditions-1-september-2023",
      verified_on: "2026-10-08",
    },
  ],
  carrier_points: [
    {
      carrier: "new zealand post",
      service: "parcel collect",
      patterns: ["\\bparcel\\s*collect\\s*\\d"],
      format_note:
        "parcel collect routes parcels to an nz post location for pickup " +
        "instead of street delivery; verify the current address format " +
        "against nz post's own page before relying on this row",
      recheck_cadence_days: 180,
      citation: "https://www.nzpost.co.nz/personal/parcel-collect",
      verified_on: null,
    },
  ],
  format: {
    postal_code_pattern: "^\\d{4}$",
    required_fields: ["street", "city"],
    note:
      "nz postcodes identify an area, not a delivery point, and nz post " +
      "delivered without postcodes for most of its history; verify the " +
      "current requirement against nz post's own guidance",
    citation: "https://www.nzpost.co.nz/tools/postcode-finder",
    verified_on: null,
  },
};

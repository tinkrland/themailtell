// de market tables. deutsche post documents the postfach format on its
// addressing pages, and dhl's own packstation page documents the
// packstation address shape including where the postnummer goes. fetched
// and verified 2026-10-08.

import type { MarketTables } from "../tables.js";

export const DE: MarketTables = {
  po_box_equivalents: [
    {
      label: "postfach",
      languages: ["de"],
      // deutsche post writes postfach numbers with spaces ("postfach 10 64 38")
      patterns: ["\\bpostfach\\b"],
      citation: "https://www.deutschepost.de/de/b/briefumschlag-richtig-beschriften.html",
      verified_on: "2026-10-08",
    },
  ],
  carrier_points: [
    {
      carrier: "dhl",
      service: "packstation",
      // dhl's own page: the street field literally says packstation plus
      // the station number, and the postnummer goes in the address-addition
      // field or after the last name. the company field pattern documents
      // that part of the format.
      patterns: ["\\bpackstation\\s*\\d"],
      format_note:
        "dhl's own documentation: packstation plus the station number in " +
        "the street field, with the customer's dhl postnummer in the " +
        "address-addition field or after the last name. dhl also allows " +
        "shipments without a postnummer, so its absence is a format note, " +
        "not a reason to look away",
      recheck_cadence_days: 180,
      company_field_pattern: "\\d{6,10}",
      company_field_note:
        "the dhl postnummer, the customer's 6- to 10-digit dhl number, " +
        "documented to sit in the address-addition / company field",
      citation: "https://www.dhl.de/en/privatkunden/pakete-empfangen/an-einem-abholort-empfangen/packstation.html",
      verified_on: "2026-10-08",
    },
    {
      carrier: "dhl",
      service: "paketshop / postfiliale pickup",
      patterns: ["\\bpaketshop\\b", "\\bdhl\\s+paketshop\\b"],
      format_note:
        "staffed dhl shops accepting parcels for pickup; the address is the " +
        "shop's ordinary street address, so the token appears only when a " +
        "checkout writes the brand into the lines",
      recheck_cadence_days: 180,
      citation: "https://www.dhl.de/en/privatkunden/pakete-empfangen/an-einem-abholort-empfangen.html",
      verified_on: null,
    },
  ],
  format: {
    postal_code_pattern: "^\\d{5}$",
    required_fields: ["street", "city", "postal_code"],
    citation: "https://www.deutschepost.de/de/b/briefumschlag-richtig-beschriften.html",
    verified_on: "2026-10-08",
  },
};

// ie market tables. an post's parcel locker page confirms the locker
// network. the po box row is still an unverified seed (the an post po box
// page moved; find the current one before verifying). the eircode
// identifies the delivery point, but an post historically delivered
// without one, so the format row does not require it. fetched 2026-10-08.

import type { MarketTables } from "../tables.js";

export const IE: MarketTables = {
  po_box_equivalents: [
    {
      label: "po box",
      languages: ["en", "ga"],
      patterns: ["\\bp\\.?\\s?o\\.?\\s?box\\b", "\\bpost\\s+office\\s+box\\b"],
      note:
        "an post's po box page moved; locate the current service page and " +
        "verify before this row reaches recognized strength",
      citation: "https://www.anpost.com",
      verified_on: null,
    },
  ],
  carrier_points: [
    {
      carrier: "an post",
      service: "parcel locker",
      patterns: ["\\bparcel\\s+locker\\b"],
      format_note:
        "an post's parcel locker network is confirmed on its own pages; " +
        "the generic parcel locker token is shared with australia post's " +
        "rows, and market scoping keeps them separate. the locker's street " +
        "location is in the lines with the locker id",
      recheck_cadence_days: 180,
      citation: "https://www.anpost.com/Post-Parcels/Receiving/Parcel-Lockers",
      verified_on: "2026-10-08",
    },
  ],
  format: {
    postal_code_pattern: "^[ac-fhknprtv-y]\\d[\\dw] ?\\d[ac-fhknprtv-y]{4}$",
    required_fields: ["street", "city"],
    note:
      "the eircode identifies the delivery point; an post historically " +
      "delivered without it, so it is not listed as required here. verify " +
      "against an post's own addressing guidance before relying on that",
    citation: "https://www.eircode.ie/what-is-eircode",
    verified_on: null,
  },
};

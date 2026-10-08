// us market tables. usps publication 28 is the anchor citation for po box
// and cmra shapes: its sections 281-285 document the po box format, the
// caller/firm caller/bin/lockbox/drawer designations, po box street
// addressing (pbsa) and the cmra pmb rules. fetched and verified 2026-10-08.

import type { MarketTables } from "../tables.js";

export const US: MarketTables = {
  po_box_equivalents: [
    {
      label: "po box",
      languages: ["en"],
      patterns: [
        "\\bp\\.?\\s?o\\.?\\s?box\\b",
        "\\bpost\\s+office\\s+box\\b",
      ],
      citation: "https://pe.usps.com/cpim/ftp/pubs/pub28/pub28.pdf (pub28 sec. 281: PO BOX ##)",
      verified_on: "2026-10-08",
    },
    {
      label: "po box designations (caller, bin, lockbox, drawer)",
      languages: ["en"],
      // pub28 sec. 283: these words appear on po box addresses and are
      // standardized to PO BOX on output. they are po box shapes in the wild.
      patterns: [
        "\\bf\\w*\\s*caller\\b",
        "\\bcaller\\b",
        "\\bbin\\s*\\d",
        "\\block\\s?box\\b",
        "\\bdrawer\\b",
      ],
      note:
        "the single-word bin and drawer tokens can collide with ordinary " +
        "street text; matched only with a number or in po box context. verify " +
        "the pub28 designation list when this row fires before trusting it",
      citation: "https://pe.usps.com/cpim/ftp/pubs/pub28/pub28.pdf (pub28 sec. 283)",
      verified_on: "2026-10-08",
    },
    {
      label: "po box street addressing (pbsa)",
      languages: ["en"],
      // pub28 sec. 284 documents the pbsa shape: the post office's street
      // address plus the box number after a # or UNIT. a pbsa address is
      // written exactly like a street address with a secondary unit, so
      // there is no local pattern to match. the row exists to carry this
      // limitation into the output, never a signal.
      patterns: [],
      note:
        "po box street addressing writes the box as a street address with " +
        "a # or unit secondary (pub28 sec. 284): locally " +
        "indistinguishable from any apartment. local pattern detection alone " +
        "cannot catch every box-shaped address for exactly this reason; a " +
        "carrier validation adapter is the stronger evidence path",
      citation: "https://pe.usps.com/cpim/ftp/pubs/pub28/pub28.pdf (pub28 sec. 284)",
      verified_on: "2026-10-08",
    },
  ],
  carrier_points: [
    {
      carrier: "amazon",
      service: "hub locker",
      patterns: ["\\bamazon\\s+hub\\b", "\\bamazon\\s+locker\\b"],
      format_note:
        "the amazon locker service and its collect flow are confirmed on the " +
        "amazon help pages; the locker's address lines carry the location's " +
        "street address with the locker unit. the checkout addressing format " +
        "is not documented on that page and needs its own verification",
      recheck_cadence_days: 180,
      citation: "https://www.amazon.com/gp/help/customer/display.html?nodeId=GRQMENKQV9RQ6BWF",
      verified_on: "2026-10-08",
    },
    {
      carrier: "UPS",
      service: "access point",
      patterns: ["\\bups\\s+access\\s+point\\b", "\\baccess\\s+point\\b"],
      format_note:
        "ups access point locations are staffed shops; an address routed to " +
        "one is the shop's own street address with the parcel held for " +
        "pickup, so the token usually appears only when the checkout writes " +
        "the brand into the lines",
      recheck_cadence_days: 180,
      citation: "https://www.ups.com/us/en/business-solutions/expand-your-online-business/ups-access-point",
      verified_on: "2026-10-08",
    },
    {
      carrier: "fedex",
      service: "hold at location (ship-site pickup)",
      patterns: ["\\bhold\\s+at\\s+location\\b", "\\bfedex\\s+onsite\\b"],
      format_note:
        "the service is confirmed on the fedex hold-at-location page; the " +
        "ship-site pickup address is the fedex facility's own street address. " +
        "the token rarely appears in written address lines, and absence of " +
        "the token is not evidence the address is not a pickup point",
      recheck_cadence_days: 180,
      citation: "https://www.fedex.com/en-us/shipping/hold-at-location.html",
      verified_on: "2026-10-08",
    },
  ],
  format: {
    postal_code_pattern: "^\\d{5}(-?\\d{4})?$",
    required_fields: ["street", "city", "region", "postal_code"],
    citation: "https://pe.usps.com/cpim/ftp/pubs/pub28/pub28.pdf",
    verified_on: "2026-10-08",
  },
};

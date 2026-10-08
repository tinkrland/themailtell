// es market tables. correos' own pages document the apartado postal
// (including its use for receiving without a domicilio) and the citypaq
// locker network. fetched and verified 2026-10-08.

import type { MarketTables } from "../tables.js";

export const ES: MarketTables = {
  po_box_equivalents: [
    {
      label: "apartado (postal / de correos)",
      languages: ["es"],
      patterns: ["\\bapartado\\s+de\\s+correos\\b", "\\bapartado\\s+postal\\b", "\\bapartado\\s*\\d"],
      citation: "https://www.correos.es/es/es/particulares/recibir/planifica-tus-entregas/apartado-postal",
      verified_on: "2026-10-08",
    },
  ],
  carrier_points: [
    {
      carrier: "correos",
      service: "citypaq",
      patterns: ["\\bcitypaq\\b", "\\bcasillero\\b"],
      format_note:
        "citypaq is correos' network of parcel lockers and office boxes; " +
        "the address carries the citypaq name and the user's casillero " +
        "number. the page confirms the service; the exact checkout address " +
        "format should be re-verified when this row fires",
      recheck_cadence_days: 180,
      citation: "https://www.correos.es/es/es/particulares/recibir/nuestros-puntos-de-entrega-y-recogida/citypaq",
      verified_on: "2026-10-08",
    },
  ],
  format: {
    postal_code_pattern: "^\\d{5}$",
    required_fields: ["street", "city", "postal_code"],
    citation: "https://www.correos.es",
    verified_on: null,
  },
};

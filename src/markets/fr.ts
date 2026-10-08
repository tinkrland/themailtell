// fr market tables. la poste's own help pages document the boite postale
// address requirements and the pickup network (15 000 points pickup, with
// relais pickup staffed points and consigne pickup self-service lockers);
// the cedex history page on laposte's domain documents the scheme itself.
// fetched and verified 2026-10-08.

import type { MarketTables } from "../tables.js";

export const FR: MarketTables = {
  po_box_equivalents: [
    {
      label: "boite postale / bp",
      languages: ["fr"],
      patterns: ["\\bb\\.?\\s?p\\.?\\s*\\d", "\\bboite\\s+postale\\b", "\\bbox\\s+postale\\b"],
      citation:
        "https://aide.laposte.fr/professionnel/contenu/quelles-sont-les-mentions-obligatoires-de-l-adresse-boite-postale",
      verified_on: "2026-10-08",
    },
    {
      label: "cedex",
      languages: ["fr"],
      patterns: ["\\bcedex\\b"],
      note:
        "cedex (courrier d'entreprise a distribution exceptionnelle) is a " +
        "special high-volume distribution scheme with its own postal " +
        "identifiers; it is po box shaped for delivery purposes",
      citation:
        "https://comitehistoire.laposte.fr/publication/il-y-a-40-ans-la-naissance-du-cedex/",
      verified_on: "2026-10-08",
    },
  ],
  carrier_points: [
    {
      carrier: "la poste",
      service: "pickup (relais pickup / consigne pickup)",
      patterns: ["\\brelais\\s+pickup\\b", "\\bconsigne\\s+pickup\\b", "\\bpickup\\b"],
      format_note:
        "la poste's pickup network (15 000 points) splits into staffed relais " +
        "pickup points and self-service consigne pickup lockers; the token " +
        "appears when a checkout writes the brand into the lines. staffed " +
        "points are ordinary street addresses, so absence of the token is " +
        "not evidence of a street address",
      recheck_cadence_days: 180,
      citation: "https://www.laposte.fr/conseils-pratiques/la-livraison-en-consigne-pickup-station",
      verified_on: "2026-10-08",
    },
  ],
  format: {
    postal_code_pattern: "^\\d{5}$",
    required_fields: ["street", "city", "postal_code"],
    citation: "https://www.laposte.fr",
    verified_on: null,
  },
};

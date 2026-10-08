// facility-address table: known facility street addresses of mailbox
// providers and parcel forwarders, as each provider publishes them on its
// own location pages. matched against the full address (street-line
// prefix plus postal code, suite-insensitive), so an unbranded suite
// address at a known facility is caught without any adapter.
//
// this is an enumerated snapshot of a moving target: providers open and
// close locations, so absence of a facility match is never evidence of a
// private residence. every row carries its own citation, verification
// date and a short recheck cadence.
//
// every row below was read from the provider's own location/contact page
// on 2026-10-08. us forwarder rows (myus, planet express, stackry and
// peers) follow the same discipline as their citations come in.

import type { FacilityAddressEntry } from "../tables.js";

export const FACILITY_ADDRESSES: FacilityAddressEntry[] = [
  {
    provider: "forward2me",
    kind: "mail_forwarder",
    market: "gb",
    street: "York House, Green Lane West",
    city: "Preston",
    region: "Lancashire",
    postal_code: "PR3 1NJ",
    citation: "https://www.forward2me.com/terms-of-trade",
    verified_on: "2026-10-08",
    recheck_cadence_days: 180,
  },
  {
    provider: "myukmailbox",
    kind: "mail_forwarder",
    market: "gb",
    street: "Unit F, Winston Business Park Churchill Way",
    city: "Sheffield",
    region: "South Yorkshire",
    postal_code: "S35 2PS",
    citation: "https://www.myukmailbox.com/contact",
    verified_on: "2026-10-08",
    recheck_cadence_days: 180,
  },
  {
    provider: "uk postbox",
    kind: "virtual_mailbox",
    market: "gb",
    street: "13 Freeland Park, Wareham Road",
    city: "Lytchett Matravers, Poole",
    region: "Dorset",
    postal_code: "BH16 6FH",
    citation: "https://www.ukpostbox.com/contact",
    verified_on: "2026-10-08",
    recheck_cadence_days: 180,
  },
  {
    provider: "reship",
    kind: "mail_forwarder",
    market: "gb",
    street: "68 Tanners Drive, Blakelands",
    city: "Milton Keynes",
    region: "Buckinghamshire",
    postal_code: "MK14 5BP",
    citation: "https://www.reship.com/about",
    verified_on: "2026-10-08",
    recheck_cadence_days: 180,
  },
  {
    provider: "colisexpat",
    kind: "mail_forwarder",
    market: "fr",
    street: "110bis, Avenue du Général Leclerc",
    city: "Pantin",
    region: "Seine-Saint-Denis",
    postal_code: "93500",
    citation: "https://www.colisexpat.com/en/",
    verified_on: "2026-10-08",
    recheck_cadence_days: 180,
  },
  {
    provider: "mygermany (forward2me gmbh)",
    kind: "mail_forwarder",
    market: "de",
    street: "Schwedter Allee 23",
    city: "Schwedt",
    region: "Brandenburg",
    postal_code: "16303",
    citation: "https://mygermany.com/contact/",
    verified_on: "2026-10-08",
    recheck_cadence_days: 180,
  },
  {
    provider: "reship",
    kind: "mail_forwarder",
    market: "ca",
    street: "135-21320 Gordon Way",
    city: "Richmond",
    region: "BC",
    postal_code: "V6W 1J8",
    citation: "https://www.reship.com/about",
    verified_on: "2026-10-08",
    recheck_cadence_days: 180,
  },
  {
    provider: "reship",
    kind: "mail_forwarder",
    market: "us",
    street: "13820 NE Airport Way",
    city: "Portland",
    region: "OR",
    postal_code: "97251",
    citation: "https://www.reship.com/about",
    verified_on: "2026-10-08",
    recheck_cadence_days: 180,
  },
];

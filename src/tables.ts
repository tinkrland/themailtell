// tables.ts — intelligence table row types and the table registry.
//
// every row carries the citation it came from and a verification date, and
// goes stale like any other table: signals are stamped with the row's
// verification date so an unmaintained table stops producing claims on its
// own (see the aggregation stage). a row whose verified_on is null is an
// unverified seed: it can only ever produce a suggestive signal, never a
// recognized one, until someone verifies it against the citation.
//
// carrier rows additionally carry a recheck cadence: carrier address
// formats change on the carrier's own schedule (australia post changed its
// parcel locker address format in 2026, so both formats were in the wild at
// once), so each carrier row says how often its citation should be
// re-verified.
//
// layout: one file per market under src/markets/, so adding a market is
// additive rows in a new file, never a change to the matching code.

export const TABLE_VERSION = "seed/0.1.0";

// a po box equivalent, in one of the market's official languages.
export interface PoBoxEntry {
  // canonical name of the shape, e.g. "po box", "postfach", "locked bag"
  label: string;
  // official languages this label is used in, e.g. ["en"], ["fr", "de", "it"]
  languages: string[];
  // regex sources matched against normalized address lines (lowercased,
  // diacritic-folded). an empty array means the shape exists in the market
  // but is not locally detectable (see note).
  patterns: string[];
  note?: string;
  citation: string;
  // iso date this row was verified against its citation, or null for an
  // unverified seed row
  verified_on: string | null;
}

// a carrier locker or pickup-point address format.
export interface CarrierPointEntry {
  // carrier name in its exact case, e.g. "dhl", "australia post", "UPS"
  carrier: string;
  // the carrier's own name for the service, e.g. "packstation"
  service: string;
  // regex sources matched against normalized address lines
  patterns: string[];
  // human description of the documented address format
  format_note: string;
  // true when the service is itself a po box shape (canada post
  // flexdelivery is a free staffed po box); the stage emits both signals
  // and they count as one linked finding, not a mix.
  is_po_box_shape?: boolean;
  // how often this row's citation must be re-verified, in days
  recheck_cadence_days: number;
  // some documented formats put a carrier customer number in the company
  // field (the dhl postnummer); this pattern documents that part of the
  // format. its absence is a format note, never a reason to drop the match.
  company_field_pattern?: string;
  company_field_note?: string;
  note?: string;
  citation: string;
  verified_on: string | null;
}

// a commercial mail receiving agency, virtual mailbox, virtual office, or
// a generic cmra disclosure marker like the us pmb designation (a legal
// requirement, not a brand: the row carries no provider because any cmra
// address must use it).
export interface MailboxProviderEntry {
  // provider brand in its exact case, e.g. "the ups store", "regus"
  provider: string;
  kind:
    | "cmra_chain"
    | "virtual_mailbox"
    | "virtual_office"
    | "cmra_marker"
    // a parcel-forwarding / reshipping facility: emits the
    // mail_forwarding_or_reshipping signal, never the cmra signal
    | "mail_forwarder";
  markets: string[];
  // regex sources matched against normalized address lines. empty patterns
  // means the provider's addresses carry no distinctive token (many issue
  // plain street-style suite addresses), which is itself documented.
  patterns: string[];
  note?: string;
  citation: string;
  verified_on: string | null;
}

// per-market street-address format rules.
export interface MarketFormatEntry {
  // regex source for the postal code, or null when the market's postal
  // codes have no published machine-checkable pattern
  postal_code_pattern: string | null;
  // fields a normal street address requires
  required_fields: Array<"street" | "city" | "postal_code" | "region">;
  note?: string;
  citation: string;
  verified_on: string | null;
}

export interface MarketTables {
  po_box_equivalents: PoBoxEntry[];
  carrier_points: CarrierPointEntry[];
  format: MarketFormatEntry;
}

export type Normalizer = (text: string) => string;

// matching text normalization: lowercase and fold diacritics so official
// spellings match however they were typed ("boîte postale" and "boite
// postale" both match). the original address lines are never rewritten;
// normalization happens on a copy for matching only.
export function normalizeForMatch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

// the date this table set was last assembled or re-verified. rows carry
// their own verified_on; this date is the fallback for unverified rows so
// an unmaintained table still goes stale as a whole.
export const TABLE_AS_OF = "2026-10-08";

// a known facility street address of a mailbox provider or a parcel
// forwarder, as the provider publishes it on its own location pages.
// matched against the full address (street-line prefix plus postal code,
// suite-insensitive), which catches branded-suite and unbranded-suite use
// at a known facility without any adapter.
//
// the table is an enumerated snapshot of a moving target: providers open
// and close locations, so a row's absence is never evidence that an
// address is a private residence, and every row carries its own recheck
// cadence.
export interface FacilityAddressEntry {
  provider: string;
  // which shape class this facility belongs to: virtual_mailbox,
  // cmra_chain, virtual_office and cmra_marker emit the
  // cmra_or_virtual_mailbox signal; mail_forwarder emits
  // mail_forwarding_or_reshipping
  kind:
    | "virtual_mailbox"
    | "cmra_chain"
    | "virtual_office"
    | "cmra_marker"
    | "mail_forwarder";
  market: string;
  // the facility street address exactly as published (street number and
  // name), matched as a normalized prefix of an address line
  street: string;
  city: string;
  region?: string;
  postal_code: string;
  note?: string;
  citation: string;
  verified_on: string | null;
  // facilities open and close; the table must be rechecked on its own
  // (short) cadence, faster than format rows
  recheck_cadence_days: number;
}

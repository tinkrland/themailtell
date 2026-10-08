// stage 4b: known facility street addresses.
//
// a provider or forwarder whose brand does not appear in the address
// lines can still be caught when the address IS the facility: the street
// line starts with the facility's published street address (suite number
// and floor come after it, so a different suite at the same facility still
// matches by design) and the postal code matches.
//
// match rule, stated honestly: normalized street-line prefix plus postal
// code equality. the facility street must come first in the line, the
// way providers instruct customers to write it; a suite written before
// the street will not match locally.
//
// the table is a snapshot of a moving target, so absence of a match is
// never evidence of a private residence: that limitation is reported
// whenever the market has facility rows and nothing matched.

import { TABLE_VERSION, TABLE_AS_OF, type FacilityAddressEntry } from "../tables.js";
import type { Signal, SignalName } from "../schema.js";
import type { InputHandle } from "./input-handling.js";

export interface FacilityOutcome {
  signals: Signal[];
  limitations: string[];
}

function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function startsWithStreet(line: string, street: string): boolean {
  if (!line.startsWith(street)) return false;
  const next = line.charAt(street.length);
  if (next === "") return true;
  if (/[^a-z]/.test(next)) return true;
  // a letter right after a digit is a house-number suffix (german
  // "schwedter allee 23d" for facility "schwedter allee 23"), not a
  // longer street name like "broadway" vs "broadwayview"
  return /\d/.test(street.charAt(street.length - 1));
}

export function facilityIntelligence(
  input: InputHandle,
  facilities: FacilityAddressEntry[]
): FacilityOutcome {
  const signals: Signal[] = [];
  const limitations: string[] = [];

  if (facilities.length === 0) {
    return { signals, limitations };
  }

  const inputPostal = fold(input.address.postal_code ?? "");
  for (const facility of facilities) {
    const street = fold(facility.street);
    const streetMatch = input.match_lines.some((line) =>
      startsWithStreet(line, street)
    );
    const postalMatch = inputPostal !== "" && inputPostal === fold(facility.postal_code);
    if (!(streetMatch && postalMatch)) continue;

    const verified = facility.verified_on !== null;
    const name: SignalName =
      facility.kind === "mail_forwarder"
        ? "mail_forwarding_or_reshipping"
        : "cmra_or_virtual_mailbox";
    signals.push({
      name,
      scope: "address",
      source: `facility-table/${TABLE_VERSION} row:${facility.provider} ${facility.city} (citation: ${facility.citation})`,
      observed_at: facility.verified_on ?? TABLE_AS_OF,
      strength: verified ? "recognized" : "suggestive",
      coverage: "none",
      detail:
        `the street line is the known ${facility.provider} facility address ` +
        `(${street}, ${facility.city}, ${facility.postal_code}), matched with ` +
        `the suite or unit ignored: any suite at this facility is the ` +
        `provider's space` +
        (verified
          ? ""
          : "; this facility row is an unverified seed, verify it against its citation"),
    });
    if (!verified) {
      limitations.push(
        `the ${facility.provider} facility row (${facility.city}) is an unverified ` +
          `seed; verify it against its citation (${facility.citation})`
      );
    }
    limitations.push(
      `facility row ${facility.provider} (${facility.city}) verified ` +
        `${facility.verified_on ?? "never"}; recheck every ` +
        `${facility.recheck_cadence_days} days: providers open and close ` +
        `locations on their own schedule`
    );
  }

  if (signals.length === 0) {
    limitations.push(
      `no known facility address matched for market ${input.market}; the ` +
        `facility table is an enumerated snapshot of a moving target ` +
        `(providers open and close locations), so absence of a match is ` +
        `never evidence of a private residence`
    );
  }

  return { signals, limitations };
}

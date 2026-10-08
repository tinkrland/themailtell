// stage 3: carrier intelligence for parcel lockers and pickup points.
// matches the market's carrier table against the normalized address lines
// (and the company field, where a carrier's customer number like the dhl
// postnummer lives). a flexdelivery-style row that is itself a po box shape
// emits a linked pair of signals sharing one source, so aggregation counts
// them as one finding rather than a mix.

import { TABLE_VERSION, TABLE_AS_OF } from "../tables.js";
import type { MARKET_TABLES } from "../markets/index.js";
import type { Signal } from "../schema.js";
import { matchTexts, type InputHandle } from "./input-handling.js";

export interface CarrierOutcome {
  signals: Signal[];
  limitations: string[];
}

export function carrierIntelligence(
  input: InputHandle,
  tables: (typeof MARKET_TABLES)[string]
): CarrierOutcome {
  const signals: Signal[] = [];
  const limitations: string[] = [];

  for (const entry of tables.carrier_points) {
    const patterns = entry.patterns.map((p) => new RegExp(p));
    const texts = matchTexts(input);
    const matchedLine = texts.some((line) => patterns.some((re) => re.test(line)));
    if (!matchedLine) continue;

    const verified = entry.verified_on !== null;
    const strength = verified ? "recognized" : "suggestive";
    const observed_at = entry.verified_on ?? TABLE_AS_OF;
    const detail = verified
      ? `address matches the verified ${entry.carrier} ${entry.service} format for market ${input.market}`
      : `address matches the ${entry.carrier} ${entry.service} format for market ${input.market}, an unverified seed row`;
    // one source string per row, so a row's linked signals group together
    const source = `builtin-table/${TABLE_VERSION} row:${entry.carrier}/${entry.service} (citation: ${entry.citation})`;

    signals.push({
      name: "parcel_locker_or_pickup_point",
      scope: "carrier",
      source,
      observed_at,
      strength,
      coverage: "none",
      detail:
        detail + `; documented format: ${entry.format_note}` +
        (entry.is_po_box_shape ? "; this service is itself a po box shape, reported as both" : ""),
    });

    if (entry.is_po_box_shape) {
      // linked finding: the same row, reported as a po box too, and the
      // po box table does not need a separate match for it
      signals.push({
        name: "po_box_equivalent",
        scope: "carrier",
        source,
        observed_at,
        strength,
        coverage: "none",
        detail: `${entry.carrier} ${entry.service} is a po box shape (a staffed po box service); the same carrier row is reported under both signal names`,
      });
    }

    if (entry.company_field_pattern) {
      const companyGiven = (input.address.company ?? "").trim();
      if (companyGiven === "") {
        limitations.push(
          `the documented ${entry.carrier} ${entry.service} format includes a customer ` +
            `number in the company field (${entry.company_field_note}); none was ` +
            `found here, which is a format note, not a reason to look away`
        );
      } else if (new RegExp(entry.company_field_pattern).test(input.match_company)) {
        limitations.push(
          `the company field matches the ${entry.carrier} ${entry.service} customer ` +
            `number pattern (${entry.company_field_note})`
        );
      }
    }

    if (!verified) {
      limitations.push(
        `the ${entry.carrier} ${entry.service} row for market ${input.market} is an unverified ` +
          `seed; verify it against its citation (${entry.citation}). ` +
          `this row's re-verification cadence is every ${entry.recheck_cadence_days} days: ` +
          `carrier formats change on the carrier's schedule`
      );
    } else {
      // the cadence travels with the row so maintainers can see it in output
      limitations.push(
        `${entry.carrier} ${entry.service} format row verified ${entry.verified_on}; ` +
          `re-verify every ${entry.recheck_cadence_days} days (carrier formats change on the carrier's schedule)`
      );
    }
  }

  if (tables.carrier_points.length > 0 && signals.length === 0) {
    limitations.push(
      "no carrier locker or pickup-point token matched; staffed pickup points " +
        "are ordinary street addresses, so absence of a token is not evidence " +
        "the address is not a pickup point"
    );
  }

  return { signals, limitations };
}

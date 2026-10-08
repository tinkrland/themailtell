// input parsing. the parser is injected: the core never parses anything
// itself. this module provides the default parser built on
// libphonenumber-js, and it never rewrites the number: the original input
// is preserved verbatim, the e.164 form is reported for traceability, and
// invalid inputs get an honest machine reason instead of a silent fixup.

import {
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  type CountryCode,
} from "libphonenumber-js";
import type { ParseEvidence } from "../tables.js";

export type LengthError = ReturnType<typeof validatePhoneNumberLength>;

/** map libphonenumber length errors to honest human-readable reasons */
const REASONS: Record<string, string> = {
  INVALID_COUNTRY: "the country calling code is not a valid one",
  NOT_A_NUMBER: "the input contains no recognizable phone number",
  TOO_SHORT: "the number is too short to be a valid number for its market",
  TOO_LONG: "the number is too long to be a valid number for its market",
  INVALID_LENGTH: "the length is invalid for a number of this market",
};

export function parseInput(input: string, observed_at: string): ParseEvidence {
  // surrounding whitespace is parse hygiene, not a rewrite: the original
  // input is preserved verbatim in the evidence
  const trimmed = input.trim();
  const lengthError = validatePhoneNumberLength(trimmed as never);
  if (lengthError) {
    return {
      valid: false,
      reason: REASONS[lengthError] ?? `unparseable input (${lengthError})`,
      e164: null,
      national_significant_number: null,
      country_code: null,
      market: null,
      input,
      observed_at,
    };
  }
  // validatePhoneNumberLength passes inputs without a default market; for
  // those, parsing itself decides validity.
  const parsed = parsePhoneNumberFromString(trimmed as never, undefined as never as CountryCode);
  if (!parsed || !parsed.isValid()) {
    return {
      valid: false,
      reason:
        "the number parses structurally but is not an assigned valid number " +
        "for its market",
      e164: null,
      national_significant_number: null,
      country_code: null,
      market: null,
      input,
      observed_at,
    };
  }
  return {
    valid: true,
    e164: parsed.number,
    national_significant_number: parsed.nationalNumber,
    country_code: parsed.countryCallingCode,
    market: parsed.country ? parsed.country.toLowerCase() : null,
    input,
    observed_at,
  };
}

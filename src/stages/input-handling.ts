// stage 1: input handling.
// validates the address shape with no product-specific acceptance rules
// and never rewrites the lines: matching happens on a normalized copy, and
// the original text is preserved verbatim for the caller. diacritics are
// never stripped from the stored address; the normalization happens per
// match in the tables module.
//
// every free-text field is folded into the match text: box-shaped markers
// conventionally live on any line ("PO Box 123" as a line, "Paris Cedex 07"
// as the city, "Locked Bag 5" as the company field), so the lexical,
// carrier and provider stages scan lines, city and region alike. the
// company field keeps its own folded copy because the carrier stage
// matches carrier customer numbers there under their own patterns.

export interface PostalAddress {
  // iso 3166-1 alpha-2 code, "market" in every user-facing string
  market: string;
  // address lines as given, verbatim, in order (line 1, line 2, ...)
  lines: string[];
  city?: string;
  // state / province / region
  region?: string;
  postal_code?: string;
  // company or address-addition field, where a carrier's customer number
  // (e.g. the dhl postnummer) often lands. matched by the carrier stage.
  company?: string;
}

export interface InputHandle {
  valid: boolean;
  invalid_reason?: string;
  address: PostalAddress;
  // lowercased market code; undefined when the market is not a two-letter code
  market?: string;
  // lowercased, diacritic-folded text of each line, for matching only
  match_lines: string[];
  // folded city and region, folded the same way as the lines
  match_city: string;
  match_region: string;
  match_company: string;
}

const MAX_LINES = 8;
const MAX_LINE = 200;

export function handleInput(address: PostalAddress): InputHandle {
  const fail = (reason: string): InputHandle => ({
    valid: false,
    invalid_reason: reason,
    address,
    match_lines: [],
    match_city: "",
    match_region: "",
    match_company: "",
  });

  if (typeof address !== "object" || address === null) {
    return fail("address is not an object");
  }
  const market = typeof address.market === "string" ? address.market.trim().toLowerCase() : "";
  if (!/^[a-z]{2}$/.test(market)) {
    return fail("market must be a two-letter iso 3166-1 alpha-2 code");
  }
  if (!Array.isArray(address.lines)) {
    return fail("address lines are missing");
  }
  const anyContent = [
    ...address.lines,
    address.city,
    address.region,
    address.postal_code,
    address.company,
  ]
    .filter((x): x is string => typeof x === "string")
    .join(" ")
    .trim();
  if (anyContent.length === 0) {
    return fail("empty address");
  }
  if (address.lines.length > MAX_LINES) {
    return fail(`address exceeds ${MAX_LINES} lines`);
  }
  for (const line of address.lines) {
    if (typeof line !== "string") {
      return fail("address lines must be strings");
    }
    if (line.length > MAX_LINE) {
      return fail("address line exceeds maximum length");
    }
  }

  // normalizing happens on copies; the address object itself is untouched
  const fold = (s: string | undefined) =>
    (s ?? "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();

  return {
    valid: true,
    address,
    market,
    match_lines: address.lines.map((l) => fold(l)),
    match_city: fold(address.city),
    match_region: fold(address.region),
    match_company: fold(address.company),
  };
}

// the free-text fields the pattern stages scan: every line plus the city
// and region, folded. the company field is scanned separately by the
// carrier stage under its own patterns.
export function matchTexts(input: InputHandle): string[] {
  return [...input.match_lines, input.match_city, input.match_region].filter(
    (t) => t.length > 0
  );
}

// whether any address content exists beyond whitespace
export function hasContent(input: InputHandle): boolean {
  const joined = [
    ...input.address.lines,
    input.address.city,
    input.address.region,
    input.address.postal_code,
    input.address.company,
  ]
    .filter((x): x is string => typeof x === "string")
    .join(" ")
    .trim();
  return joined.length > 0;
}

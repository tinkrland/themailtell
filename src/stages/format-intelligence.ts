// stage 5: format validity intelligence.
// checks the address against the market's documented format rules: missing
// street address, unparseable content, missing or malformed postal code,
// and the market's required fields. format validity is the one offline-
// checkable claim, so issues are recognized when the rule row is verified.
// markets without a table get no format claim at all: unknown, not valid.

import { TABLE_VERSION, TABLE_AS_OF } from "../tables.js";
import type { MARKET_TABLES } from "../markets/index.js";
import type { Signal } from "../schema.js";
import type { InputHandle } from "./input-handling.js";

export interface FormatOutcome {
  signals: Signal[];
  limitations: string[];
  finding: "valid" | "issues_found" | "unknown";
}

export function formatIntelligence(
  input: InputHandle,
  tables: (typeof MARKET_TABLES)[string] | undefined
): FormatOutcome {
  const signals: Signal[] = [];
  const limitations: string[] = [];
  if (!tables) {
    return {
      signals,
      limitations: [
        `market ${input.market} has no local format table; format validity is unknown, not valid`,
      ],
      finding: "unknown",
    };
  }

  const entry = tables.format;
  const base = {
    scope: "market" as const,
    source: `builtin-table/${TABLE_VERSION} row:${input.market}/format (citation: ${entry.citation})`,
    observed_at: entry.verified_on ?? TABLE_AS_OF,
    coverage: "none" as const,
  };
  const make = (detail: string): Signal => ({
    ...base,
    name: "format_issue",
    strength: entry.verified_on ? "recognized" : "suggestive",
    detail,
  });

  const anyStreetish = input.match_lines.some((l) => l.trim().length > 0);
  if (!anyStreetish) {
    signals.push(make("no street address line was found in the address"));
  }

  if (typeof input.address.postal_code !== "string" || input.address.postal_code.trim() === "") {
    if (entry.required_fields.includes("postal_code")) {
      signals.push(make("postal code is missing, and market rules require it"));
    } else {
      limitations.push(
        `market ${input.market} does not list a postal code as required; ` +
          `its absence is noted, not reported as a format issue`
      );
    }
  } else if (entry.postal_code_pattern) {
    const ok = new RegExp(entry.postal_code_pattern, "i").test(input.address.postal_code.trim());
    if (!ok) {
      signals.push(
        make(
          `postal code does not match the market pattern (${entry.postal_code_pattern}); ` +
            `verify against the citation before treating it as malformed`
        )
      );
    }
  }

  const fieldPresent = (v: unknown) => typeof v === "string" && v.trim() !== "";
  const label: Record<string, string> = {
    street: "street",
    city: "city",
    postal_code: "postal code",
    region: "region",
  };
  for (const f of entry.required_fields) {
    if (f === "street") {
      // handled above
      continue;
    }
    const value =
      f === "city" ? input.address.city : f === "region" ? input.address.region : input.address.postal_code;
    if (!fieldPresent(value)) {
      signals.push(make(`${label[f]} is missing, and market rules require it`));
    }
  }

  if (entry.verified_on === null) {
    limitations.push(
      `the format row for market ${input.market} is an unverified seed; ` +
        `verify it against its citation (${entry.citation})`
    );
  }

  return {
    signals,
    limitations,
    finding: signals.length > 0 ? "issues_found" : "valid",
  };
}

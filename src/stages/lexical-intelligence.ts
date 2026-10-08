// stage 2: lexical intelligence for po box equivalents.
// scans the normalized address lines against the market's po box table and
// emits po_box_equivalent signals. rows verified against their citation
// emit recognized signals and age from their verification date; unverified
// seed rows can only ever emit suggestive signals, and the gap is reported
// as a limitation rather than hidden. rows with no patterns (the us pbsa
// row) contribute their limitation, never a signal.

import { TABLE_VERSION, TABLE_AS_OF } from "../tables.js";
import type { MARKET_TABLES } from "../markets/index.js";
import type { Signal } from "../schema.js";
import type { InputHandle } from "./input-handling.js";

export interface LexicalOutcome {
  signals: Signal[];
  limitations: string[];
}

export function lexicalIntelligence(
  input: InputHandle,
  tables: (typeof MARKET_TABLES)[string]
): LexicalOutcome {
  const signals: Signal[] = [];
  const limitations: string[] = [];

  for (const entry of tables.po_box_equivalents) {
    if (entry.patterns.length === 0) {
      // documented but not locally detectable; the note explains why
      if (entry.note) {
        limitations.push(`market ${input.market}: ${entry.note} (${entry.label})`);
      }
      continue;
    }
    const matched = entry.patterns.some((p) =>
      input.match_lines.some((line) => new RegExp(p).test(line))
    );
    if (!matched) continue;

    const verified = entry.verified_on !== null;
    signals.push({
      name: "po_box_equivalent",
      scope: "address",
      source: `builtin-table/${TABLE_VERSION} row:${entry.label} (citation: ${entry.citation})`,
      // the knowledge ages from the row's verification date, not the
      // lookup; unverified rows age from the table's as-of date
      observed_at: entry.verified_on ?? TABLE_AS_OF,
      strength: verified ? "recognized" : "suggestive",
      // local tables are not an external check; coverage stays none
      coverage: "none",
      detail: verified
        ? `address lines match the verified ${entry.label} pattern for market ${input.market}`
        : `address lines match the ${entry.label} pattern for market ${input.market}, an unverified seed row; verify the table row before relying on it`,
    });
    if (!verified) {
      limitations.push(
        `the ${entry.label} row for market ${input.market} is an unverified seed; ` +
          `verify it against its citation (${entry.citation}) to raise its strength`
      );
    }
  }

  return { signals, limitations };
}

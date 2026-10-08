// numbering-plan stage: deterministic per-market range intelligence from
// the regulator tables. pure: no network, no clock (the observation time
// is passed in). withdrawn ranges decay instead of asserting: comreg
// withdrew ireland's 076 voip range in january 2022, and numbers may
// persist in databases and in the wild long after withdrawal.

import type { MarketTables, NumberingPlanRow, ParseEvidence } from "../tables.js";
import { MARKETS } from "../markets/index.js";
import type { Signal } from "../schema.js";

export interface NumberingPlanOutput {
  signals: Signal[];
  /** the line type the matched range indicates, when it indicates one */
  line_type: NumberingPlanRow["line_type"] | null;
  /** the matched row is a virtual/voip-style range (line_type "other") */
  virtual_range: boolean;
  /** a withdrawn range matched; its old designation must not be asserted */
  withdrawn: boolean;
  limitation: string | null;
}

/** longest prefix wins, so "0850" beats "08" when both exist */
function matchRow(tables: MarketTables, nsn: string): NumberingPlanRow | null {
  let best: NumberingPlanRow | null = null;
  for (const row of tables.ranges) {
    if (nsn.startsWith(row.prefix)) {
      if (!best || row.prefix.length > best.prefix.length) best = row;
    }
  }
  return best;
}

export function numberingPlanStage(
  parse: ParseEvidence,
  observed_at: string,
  max_age_days: number,
): NumberingPlanOutput {
  const signals: Signal[] = [];
  let line_type: NumberingPlanRow["line_type"] | null = null;
  let virtual_range = false;
  let withdrawn = false;
  let limitation: string | null = null;

  if (!parse.valid || !parse.market || !parse.national_significant_number) {
    return { signals, line_type: null, virtual_range: false, withdrawn: false, limitation: null };
  }
  const tables = MARKETS[parse.market];
  if (!tables) {
    // an unseeded market is unknown, never evidence of anything
    return {
      signals,
      line_type: null,
      virtual_range: false,
      withdrawn: false,
      limitation:
        `market ${parse.market} is not in the seeded tables; nothing was ` +
        `evaluated for it and every line-type finding stays unknown, which ` +
        `is a statement about the search, never a verdict`,
    };
  }
  if (tables.ranges.length === 0 && tables.note) {
    limitation = `market ${parse.market}: ${tables.note}`;
  }

  const row = matchRow(tables, parse.national_significant_number);
  if (!row) {
    // no range matched. that says something about the plan's coverage, and
    // nothing about the number's line type.
    limitation = `market ${parse.market}: no numbering-plan range matched; the numbering plan says nothing about this number's line type`;
    return { signals, line_type: null, virtual_range: false, withdrawn: false, limitation };
  }

  let strength: Signal["strength"];
  if (row.withdrawn_on) {
    strength = "unresolved";
    withdrawn = true;
  } else if (!row.verified_on) {
    strength = "suggestive";
  } else if (ageDays(row.verified_on, observed_at) > max_age_days) {
    strength = "unresolved";
  } else {
    strength = "recognized";
  }

  if (row.line_type === "mobile" || row.line_type === "landline") {
    line_type = row.line_type;
  } else if (row.line_type === "other") {
    virtual_range = true;
  }

  signals.push({
    name: "numbering_plan_range",
    scope: "range",
    market: parse.market,
    source: `numbering plan (${tables.regulator})`,
    observed_at,
    strength,
    coverage: "full",
    line_type:
      row.line_type === "mobile" || row.line_type === "landline"
        ? row.line_type
        : undefined,
    detail:
      `national significant number starts with ${row.prefix}: ` +
      `${row.official_name}` +
      (row.withdrawn_on
        ? `; this range was withdrawn by the regulator (${row.withdrawn_on}); the old designation is reported, never asserted`
        : ""),
    citation: row.citation,
    withdrawn_on: row.withdrawn_on,
  });

  return { signals, line_type, virtual_range, withdrawn, limitation };
}

function ageDays(from_iso_date: string, to_iso: string): number {
  const from = new Date(from_iso_date + "T00:00:00Z").getTime();
  const to = new Date(to_iso).getTime();
  return Math.max(0, (to - from) / 86_400_000);
}

// evidence gathering: the boundary between the pure core and the outside
// world. the core (stages/aggregation.ts) never touches the network or
// the clock; this module runs the injected parser and adapters and hands
// the results to the core. nothing here runs during tests, which call
// analyze() with fixture evidence directly.

import type { CarrierAdapter } from "./adapters.js";
import { parseInput } from "./input/parser.js";
import type { CarrierEvidence, ParseEvidence } from "./tables.js";

export interface GatherOptions {
  now: string;
  /** injected parser, overridable for tests and alternative libraries */
  parse?: (input: string, observed_at: string) => ParseEvidence;
}

export async function gatherEvidence(
  input: string,
  adapters: CarrierAdapter[],
  options: GatherOptions,
): Promise<{ parse: ParseEvidence; carriers: CarrierEvidence[] }> {
  const parse = (options.parse ?? parseInput)(input, options.now);
  const carriers: CarrierEvidence[] = [];
  if (!parse.valid || !parse.e164) {
    return { parse, carriers };
  }
  for (const adapter of adapters) {
    try {
      carriers.push(await adapter.lookup(parse.e164));
    } catch {
      // a failed lookup is coverage "none": an unevaluated check is never
      // a clean verdict, and the core will keep the finding unknown
      carriers.push({
        source: adapter.name,
        observed_at: options.now,
        coverage: "none",
        line_type: null,
        detail: "the lookup failed or the number is not covered",
      });
    }
  }
  return { parse, carriers };
}

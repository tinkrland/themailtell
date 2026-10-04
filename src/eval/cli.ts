// cli.ts — quick manual inspection. resolves live mx, analyzes, prints json.
// usage: node dist/src/eval/cli.js someone@example.com

import { gatherEvidence } from "../evidence.js";
import { analyze } from "../core.js";
import { makeDohResolver } from "../doh.js";

const address = process.argv[2];
if (!address) {
  console.error("usage: themailtell-cli <address>");
  process.exit(2);
}

const evidence = await gatherEvidence(address, { resolver: makeDohResolver() });
const result = analyze(evidence, { now: evidence.observed_at });
console.log(JSON.stringify(result, null, 2));

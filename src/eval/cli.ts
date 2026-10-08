// cli.ts — quick manual inspection. no network needed: local analysis is
// offline. usage: node dist/src/eval/cli.js '<json address>'
// example: node dist/src/eval/cli.js '{"market":"de","lines":["Postfach 12 34 56"],"city":"Bonn","postal_code":"53000"}'

import { analyze } from "../core.js";
import type { PostalAddress } from "../stages/input-handling.js";

const arg = process.argv[2];
if (!arg) {
  console.error(
    "usage: thelocaletell-cli '<json address>' (fields: market, lines, city, region, postal_code, company)"
  );
  process.exit(2);
}

let address: PostalAddress;
try {
  address = JSON.parse(arg) as PostalAddress;
} catch {
  console.error("the argument must be a json object");
  process.exit(2);
}

const result = analyze({ address, observed_at: new Date().toISOString().replace(/\.\d+Z$/, "Z") });
console.log(JSON.stringify(result, null, 2));

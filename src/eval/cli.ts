// cli.ts — quick manual inspection. resolves live mx plus secondary routing
// evidence (txt/spf, dkim selectors, mta-sts, autodiscover), analyzes,
// prints json. usage: node dist/src/eval/cli.js someone@example.com

import { gatherEvidence } from "../evidence.js";
import { analyze } from "../core.js";
import { makeDohResolver, makeDohTxtResolver, makeDohSrvResolver } from "../doh.js";

const address = process.argv[2];
if (!address) {
  console.error("usage: themailtell-cli <address>");
  process.exit(2);
}

const evidence = await gatherEvidence(address, {
  resolver: makeDohResolver(),
  txtResolver: makeDohTxtResolver(),
  srvResolver: makeDohSrvResolver(),
  mtaStsFetch: async (domain) => {
    try {
      const res = await fetch(`https://mta-sts.${domain}/.well-known/mta-sts.txt`);
      if (!res.ok) return undefined;
      return await res.text();
    } catch {
      return undefined;
    }
  },
  kinds: ["mx", "txt", "dkim", "mta_sts", "autodiscover"],
});
const result = analyze(evidence, { now: evidence.observed_at });
console.log(JSON.stringify(result, null, 2));

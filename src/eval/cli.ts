// cli: reads e.164 numbers (one per line, or "-" arguments) from stdin or
// argv, parses them offline and prints classifications as json lines. no
// network, no clock reads beyond the --now option. carrier adapters are
// deliberately not wired: running this is offline evidence only.

import { createInterface } from "node:readline/promises";
import { analyze } from "../index.js";
import { parseInput } from "../input/parser.js";
import { SCHEMA_VERSION } from "../schema.js";

async function main() {
  const args = process.argv.slice(2);
  const nowFlag = args.findIndex((a) => a === "--now");
  const now = nowFlag >= 0 ? args[nowFlag + 1] : new Date().toISOString();
  const numbers = args.filter((a, i) => a !== "--now" && i !== nowFlag + 1);

  const inputs: string[] = numbers.length > 0 ? numbers : await readStdin();
  for (const line of inputs) {
    const input = line.trim();
    if (!input) continue;
    const result = analyze(
      { parse: parseInput(input, now), carriers: [] },
      { now, max_age_days: 90 },
    );
    console.log(JSON.stringify(result));
  }
  process.stderr.write(`schema_version ${SCHEMA_VERSION}; offline evidence only: no carrier adapters are wired in this repository\n`);
}

async function readStdin(): Promise<string[]> {
  const rl = createInterface({ input: process.stdin });
  const lines: string[] = [];
  for await (const line of rl) lines.push(line);
  return lines;
}

main().catch((e) => { console.error(e); process.exit(1); });

import { analyze } from "../core.js";
import { FIXTURES, T0 } from "./corpus.js";
import type { Limitation } from "../schema.js";

// fixture passes prove consistency only; accuracy claims require an
// authorized corpus, which this component does not have yet
let pass = 0;
const failures: string[] = [];
for (const c of FIXTURES) {
  const r = analyze(c.artifact, c.signals, { now: c.now ?? T0 });
  const checks: [string, unknown, unknown][] = [
    ["spam", c.expectations.spam, r.spam],
    ["scam", c.expectations.scam, r.scam],
    ["automated", c.expectations.automated, r.automated],
    ["human", c.expectations.human, r.human],
    ["intent", c.expectations.intent, r.intent],
    ["operation", c.expectations.operation, r.operation],
    ["quadrant", c.expectations.quadrant, r.quadrant],
  ];
  const bad: string[] = [];
  for (const [key, want, got] of checks) {
    if (want !== undefined && got !== want) {
      bad.push(`${key} is ${got}, expected ${want}`);
    }
  }
  if (c.expectations.limitations !== undefined) {
    const codes = r.limitations.map((l: Limitation) => l.code);
    for (const want of c.expectations.limitations) {
      if (!codes.includes(want)) bad.push(`missing limitation ${want}`);
    }
  }
  if (bad.length === 0) {
    pass++;
    console.log(`ok   ${c.id}`);
  } else {
    failures.push(`${c.id}: ${bad.join("; ")}`);
    console.log(`fail ${c.id}: ${bad.join("; ")}`);
  }
}
console.log(`total: ${pass}/${FIXTURES.length} cases pass. the quadrant is mechanical; unknown refuses to place.`);
if (failures.length > 0) process.exit(1);

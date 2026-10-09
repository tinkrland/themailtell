import { analyze } from "../core.js";
import { FIXTURES, T0 } from "./corpus.js";
import type { Limitation } from "../schema.js";

// fixture passes prove consistency only; accuracy claims require an
// authorized corpus, which this component does not have yet
let pass = 0;
const failures: string[] = [];
for (const c of FIXTURES) {
  const r = analyze(c.artifact, c.signals, { now: c.now ?? T0 });
  const bad: string[] = [];
  if (c.expectations.spam !== undefined && r.spam !== c.expectations.spam) {
    bad.push(`spam is ${r.spam}, expected ${c.expectations.spam}`);
  }
  if (c.expectations.scam !== undefined && r.scam !== c.expectations.scam) {
    bad.push(`scam is ${r.scam}, expected ${c.expectations.scam}`);
  }
  if (c.expectations.quadrant !== undefined && r.quadrant !== c.expectations.quadrant) {
    bad.push(`quadrant is ${r.quadrant}, expected ${c.expectations.quadrant}`);
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
console.log(`total: ${pass}/${FIXTURES.length} cases pass. the axes never imply each other; unknown is first-class.`);
if (failures.length > 0) process.exit(1);

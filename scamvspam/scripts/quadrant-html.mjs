// renders the fixture corpus on the scamvspam quadrant map: the
// political-compass view. x = spam (unsolicited bulk), y = scam
// (deceptive intent). evidence_found places at 0.78, no_evidence_found
// at 0.22; unknown on either axis refuses to place. the map is a
// rendering of analyze(), never a second analysis
import { writeFileSync } from "node:fs";
import { analyze } from "../dist/src/core.js";
import { FIXTURES, T0 } from "../dist/src/eval/corpus.js";

const pos = (f) =>
  f === "evidence_found" ? 0.78 : f === "no_evidence_found" ? 0.22 : null;

let dots = "";
let unplaced = "";
let i = 0;
for (const c of FIXTURES) {
  const r = analyze(c.artifact, c.signals, { now: T0 });
  const x = pos(r.spam);
  const y = pos(r.scam);
  const j = (i % 3 - 1) * 0.05;
  if (x !== null && y !== null) {
    dots += `  <div class="dot" style="left:${(((x + j) * 100)).toFixed(1)}%;bottom:${(((y + j) * 100)).toFixed(1)}%" title="${c.id}: spam=${r.spam}, scam=${r.scam}, quadrant=${r.quadrant}"><span>${c.id}</span></div>\n`;
  } else {
    unplaced += `  <li><code>${c.id}</code> spam=${r.spam}, scam=${r.scam}: unplaced, because unknown is not a verdict</li>\n`;
  }
  i++;
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>scamvspam quadrant map</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem; color: #1c1917; }
  .map { position: relative; width: 640px; height: 640px; margin: 1rem 0; border: 1px solid #ddd; }
  .q { position: absolute; width: 50%; height: 50%; }
  .scam { background: rgba(220, 38, 38, 0.10); }
  .scam.spam { background: rgba(220, 38, 38, 0.20); }
  .spam-only { background: rgba(37, 99, 235, 0.10); }
  .neither-q { background: rgba(120, 113, 108, 0.08); }
  .dot { position: absolute; width: 14px; height: 14px; border-radius: 50%;
         background: #dc2626; transform: translate(-50%, 50%); }
  .dot span { position: absolute; left: 1rem; top: -0.4rem; white-space: nowrap;
              font-size: 11px; color: #57534e; }
  .axis { position: absolute; font-size: 12px; color: #57534e; }
  ul { max-width: 640px; } code { font-size: 11px; }
</style>
</head>
<body>
<h1>scam vs spam</h1>
<p>spam = unsolicited bulk (a volume and consent claim). scam = deceptive
intent (a fraud claim). the axes never imply each other.</p>
<div class="map">
  <div class="q scam" style="left:0;bottom:50%"></div>
  <div class="q scam spam" style="left:50%;bottom:50%"></div>
  <div class="q neither-q" style="left:0;bottom:0"></div>
  <div class="q spam-only" style="left:50%;bottom:0"></div>
${dots}</div>
<p class="axis">scam axis (deceptive intent) &rarr; up &middot; spam axis
(unsolicited bulk) &rarr; right &middot; the shaded corner is scam_and_spam</p>
<h2>unplaced</h2>
<p>these stay off the map because at least one axis is unknown: absence
of evidence is a statement about the search, never a verdict.</p>
<ul>
${unplaced}</ul>
</body>
</html>
`;
writeFileSync("quadrant.html", html);
console.log("wrote quadrant.html with", FIXTURES.length, "cases");

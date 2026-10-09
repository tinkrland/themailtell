// renders the fixture corpus on the scamvspam quadrant map: the
// political-compass view. x axis: spam (left) <-> scam (right).
// y axis: automated (bottom) <-> human (top). centers are honest
// placements: spam_and_scam, hybrid, and neither all sit mid-axis.
// the map is a rendering of analyze(), never a second analysis
import { writeFileSync } from "node:fs";
import { analyze } from "../dist/src/core.js";
import { FIXTURES, T0 } from "../dist/src/eval/corpus.js";

const X = { spam: 0.22, scam: 0.78, spam_and_scam: 0.5, neither: 0.5 };
const Y = { human: 0.78, automated: 0.22, hybrid: 0.5, neither: 0.5 };

let dots = "";
let unplaced = "";
let i = 0;
for (const c of FIXTURES) {
  const r = analyze(c.artifact, c.signals, { now: T0 });
  const x = r.intent === "unknown" ? null : X[r.intent];
  const y = r.operation === "unknown" ? null : Y[r.operation];
  const j = (i % 3 - 1) * 0.05;
  if (x !== null && y !== null) {
    dots += `  <div class="dot" style="left:${((x + j) * 100).toFixed(1)}%;bottom:${((y + j) * 100).toFixed(1)}%" title="${c.id}: intent=${r.intent}, operation=${r.operation}, quadrant=${r.quadrant}"><span>${c.id}</span></div>\n`;
  } else {
    unplaced += `  <li><code>${c.id}</code> intent=${r.intent}, operation=${r.operation}: unplaced, because unknown is not a verdict</li>\n`;
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
  .map { position: relative; width: 660px; height: 660px; margin: 1rem 0; border: 1px solid #ddd; }
  .q { position: absolute; width: 50%; height: 50%; font-size: 12px; color: #57534e; padding: 6px; }
  .scam.human { background: rgba(220, 38, 38, 0.18); }
  .scam.bot { background: rgba(220, 38, 38, 0.08); }
  .spam.human { background: rgba(37, 99, 235, 0.08); }
  .spam.bot { background: rgba(37, 99, 235, 0.18); }
  .dot { position: absolute; width: 14px; height: 14px; border-radius: 50%;
         background: #dc2626; transform: translate(-50%, 50%); }
  .dot span { position: absolute; left: 1rem; top: -0.4rem; white-space: nowrap;
              font-size: 11px; color: #57534e; }
  .axis { font-size: 12px; color: #57534e; }
  ul { max-width: 660px; } code { font-size: 11px; }
</style>
</head>
<body>
<h1>scam vs spam quadrant</h1>
<p>x axis: spam (unsolicited bulk) &harr; scam (deceptive intent).
y axis: automated (bots and adversarial ai) &harr; human-operated.</p>
<div class="map">
  <div class="q scam human" style="left:0;bottom:50%">human fraud: bec, spearphishing</div>
  <div class="q scam bot" style="left:50%;bottom:50%">bot fraud: ai phish blasts, voice-clone calls</div>
  <div class="q spam human" style="left:0;bottom:0">human hustle: hand-sent outreach</div>
  <div class="q spam bot" style="left:50%;bottom:0">bot spam: robocalls, bulk mail</div>
${dots}</div>
<p class="axis">centers are honest placements: a phishing blast is both
spam and scam (mid-x); a romance scam with canned openers and manual
replies is hybrid (mid-y); searched-and-empty sits near the center
with an explicit caveat. unknown refuses to place.</p>
<h2>unplaced</h2>
<ul>
${unplaced}</ul>
</body>
</html>
`;
writeFileSync("quadrant.html", html);
console.log("wrote quadrant.html with", FIXTURES.length, "cases");

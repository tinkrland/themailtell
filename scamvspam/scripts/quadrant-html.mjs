// renders entries on the scamvspam quadrant map: the political-compass
// view with multiple entries as differently-colored dots for visual
// comparison. x axis: spam (left) <-> scam (right). y axis: automated
// (bottom) <-> human (top). centers are honest placements.
//
// usage: node scripts/quadrant-html.mjs [input.json] [output.html]
// input shape: { title?, entries: [{ id, artifact, signals, now? }] }
// with no input the fixture corpus is rendered. the map is a rendering
// of analyze(), never a second analysis: color is identity, never
// evidence; placement is computed exactly the same for every entry
import { readFileSync, writeFileSync } from "node:fs";
import { analyze } from "../dist/src/core.js";
import { FIXTURES, T0 } from "../dist/src/eval/corpus.js";

// a restrained, distinguishable palette: one hue per entry, cycled
const PALETTE = [
  "#dc2626", "#2563eb", "#16a34a", "#7c3aed", "#ea580c",
  "#0891b2", "#db2777", "#65a30d", "#b45309", "#0e7490", "#9333ea",
];

const X = { spam: 0.22, scam: 0.78, spam_and_scam: 0.5, neither: 0.5 };
const Y = { human: 0.78, automated: 0.22, hybrid: 0.5, neither: 0.5 };

const input = process.argv[2]
  ? JSON.parse(readFileSync(process.argv[2], "utf8"))
  : {
      title: "scamvspam fixture corpus",
      entries: FIXTURES.map((c) => ({
        id: c.id,
        artifact: c.artifact,
        signals: c.signals,
        now: c.now,
      })),
    };
const out = process.argv[3] ?? "quadrant.html";

let dots = "";
let unplaced = "";
let legend = "";
input.entries.forEach((e, i) => {
  const r = analyze(e.artifact, e.signals, { now: e.now ?? T0 });
  const color = PALETTE[i % PALETTE.length];
  const x = r.intent === "unknown" ? null : X[r.intent];
  const y = r.operation === "unknown" ? null : Y[r.operation];
  const j = (i % 3 - 1) * 0.05;
  legend += `  <li><span class="sw" style="background:${color}"></span><code>${e.id}</code> ${r.quadrant}</li>\n`;
  if (x !== null && y !== null) {
    dots += `  <div class="dot" style="left:${((x + j) * 100).toFixed(1)}%;bottom:${((y + j) * 100).toFixed(1)}%;background:${color}" title="${e.id}: intent=${r.intent}, operation=${r.operation}, quadrant=${r.quadrant}"><span>${e.id}</span></div>\n`;
  } else {
    unplaced += `  <li><span class="sw" style="background:${color}"></span><code>${e.id}</code> intent=${r.intent}, operation=${r.operation}: unplaced, because unknown is not a verdict</li>\n`;
  }
});

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>scamvspam quadrant map</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem; color: #1c1917; }
  .wrap { display: flex; gap: 2rem; flex-wrap: wrap; }
  .map { position: relative; width: 640px; height: 640px; border: 1px solid #ddd; flex: none; }
  .q { position: absolute; width: 50%; height: 50%; font-size: 12px; color: #57534e; padding: 6px; }
  .scam.human { background: rgba(220, 38, 38, 0.10); }
  .scam.bot { background: rgba(220, 38, 38, 0.05); }
  .spam.human { background: rgba(37, 99, 235, 0.05); }
  .spam.bot { background: rgba(37, 99, 235, 0.10); }
  .dot { position: absolute; width: 14px; height: 14px; border-radius: 50%;
         transform: translate(-50%, 50%); border: 1px solid rgba(0,0,0,0.25); }
  .dot span { position: absolute; left: 1rem; top: -0.4rem; white-space: nowrap;
              font-size: 11px; color: #57534e; }
  .sw { display: inline-block; width: 10px; height: 10px; border-radius: 50%;
        margin-right: 6px; }
  .side { max-width: 340px; } ul { list-style: none; padding: 0; }
  li { margin: 4px 0; font-size: 13px; } code { font-size: 11px; }
  h2 { font-size: 15px; }
</style>
</head>
<body>
<h1>${input.title ?? "scamvspam"}</h1>
<p>x axis: spam (unsolicited bulk) &harr; scam (deceptive intent).
y axis: automated (bots and adversarial ai) &harr; human-operated.
color is entry identity, never evidence: every dot is placed by the
same analyze() rules.</p>
<div class="wrap">
<div class="map">
  <div class="q scam human" style="left:0;bottom:50%">human fraud</div>
  <div class="q scam bot" style="left:50%;bottom:50%">bot fraud</div>
  <div class="q spam human" style="left:0;bottom:0">human hustle</div>
  <div class="q spam bot" style="left:50%;bottom:0">bot spam</div>
${dots}</div>
<div class="side">
<h2>legend</h2>
<ul>
${legend}</ul>
<h2>unplaced</h2>
<ul>
${unplaced}</ul>
</div>
</div>
</body>
</html>
`;
writeFileSync(out, html);
console.log(`wrote ${out} with ${input.entries.length} entries`);

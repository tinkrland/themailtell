#!/usr/bin/env node
// authorized-corpus builder: reads data/corpus-input.json, confirms
// authorization for every number, and merges ground truth (written before
// running anything) with the component's offline evidence into
// data/authorized-corpus.json for the eval runner to consume.
//
// the corpus is authorized numbers only: yours or explicitly controlled
// (see docs/authorized-corpus.md). every case needs ground truth recorded
// before any tool output exists, and the builder refuses a case whose
// ground truth is missing or looks derived from tool output.
//
// no network is used: the numbering-plan tables are offline evidence.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..");

async function main() {
  const inputPath = join(repo, "data", "corpus-input.json");
  let raw;
  try {
    raw = JSON.parse(await readFile(inputPath, "utf8"));
  } catch {
    console.error(
      `no corpus input at ${inputPath}. copy data/corpus-input.example.json ` +
      `to data/corpus-input.json and fill in authorized numbers with their ` +
      `ground truth.`
    );
    process.exit(1);
  }

  const cases = [];
  let rejected = 0;
  let operatorPublished = 0;
  for (const c of raw.cases ?? []) {
    // two authorization classes, nothing else: numbers confirmed controlled
    // by the corpus owner, and operator-published example numbers per
    // docs/authorized-corpus.md. an operator-published case must carry the
    // operator's own page url in its ground truth notes: the url IS the
    // authorization, and the notes mark the case as operator-published.
    const controlled = c.authorization === "confirmed-controlled";
    const published = c.authorization === "operator-published";
    if (!c.number || !c.authorization || !(controlled || published)) {
      console.error(`rejected ${c.id ?? c.number}: authorization must be "confirmed-controlled" or "operator-published"`);
      rejected++;
      continue;
    }
    if (published) {
      if (!c.ground_truth?.notes || !/https?:\/\//.test(c.ground_truth.notes)) {
        console.error(`rejected ${c.id ?? c.number}: operator-published cases must name the operator's own page url in ground truth notes`);
        rejected++;
        continue;
      }
      operatorPublished++;
    }
    if (!c.ground_truth || typeof c.ground_truth.line_type !== "string") {
      console.error(`rejected ${c.id ?? c.number}: ground truth with a line_type must be recorded before running anything`);
      rejected++;
      continue;
    }
    if (c.ground_truth.notes && /evidence|signal|finding|state/.test(c.ground_truth.notes)) {
      console.error(`rejected ${c.id ?? c.number}: ground truth must not be phrased in tool vocabulary`);
      rejected++;
      continue;
    }
    cases.push({
      id: c.id,
      number: c.number,
      ground_truth: c.ground_truth,
      contrast_with: c.contrast_with ?? null,
      adapter_evidence: c.adapter_evidence ?? [],
    });
  }

  const out = {
    built_at: new Date().toISOString(),
    authorization: operatorPublished
      ? `${cases.length - operatorPublished} confirmed-controlled, ${operatorPublished} operator-published (operator's own pages, urls in ground truth)`
      : "all numbers are confirmed-controlled by the corpus owner",
    cases,
  };
  await writeFile(join(repo, "data", "authorized-corpus.json"), JSON.stringify(out, null, 2) + "\n");
  console.log(`authorized corpus written: ${cases.length} cases, ${rejected} rejected`);
  if (rejected > 0) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });

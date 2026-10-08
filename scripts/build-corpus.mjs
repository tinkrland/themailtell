// build-corpus.mjs — turns labeled authorized addresses into eval cases.
// fully offline: no network, no dns, no adapters. labels are written by
// the corpus author before running anything, and the script derives
// expectations from those labels mechanically; it never invents ground
// truth and it never edits an expectation to make a case pass.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const inputPath = join(here, "..", "data", "corpus-input.json");
const outputPath = join(here, "..", "data", "authorized-corpus.json");

let input;
try {
  input = JSON.parse(readFileSync(inputPath, "utf8"));
} catch (err) {
  if (err.code === "ENOENT") {
    console.error(
      "data/corpus-input.json not found. copy data/corpus-input.example.json " +
        "to data/corpus-input.json, add your authorized addresses with " +
        "ground-truth labels, and rerun."
    );
    process.exit(1);
  }
  throw err;
}

if (!Array.isArray(input)) {
  console.error("data/corpus-input.json must be a json array");
  process.exit(1);
}

const cases = input.map((row) => {
  const { id, market, shape, expect, ...address } = row;
  if (!id || !market || !shape) {
    console.error(`case is missing id, market or shape: ${JSON.stringify(row).slice(0, 80)}`);
    process.exit(1);
  }
  if (!Array.isArray(address.lines)) {
    console.error(`case ${id} is missing address lines`);
    process.exit(1);
  }
  const expectations = {};
  if (expect.po_box_equivalent)
    expectations.expect_shape_findings = {
      ...(expectations.expect_shape_findings ?? {}),
      po_box_equivalent: expect.po_box_equivalent,
    };
  if (expect.parcel_locker_or_pickup_point)
    expectations.expect_shape_findings = {
      ...(expectations.expect_shape_findings ?? {}),
      parcel_locker_or_pickup_point: expect.parcel_locker_or_pickup_point,
    };
  if (expect.cmra_or_virtual_mailbox)
    expectations.expect_shape_findings = {
      ...(expectations.expect_shape_findings ?? {}),
      cmra_or_virtual_mailbox: expect.cmra_or_virtual_mailbox,
    };
  if (expect.format_validity)
    expectations.expect_shape_findings = {
      ...(expectations.expect_shape_findings ?? {}),
      format_validity: expect.format_validity,
    };
  if (expect.state) expectations.expect_state = expect.state;
  if (expect.signal) expectations.expect_signals_any_strength = [expect.signal];
  if (expect.forbid_signal) expectations.forbid_signals = [expect.forbid_signal];
  if (expect.limitation) expectations.expect_limitation = expect.limitation;

  return {
    id,
    shape,
    scope: expect.scope ?? "address",
    evidence: {
      address,
      observed_at: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
    },
    expectations,
  };
});

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(cases, null, 2) + "\n");
console.log(
  `wrote ${cases.length} authorized case(s) to data/authorized-corpus.json. ` +
    "fixture passes prove consistency only; these are the cases that count."
);

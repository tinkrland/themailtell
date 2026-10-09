import { test } from "node:test";
import assert from "node:assert";
import { SCHEMA_VERSION } from "../src/schema.js";
import { analyze } from "../src/core.js";

const NOW = "2026-10-09T00:00:00.000Z";
const FRESH = "2026-09-01T00:00:00.000Z";

// a signal helper: pole ef/nf switches make mechanical placement tests
function sig(pole: any, ef: boolean) {
  return {
    name: `s-${pole}`, channel: "email" as const, pole, strength: "recognized" as const,
    coverage: "full" as const, observed_at: FRESH, detail: "",
    ...(ef ? {} : { nothing_found: true }),
  };
}

test("results carry the schema version and the artifact verbatim", () => {
  const r = analyze({ channel: "email", summary: "x" }, [], { now: NOW });
  assert.equal(r.schema_version, SCHEMA_VERSION);
  assert.equal(r.artifact.summary, "x");
});

test("every corner placement follows mechanically from the four poles", () => {
  const mk = (spam: boolean, scam: boolean, automated: boolean, human: boolean) =>
    analyze({ channel: "email", summary: "t" },
      [sig("spam", spam), sig("scam", scam), sig("automated", automated), sig("human", human)],
      { now: NOW });
  assert.equal(mk(false, true, false, true).quadrant, "scam_human");
  assert.equal(mk(false, true, true, false).quadrant, "scam_automated");
  assert.equal(mk(true, false, false, true).quadrant, "spam_human");
  assert.equal(mk(true, false, true, false).quadrant, "spam_automated");
});

test("blast and hybrid placements land in the middle, honestly", () => {
  const blast = analyze({ channel: "email", summary: "t" },
    [sig("spam", true), sig("scam", true), sig("automated", true), sig("human", false)],
    { now: NOW });
  assert.equal(blast.intent, "spam_and_scam");
  assert.equal(blast.quadrant, "mixed");
  assert.ok(blast.limitations.some((l) => l.code === "mixed_placement"));

  const hybrid = analyze({ channel: "email", summary: "t" },
    [sig("spam", false), sig("scam", true), sig("automated", true), sig("human", true)],
    { now: NOW });
  assert.equal(hybrid.operation, "hybrid");
  assert.equal(hybrid.quadrant, "mixed");
});

test("an unknown pole on either axis refuses to place", () => {
  const r = analyze({ channel: "email", summary: "t" },
    [sig("scam", true), sig("human", true)],
    { now: NOW });
  assert.equal(r.quadrant, "unplaced");
  assert.equal(r.intent, "unknown");
});

test("stale evidence decays to unknown, unplaced", () => {
  const r = analyze(
    { channel: "phone", summary: "old blast" },
    [
      { name: "bulk_sender", channel: "phone", pole: "spam", strength: "recognized", coverage: "full", observed_at: "2025-01-01T00:00:00Z", detail: "old" },
    ],
    { now: NOW },
  );
  assert.equal(r.spam, "unknown");
  assert.equal(r.quadrant, "unplaced");
  assert.ok(r.limitations.some((l) => l.code === "stale_intelligence"));
});

test("infrastructure signals never move a pole", () => {
  const r = analyze(
    { channel: "address", summary: "parcel locker" },
    [
      { name: "freight_forwarder_shape", channel: "address", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "locker" },
    ],
    { now: NOW },
  );
  assert.equal(r.intent, "unknown");
  assert.equal(r.quadrant, "unplaced");
  assert.ok(r.limitations.some((l) => l.code === "infrastructure_is_not_intent"));
});

test("coverage none makes no claim: the finding stays unknown", () => {
  const r = analyze(
    { channel: "phone", summary: "t" },
    [
      { name: "s", channel: "phone", pole: "scam", strength: "recognized", coverage: "none", observed_at: FRESH, detail: "adapter saw nothing" },
    ],
    { now: NOW },
  );
  assert.equal(r.scam, "unknown");
});

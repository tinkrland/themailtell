import { test } from "node:test";
import assert from "node:assert";
import { SCHEMA_VERSION } from "../src/schema.js";
import { analyze } from "../src/core.js";

const NOW = "2026-10-09T00:00:00.000Z";
const FRESH = "2026-09-01T00:00:00.000Z";

test("results carry the schema version and the artifact verbatim", () => {
  const r = analyze({ channel: "email", summary: "x" }, [], { now: NOW });
  assert.equal(r.schema_version, SCHEMA_VERSION);
  assert.equal(r.artifact.summary, "x");
});

test("a spearphish lands in scam_not_spam: the axes never imply each other", () => {
  const r = analyze(
    { channel: "email", summary: "lookalike domain" },
    [
      { name: "homoglyph_domain", channel: "email", axis: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "lookalike" },
      { name: "bulk_campaign_search", channel: "email", axis: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "searched", nothing_found: true },
    ],
    { now: NOW },
  );
  assert.equal(r.scam, "evidence_found");
  assert.equal(r.spam, "no_evidence_found");
  assert.equal(r.quadrant, "scam_not_spam");
});

test("stale evidence decays to unknown, unplaced", () => {
  const r = analyze(
    { channel: "phone", summary: "old blast" },
    [
      { name: "bulk_sender", channel: "phone", axis: "spam", strength: "recognized", coverage: "full", observed_at: "2025-01-01T00:00:00Z", detail: "old" },
    ],
    { now: NOW },
  );
  assert.equal(r.spam, "unknown");
  assert.equal(r.quadrant, "unplaced");
  assert.ok(r.limitations.some((l) => l.code === "stale_intelligence"));
});

test("infrastructure signals never move an axis", () => {
  const r = analyze(
    { channel: "address", summary: "parcel locker" },
    [
      { name: "freight_forwarder_shape", channel: "address", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "locker" },
    ],
    { now: NOW },
  );
  assert.equal(r.spam, "unknown");
  assert.equal(r.scam, "unknown");
  assert.ok(r.limitations.some((l) => l.code === "infrastructure_is_not_intent"));
});

test("every quadrant placement follows mechanically from the two axes", () => {
  const mk = (spam: any, scam: any) => analyze(
    { channel: "email", summary: "t" },
    [
      { name: "s", channel: "email", axis: "spam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "", ...(spam ? {} : { nothing_found: true }) },
      { name: "c", channel: "email", axis: "scam", strength: "recognized", coverage: "full", observed_at: FRESH, detail: "", ...(scam ? {} : { nothing_found: true }) },
    ],
    { now: NOW },
  );
  assert.equal(mk(true, true).quadrant, "scam_and_spam");
  assert.equal(mk(false, true).quadrant, "scam_not_spam");
  assert.equal(mk(true, false).quadrant, "spam_not_scam");
  assert.equal(mk(false, false).quadrant, "neither");
  const unplaced = analyze({ channel: "email", summary: "t" }, [], { now: NOW });
  assert.equal(unplaced.quadrant, "unplaced");
});

test("coverage none makes no claim: the finding stays unknown", () => {
  const r = analyze(
    { channel: "phone", summary: "t" },
    [
      { name: "s", channel: "phone", axis: "scam", strength: "recognized", coverage: "none", observed_at: FRESH, detail: "adapter saw nothing" },
    ],
    { now: NOW },
  );
  assert.equal(r.scam, "unknown");
});

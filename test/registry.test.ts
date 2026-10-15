// registry self-check: the table is the component, so the
// table is what gets tested. run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { SCHEMA_VERSION } from "../src/schema.js";
import { PROVIDER_REGISTRY } from "../src/registry.js";

test("schema version is pinned", () => {
  assert.equal(SCHEMA_VERSION, "0.3.0");
});

test("PROVIDER_REGISTRY: every row is well-formed and honest", () => {
  assert.ok(PROVIDER_REGISTRY.length > 0);
  const keys = PROVIDER_REGISTRY.map((r) => r.provider);
  assert.equal(new Set(keys).size, keys.length);
  for (const r of PROVIDER_REGISTRY) {
    assert.ok(typeof r.provider === "string" && r.provider.length > 0, r.provider + " missing " + "provider");
    assert.ok(typeof r.kind === "string" && r.kind.length > 0, r.provider + " missing " + "kind");
    assert.ok(typeof r.content_access === "string" && r.content_access.length > 0, r.provider + " missing " + "content_access");
    assert.ok(typeof r.transparency === "string" && r.transparency.length > 0, r.provider + " missing " + "transparency");
    assert.ok(typeof r.abuse_posture === "string" && r.abuse_posture.length > 0, r.provider + " missing " + "abuse_posture");
    assert.ok(typeof r.jurisdiction === "string" && r.jurisdiction.length > 0, r.provider + " missing " + "jurisdiction");
    assert.ok(typeof r.account_age_signal === "string" && r.account_age_signal.length > 0, r.provider + " missing " + "account_age_signal");
    assert.ok(typeof r.citation === "string" && r.citation.length > 0, r.provider + " missing " + "citation");
    assert.ok(r.verified_on === null || /^\d{4}-\d{2}-\d{2}$/.test(r.verified_on), r.provider);
    assert.ok(typeof r.recheck_cadence_days === "number" && r.recheck_cadence_days > 0, r.provider);
    assert.ok(typeof r.honest_notes === "string" && r.honest_notes.length > 0, r.provider + " missing " + "honest_notes");
  }
});

test("PROVIDER_REGISTRY: kind stays inside the ProviderKind union", () => {
  const allowed = new Set(["privacy_provider", "mainstream_provider", "disposable_provider", "relay_or_forwarder"]);
  for (const r of PROVIDER_REGISTRY) {
    assert.ok(allowed.has(r.kind), r.provider + " has " + r.kind);
  }
});

test("PROVIDER_REGISTRY: content_access stays inside the ContentAccess union", () => {
  const allowed = new Set(["zero_access_or_e2e_by_default", "e2e_available_optional", "provider_accessible_by_default", "public_inboxes_by_design", "unknown"]);
  for (const r of PROVIDER_REGISTRY) {
    assert.ok(allowed.has(r.content_access), r.provider + " has " + r.content_access);
  }
});

test("PROVIDER_REGISTRY: transparency stays inside the TransparencyPosture union", () => {
  const allowed = new Set(["publishes_transparency_report", "publishes_none", "unknown"]);
  for (const r of PROVIDER_REGISTRY) {
    assert.ok(allowed.has(r.transparency), r.provider + " has " + r.transparency);
  }
});

test("PROVIDER_REGISTRY: abuse_posture stays inside the AbusePosture union", () => {
  const allowed = new Set(["disposable_by_design", "mainstream_abuse_desk", "unknown"]);
  for (const r of PROVIDER_REGISTRY) {
    assert.ok(allowed.has(r.abuse_posture), r.provider + " has " + r.abuse_posture);
  }
});


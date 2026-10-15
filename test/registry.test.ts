// registry self-check: the table is the component, so the
// table is what gets tested. run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { SCHEMA_VERSION } from "../src/schema.js";
import { VOIP_REGISTRY } from "../src/registry.js";

test("schema version is pinned", () => {
  assert.equal(SCHEMA_VERSION, "0.5.0");
});

test("VOIP_REGISTRY: every row is well-formed and honest", () => {
  assert.ok(VOIP_REGISTRY.length > 0);
  const keys = VOIP_REGISTRY.map((r) => r.provider);
  assert.equal(new Set(keys).size, keys.length);
  for (const r of VOIP_REGISTRY) {
    assert.ok(typeof r.provider === "string" && r.provider.length > 0, r.provider + " missing " + "provider");
    assert.ok(typeof r.tier === "string" && r.tier.length > 0, r.provider + " missing " + "tier");
    assert.ok(typeof r.client_model === "string" && r.client_model.length > 0, r.provider + " missing " + "client_model");
    assert.ok(typeof r.kyc_posture === "string" && r.kyc_posture.length > 0, r.provider + " missing " + "kyc_posture");
    assert.ok(typeof r.kyc_scope === "string" && r.kyc_scope.length > 0, r.provider + " missing " + "kyc_scope");
    assert.ok(typeof r.market === "string" && r.market.length > 0, r.provider + " missing " + "market");
    assert.ok(typeof r.payment_privacy === "string" && r.payment_privacy.length > 0, r.provider + " missing " + "payment_privacy");
    assert.ok(typeof r.us_sms_capability === "string" && r.us_sms_capability.length > 0, r.provider + " missing " + "us_sms_capability");
    assert.ok(typeof r.citation === "string" && r.citation.length > 0, r.provider + " missing " + "citation");
    assert.ok(r.verified_on === null || /^\d{4}-\d{2}-\d{2}$/.test(r.verified_on), r.provider);
    assert.ok(typeof r.recheck_cadence_days === "number" && r.recheck_cadence_days > 0, r.provider);
    assert.ok(typeof r.honest_notes === "string" && r.honest_notes.length > 0, r.provider + " missing " + "honest_notes");
  }
});

test("VOIP_REGISTRY: tier stays inside the ProviderTier union", () => {
  const allowed = new Set(["upstream_carrier", "retail_front", "consumer_app", "public_sms_receiver"]);
  for (const r of VOIP_REGISTRY) {
    assert.ok(allowed.has(r.tier), r.provider + " has " + r.tier);
  }
});

test("VOIP_REGISTRY: client_model stays inside the ClientModel union", () => {
  const allowed = new Set(["turnkey_app", "turnkey_web", "sip_credentials", "api_trunk", "esim", "xmpp", "unknown"]);
  for (const r of VOIP_REGISTRY) {
    assert.ok(allowed.has(r.client_model), r.provider + " has " + r.client_model);
  }
});

test("VOIP_REGISTRY: kyc_posture stays inside the KycPosture union", () => {
  const allowed = new Set(["kyc_required", "identity_light", "no_kyc_observed", "unknown"]);
  for (const r of VOIP_REGISTRY) {
    assert.ok(allowed.has(r.kyc_posture), r.provider + " has " + r.kyc_posture);
  }
});

test("VOIP_REGISTRY: us_sms_capability stays inside the UsSmsCapability union", () => {
  const allowed = new Set(["sms_supported", "voice_only", "receive_only", "unknown"]);
  for (const r of VOIP_REGISTRY) {
    assert.ok(allowed.has(r.us_sms_capability), r.provider + " has " + r.us_sms_capability);
  }
});


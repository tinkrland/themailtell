// registry self-check: the table is the component, so the
// table is what gets tested. run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { SCHEMA_VERSION } from "../src/schema.js";
import { INSTRUMENT_REGISTRY } from "../src/registry.js";

test("schema version is pinned", () => {
  assert.equal(SCHEMA_VERSION, "0.6.0");
});

test("INSTRUMENT_REGISTRY: every row is well-formed and honest", () => {
  assert.ok(INSTRUMENT_REGISTRY.length > 0);
  const keys = INSTRUMENT_REGISTRY.map((r) => r.instrument);
  assert.equal(new Set(keys).size, keys.length);
  for (const r of INSTRUMENT_REGISTRY) {
    assert.ok(typeof r.instrument === "string" && r.instrument.length > 0, r.instrument + " missing " + "instrument");
    assert.ok(typeof r.provider === "string" && r.provider.length > 0, r.instrument + " missing " + "provider");
    assert.ok(typeof r.kind === "string" && r.kind.length > 0, r.instrument + " missing " + "kind");
    assert.ok(typeof r.card_network === "string" && r.card_network.length > 0, r.instrument + " missing " + "card_network");
    assert.ok(typeof r.number_rotation === "string" && r.number_rotation.length > 0, r.instrument + " missing " + "number_rotation");
    assert.ok(typeof r.kyc_posture === "string" && r.kyc_posture.length > 0, r.instrument + " missing " + "kyc_posture");
    assert.ok(typeof r.kyc_scope === "string" && r.kyc_scope.length > 0, r.instrument + " missing " + "kyc_scope");
    assert.ok(typeof r.jurisdiction === "string" && r.jurisdiction.length > 0, r.instrument + " missing " + "jurisdiction");
    assert.ok(typeof r.issuance_scope === "string" && r.issuance_scope.length > 0, r.instrument + " missing " + "issuance_scope");
    assert.ok(typeof r.funding_anonymity === "string" && r.funding_anonymity.length > 0, r.instrument + " missing " + "funding_anonymity");
    assert.ok(typeof r.caps === "string" && r.caps.length > 0, r.instrument + " missing " + "caps");
    assert.ok(typeof r.citation === "string" && r.citation.length > 0, r.instrument + " missing " + "citation");
    assert.ok(r.verified_on === null || /^\d{4}-\d{2}-\d{2}$/.test(r.verified_on), r.instrument);
    assert.ok(typeof r.recheck_cadence_days === "number" && r.recheck_cadence_days > 0, r.instrument);
    assert.ok(typeof r.honest_notes === "string" && r.honest_notes.length > 0, r.instrument + " missing " + "honest_notes");
  }
});

test("INSTRUMENT_REGISTRY: kind stays inside the InstrumentKind union", () => {
  const allowed = new Set(["retail_gift_card", "open_loop_prepaid_card", "bank_linked_virtual_card", "regulated_prepaid_wallet", "web3_direct_payment", "crypto_funded_prepaid_card", "prepaid_card_platform", "topup_voucher", "unknown"]);
  for (const r of INSTRUMENT_REGISTRY) {
    assert.ok(allowed.has(r.kind), r.instrument + " has " + r.kind);
  }
});

test("INSTRUMENT_REGISTRY: card_network stays inside the CardNetwork union", () => {
  const allowed = new Set(["visa", "mastercard", "none", "unknown"]);
  for (const r of INSTRUMENT_REGISTRY) {
    assert.ok(allowed.has(r.card_network), r.instrument + " has " + r.card_network);
  }
});

test("INSTRUMENT_REGISTRY: number_rotation stays inside the NumberRotation union", () => {
  const allowed = new Set(["on_demand", "static", "none", "unknown"]);
  for (const r of INSTRUMENT_REGISTRY) {
    assert.ok(allowed.has(r.number_rotation), r.instrument + " has " + r.number_rotation);
  }
});

test("INSTRUMENT_REGISTRY: kyc_posture stays inside the KycPosture union", () => {
  const allowed = new Set(["full_kyc", "limited_kyc_ladder", "registration_only", "no_kyc_by_design", "no_kyc_observed", "unknown"]);
  for (const r of INSTRUMENT_REGISTRY) {
    assert.ok(allowed.has(r.kyc_posture), r.instrument + " has " + r.kyc_posture);
  }
});

test("INSTRUMENT_REGISTRY: issuance_scope stays inside the IssuanceScope union", () => {
  const allowed = new Set(["us_resident_only", "uk_resident_only", "india_resident_only", "global", "unknown"]);
  for (const r of INSTRUMENT_REGISTRY) {
    assert.ok(allowed.has(r.issuance_scope), r.instrument + " has " + r.issuance_scope);
  }
});


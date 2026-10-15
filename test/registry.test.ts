// registry self-check: the table is the component, so the
// table is what gets tested. run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { SCHEMA_VERSION } from "../src/schema.js";
import { TLD_REGISTRY } from "../src/registry.js";
import { REGISTRAR_REGISTRY } from "../src/registrars.js";

test("schema version is pinned", () => {
  assert.equal(SCHEMA_VERSION, "0.6.0");
});

test("TLD_REGISTRY: every row is well-formed and honest", () => {
  assert.ok(TLD_REGISTRY.length > 0);
  const keys = TLD_REGISTRY.map((r) => r.tld);
  assert.equal(new Set(keys).size, keys.length);
  for (const r of TLD_REGISTRY) {
    assert.ok(typeof r.tld === "string" && r.tld.length > 0, r.tld + " missing " + "tld");
    assert.ok(typeof r.registration_barrier === "string" && r.registration_barrier.length > 0, r.tld + " missing " + "registration_barrier");
    assert.ok(typeof r.barrier_citation === "string" && r.barrier_citation.length > 0, r.tld + " missing " + "barrier_citation");
    assert.ok(r.barrier_verified_on === null || /^\d{4}-\d{2}-\d{2}$/.test(r.barrier_verified_on), r.tld);
    assert.ok(typeof r.abuse_band === "string" && r.abuse_band.length > 0, r.tld + " missing " + "abuse_band");
    assert.ok(typeof r.abuse_citation === "string" && r.abuse_citation.length > 0, r.tld + " missing " + "abuse_citation");
    assert.ok(r.abuse_verified_on === null || /^\d{4}-\d{2}-\d{2}$/.test(r.abuse_verified_on), r.tld);
    // an empty observation list is an honest "none recorded yet": the
    // family's discipline is that absence is never evidence, so the
    // check is typed presence, not nonempty
    assert.ok(Array.isArray(r.price_observations), r.tld + " missing " + "price_observations");
    assert.ok(typeof r.recheck_cadence_days === "number" && r.recheck_cadence_days > 0, r.tld);
    assert.ok(typeof r.honest_notes === "string" && r.honest_notes.length > 0, r.tld + " missing " + "honest_notes");
  }
});

test("REGISTRAR_REGISTRY: every row is well-formed and honest", () => {
  assert.ok(REGISTRAR_REGISTRY.length > 0);
  const keys = REGISTRAR_REGISTRY.map((r) => r.registrar);
  assert.equal(new Set(keys).size, keys.length);
  for (const r of REGISTRAR_REGISTRY) {
    assert.ok(typeof r.registrar === "string" && r.registrar.length > 0, r.registrar + " missing " + "registrar");
    assert.ok(typeof r.kind === "string" && r.kind.length > 0, r.registrar + " missing " + "kind");
    assert.ok(typeof r.sale_pattern === "string" && r.sale_pattern.length > 0, r.registrar + " missing " + "sale_pattern");
    assert.ok(typeof r.payment_privacy === "string" && r.payment_privacy.length > 0, r.registrar + " missing " + "payment_privacy");
    assert.ok(typeof r.ownership_note === "string" && r.ownership_note.length > 0, r.registrar + " missing " + "ownership_note");
    assert.ok(typeof r.citation === "string" && r.citation.length > 0, r.registrar + " missing " + "citation");
    assert.ok(r.verified_on === null || /^\d{4}-\d{2}-\d{2}$/.test(r.verified_on), r.registrar);
    assert.ok(typeof r.recheck_cadence_days === "number" && r.recheck_cadence_days > 0, r.registrar);
    assert.ok(typeof r.honest_notes === "string" && r.honest_notes.length > 0, r.registrar + " missing " + "honest_notes");
  }
});

test("TLD_REGISTRY: registration_barrier stays inside the RegistrationBarrier union", () => {
  const allowed = new Set(["open", "nexus_required", "claim_required", "presence_verified", "residency_required", "unknown"]);
  for (const r of TLD_REGISTRY) {
    assert.ok(allowed.has(r.registration_barrier), r.tld + " has " + r.registration_barrier);
  }
});

test("TLD_REGISTRY: abuse_band stays inside the AbuseBand union", () => {
  const allowed = new Set(["high", "elevated", "moderate", "low", "unknown"]);
  for (const r of TLD_REGISTRY) {
    assert.ok(allowed.has(r.abuse_band), r.tld + " has " + r.abuse_band);
  }
});

test("REGISTRAR_REGISTRY: kind stays inside the RegistrarKind union", () => {
  const allowed = new Set(["consumer_boutique", "at_cost", "privacy_buffer", "registry_storefront", "web3_naming", "unknown"]);
  for (const r of REGISTRAR_REGISTRY) {
    assert.ok(allowed.has(r.kind), r.registrar + " has " + r.kind);
  }
});

test("REGISTRAR_REGISTRY: sale_pattern stays inside the SalePattern union", () => {
  const allowed = new Set(["first_year_sales", "monthly_coupons", "none", "unknown"]);
  for (const r of REGISTRAR_REGISTRY) {
    assert.ok(allowed.has(r.sale_pattern), r.registrar + " has " + r.sale_pattern);
  }
});


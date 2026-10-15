// fixture corpus: onboarding attempts with expectations. the
// discipline of the family applies: never edit an expectation to
// make a case pass; fix the underlying table or code.
import test from "node:test";
import assert from "node:assert/strict";
import { readOnboarding } from "./engine.js";

test("the author's own stack: instruments read, nobody accused", () => {
  const reading = readOnboarding({
    observed_at: "2026-10-15T08:00:00Z",
    observations: [
      { field: "email", value: "owner@protonmail.com" },
      { field: "phone", value: "+15550100", instrument_hint: "Fanytel" },
      { field: "payment", value: "4111111111111111", instrument_hint: "Privacy.com" },
    ],
  });
  const email = reading.fields.find((f) => f.field === "email")!;
  const phone = reading.fields.find((f) => f.field === "phone")!;
  const payment = reading.fields.find((f) => f.field === "payment")!;
  // proton binds as a privacy provider, tethered at registration.
  // registration-tethered email is still cheap to re-mint, so the
  // surface honestly reads substitutable, and the author's lawful
  // residence in a substitutable bucket is exactly the non-verdict
  assert.equal(email.instrument?.radar, "theproviderradar");
  assert.equal(email.tether, "registration_only");
  assert.ok(reading.substitutable_fields.includes("email"));
  // fanytel is no-kyc voip: the surface is re-mintable by its holder,
  // and the reading says so without accusing the holder
  assert.equal(phone.tether, "none");
  assert.equal(phone.rotation, "on_demand");
  assert.ok(reading.substitutable_fields.includes("phone"));
  // privacy.com: full kyc tether, on-demand rotation: substitutable
  // by its holder, a capability fact, not a suspicion
  assert.equal(payment.tether, "full_kyc");
  assert.equal(payment.rotation, "on_demand");
  assert.ok(reading.substitutable_fields.includes("payment"));
  assert.match(reading.non_verdict, /never a verdict/);
});

test("the disposable stack: three fields, three low-tether instruments", () => {
  const reading = readOnboarding({
    observed_at: "2026-10-15T08:00:00Z",
    observations: [
      { field: "email", value: "throwaway@mailinator.com" },
      { field: "phone", value: "+15550100", instrument_hint: "Quackr" },
      { field: "payment", value: "4147201234567890", instrument_hint: "Ezzocard" },
    ],
  });
  const email = reading.fields.find((f) => f.field === "email")!;
  assert.equal(email.instrument?.kind, "disposable_provider");
  assert.equal(email.tether, "none");
  const phone = reading.fields.find((f) => f.field === "phone")!;
  assert.equal(phone.instrument?.kind, "public_sms_receiver");
  const payment = reading.fields.find((f) => f.field === "payment")!;
  assert.equal(payment.instrument?.kind, "crypto_funded_prepaid_card");
  assert.equal(payment.tether, "none");
  assert.deepEqual(reading.substitutable_fields, ["email", "phone", "payment"]);
  // counters are suggested for exactly the classes observed
  assert.ok(reading.counters.some((c) => c.field === "email" && /blocklist/.test(c.counter)));
  assert.ok(reading.counters.some((c) => c.field === "payment" && /bin/.test(c.counter)));
});

test("unknown propagation: unmatched fields stay unknown, never disconfirmed", () => {
  const reading = readOnboarding({
    observed_at: "2026-10-15T08:00:00Z",
    observations: [
      { field: "email", value: "user@never-heard-of-it.example" },
      { field: "phone", value: "+15550100" },
      { field: "payment", value: "1234" },
    ],
  });
  for (const f of reading.fields) {
    assert.equal(f.instrument, null, f.field + " must not bind");
    assert.equal(f.tether, "unknown");
  }
  assert.equal(reading.substitutable_fields.length, 0);
  assert.ok(reading.unknowns.some((u) => /not evidence of anything/.test(u)));
  assert.ok(reading.unknowns.some((u) => /not evidence of a landline/.test(u)));
  assert.ok(reading.unknowns.some((u) => /not evidence of a bank card/.test(u)));
});

test("staleness: evidence decays linearly past the cadence window to zero", () => {
  // privacy.com carries a 180-day cadence: at age 351 the confidence
  // is 1 - (351 - 180) / 180 = 0.05, and it reaches zero at 360 days
  const mid = readOnboarding({
    observed_at: "2027-10-01T00:00:00Z",
    observations: [{ field: "payment", value: "4111111111111111", instrument_hint: "Privacy.com" }],
  }).fields[0];
  assert.equal(mid.evidence.verified_on, "2026-10-15");
  assert.equal(mid.evidence.confidence, 0.05);
  const spent = readOnboarding({
    observed_at: "2027-11-01T00:00:00Z",
    observations: [{ field: "payment", value: "4111111111111111", instrument_hint: "Privacy.com" }],
  }).fields[0];
  assert.equal(spent.evidence.confidence, 0);
  assert.ok((spent.evidence.age_days ?? 0) > 360);
});

test("ambiguous bins list candidates instead of guessing", () => {
  // visa with no hint: several visa instruments in the registry
  const reading = readOnboarding({
    observed_at: "2026-10-15T08:00:00Z",
    observations: [{ field: "payment", value: "4111111111111111" }],
  });
  const payment = reading.fields[0];
  assert.equal(payment.instrument, null);
  assert.ok(payment.candidates.length > 1);
  assert.ok(payment.unknowns.some((u) => /ambiguous/.test(u)));
});

test("domain field binds tld barrier and registrar", () => {
  const reading = readOnboarding({
    observed_at: "2026-10-15T08:00:00Z",
    observations: [{ field: "domain", value: "shop.xyz", instrument_hint: "Njalla" }],
  });
  const domain = reading.fields[0];
  assert.ok(domain.instrument);
  assert.equal(domain.instrument.radar, "thetldradar");
  assert.ok(domain.instrument.kind.startsWith("barrier:"));
  // registrar-only binding: tld absent from the registry, but the
  // registrar evidence still reads
  const regOnly = readOnboarding({
    observed_at: "2026-10-15T08:00:00Z",
    observations: [{ field: "domain", value: "weird.example", instrument_hint: "Njalla" }],
  }).fields[0];
  assert.ok(regOnly.instrument);
  assert.equal(regOnly.instrument.name, "registrar: Njalla");
});

test("snapshots carry provenance into the reading", () => {
  const reading = readOnboarding({
    observed_at: "2026-10-15T08:00:00Z",
    observations: [{ field: "payment", value: "4111111111111111", instrument_hint: "Privacy.com" }],
  });
  const payment = reading.fields[0];
  assert.match(payment.instrument?.row_snapshot_commit ?? "", /^[0-9a-f]{40}$/);
});

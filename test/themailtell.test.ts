// unit tests. run with: npm test (compiles to dist first, no watcher).

import test from "node:test";
import assert from "node:assert/strict";
import { analyze } from "../src/core.js";
import { handleInput } from "../src/stages/input-handling.js";
import { gatherEvidence } from "../src/evidence.js";

const T0 = "2026-10-04T00:00:00Z";

const ev = (
  address: string,
  mx?: Array<[string, number]>,
  dnsError?: string
) => ({
  address,
  mx_records: mx?.map(([exchange, priority]) => ({ exchange, priority })),
  dns_error: dnsError,
  observed_at: T0,
});

test("input handling preserves the local part and never rewrites it", () => {
  const h = handleInput("First.Last+Tag@Example.COM");
  assert.equal(h.valid, true);
  assert.equal(h.local_part, "First.Last+Tag"); // verbatim
  assert.equal(h.domain, "example.com"); // lowercased for dns only
  assert.equal(h.syntax_facts.has_plus, true);
  assert.equal(h.syntax_facts.has_dot_in_local_part, true);
  assert.equal(h.syntax_facts.has_uppercase_in_local_part, true);
});

test("input handling rejects broken syntax without a verdict", () => {
  for (const bad of ["", "nodomain", "user@", "@example.com", "a@b", "a b@example.com"]) {
    const r = analyze(ev(bad));
    assert.equal(r.input_valid, false);
    assert.equal(r.state, "unknown");
    assert.equal(r.signals.length, 0);
  }
});

test("porkbun forwarding mx is recognized at the domain level", () => {
  const r = analyze(ev("hello@shop.example", [["fwd1.porkbun.com", 10], ["fwd2.porkbun.com", 20]]));
  assert.equal(r.state, "signals_present");
  assert.ok(r.signals.some((s) => s.name === "forwarding_infrastructure" && s.strength === "recognized"));
  assert.ok(r.limitations.some((l) => l.includes("will not be discovered")));
});

test("improvmx and forward email hosts are recognized as forwarding", () => {
  for (const host of ["mx1.improvmx.com", "mx1.forwardemail.net", "mx2.improvmx.com"]) {
    const r = analyze(ev("contact@idea.example", [[host, 10]]));
    assert.ok(r.signals.some((s) => s.name === "forwarding_infrastructure"), host);
  }
});

test("relay domains are detected without a routing verdict", () => {
  for (const addr of ["x@mozmail.com", "y@duck.com", "z@sub.mozmail.com"]) {
    const r = analyze(ev(addr));
    assert.ok(r.signals.some((s) => s.name === "masking_relay_service" && s.scope === "domain"), addr);
  }
});

test("disposable domains are detected", () => {
  const r = analyze(ev("x@mailinator.com"));
  assert.ok(r.signals.some((s) => s.name === "disposable_service"));
});

test("gateway is never classified as forwarding-only", () => {
  const r = analyze(ev("p@corp.example", [["mx1.pphosted.com", 10]]));
  assert.ok(r.signals.some((s) => s.name === "gateway_infrastructure"));
  assert.ok(!r.signals.some((s) => s.name === "forwarding_infrastructure"));
  assert.ok(r.limitations.some((l) => l.includes("not classified as forwarding-only")));
});

test("mailbox-capable mx proves capability, not this address's inbox", () => {
  const r = analyze(ev("someone@gmail.com", [["aspmx.l.google.com", 5]]));
  assert.ok(r.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
  assert.ok(r.limitations.some((l) => l.includes("not this address's storage arrangement")));
});

test("plus syntax and provider semantics are two separate facts", () => {
  const r = analyze(ev("a+b@gmail.com", [["aspmx.l.google.com", 5]]));
  const alias = r.signals.filter((s) => s.name === "alias_syntax");
  assert.ok(alias.some((s) => s.scope === "address" && s.strength === "suggestive"));
  assert.ok(alias.some((s) => s.scope === "provider_infrastructure" && s.strength === "recognized"));
});

test("plus at an unknown provider reports syntax only, no semantics claim", () => {
  const r = analyze(ev("a+b@ownmail.example", [["mail.ownmail.example", 10]]));
  const alias = r.signals.filter((s) => s.name === "alias_syntax");
  assert.equal(alias.length, 1);
  assert.equal(alias[0].scope, "address");
  assert.ok(r.limitations.some((l) => l.includes("provider alias semantics unknown")));
});

test("shared registrar infrastructure reports the indistinguishable limit", () => {
  const r = analyze(ev("p@biz.example", [["mailstore1.secureserver.net", 10]]));
  assert.ok(r.limitations.some((l) => l.includes("cannot be distinguished from routing evidence")));
});

test("contradictory recognized evidence yields the contradictory state", () => {
  const r = analyze(ev("x@mailinator.com", [["aspmx.l.google.com", 5]]));
  assert.equal(r.state, "contradictory");
});

test("mixed routing yields mixed_routing, not a guess", () => {
  const r = analyze(ev("ops@mix.example", [["fwd1.porkbun.com", 10], ["aspmx.l.google.com", 20]]));
  assert.equal(r.state, "mixed_routing");
});

test("dns failure yields unknown, never an assumption", () => {
  const r = analyze(ev("user@slow.example", undefined, "timeout"));
  assert.equal(r.state, "unknown");
  assert.equal(r.signals.length, 0);
  assert.ok(r.limitations.some((l) => l.includes("unknown rather than assumed")));
});

test("unknown infrastructure yields unknown with no category claim", () => {
  const r = analyze(ev("r@self.example", [["mail.self.example", 10]]));
  assert.equal(r.state, "unknown");
  assert.ok(r.limitations.some((l) => l.includes("no infrastructure category is claimed")));
});

test("stale intelligence is downgraded to unresolved, not trusted silently", () => {
  const r = analyze(ev("x@mailinator.com"), { now: "2027-10-04T00:00:00Z", maxAgeDays: 90 });
  const d = r.signals.find((s) => s.name === "disposable_service");
  assert.equal(d?.strength, "unresolved");
  assert.equal(r.state, "unknown");
  assert.ok(r.limitations.some((l) => l.includes("stale intelligence")));
});

test("the core is a pure function: same evidence, same result", () => {
  const e = ev("hello@shop.example", [["fwd1.porkbun.com", 10]]);
  const a = analyze(e);
  const b = analyze(e);
  assert.deepEqual(a, b);
  const bad = analyze(ev("x@mailinator.com", [["aspmx.l.google.com", 1]]));
  assert.deepEqual(bad, analyze(ev("x@mailinator.com", [["aspmx.l.google.com", 1]])));
});

test("result never echoes the local part", () => {
  const e = ev("Secret.Local@shop.example", [["fwd1.porkbun.com", 10]]);
  const r = analyze(e);
  assert.equal(JSON.stringify(r).includes("Secret"), false);
  assert.equal(r.domain, "shop.example");
});

test("gatherEvidence resolves mx through the injected resolver and reports errors", async () => {
  const ok = await gatherEvidence("user@example.com", {
    resolver: async () => [{ exchange: "aspmx.l.google.com", priority: 1 }],
    observedAt: T0,
  });
  assert.deepEqual(ok.mx_records, [{ exchange: "aspmx.l.google.com", priority: 1 }]);

  const fail = await gatherEvidence("user@example.com", {
    resolver: async () => {
      throw new Error("timeout");
    },
    observedAt: T0,
  });
  assert.equal(fail.dns_error, "mx lookup failed (timeout)");
  assert.equal(fail.mx_records, undefined);
});

test("longest match wins: consumer outlook is mailbox, tenant eop stays gateway", () => {
  const consumer = analyze(ev("user@hotmail.com", [["hotmail-com.olc.protection.outlook.com", 2]]));
  assert.ok(consumer.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
  assert.ok(!consumer.signals.some((s) => s.name === "gateway_infrastructure"));

  const tenant = analyze(ev("user@contoso.example", [["contoso.mail.protection.outlook.com", 0]]));
  assert.ok(tenant.signals.some((s) => s.name === "gateway_infrastructure"));
  assert.ok(!tenant.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
});

test("yahoo and aol infra is recognized via the verified yahoodns host", () => {
  const r = analyze(ev("user@yahoo.example", [["mta5.am0.yahoodns.net", 1]]));
  assert.ok(r.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
  const aol = analyze(ev("user@aol.example", [["mx-aol.mail.gm0.yahoodns.net", 10]]));
  assert.ok(aol.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
});

test("community list carries its own provenance, distinct from the seed", () => {
  // pick a domain that is only in the community snapshot, not the seed
  const r = analyze(ev("x@0-mail.com"));
  const d = r.signals.find((s) => s.name === "disposable_service");
  assert.ok(d);
  assert.match(d!.source, /^community-list\//);
});

test("simplelogin and addy.io relay domains are detected", () => {
  for (const addr of ["x@slmail.me", "y@user.anonaddy.com", "z@8shield.net"]) {
    const r = analyze(ev(addr));
    assert.ok(r.signals.some((s) => s.name === "masking_relay_service"), addr);
  }
});

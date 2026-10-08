// unit tests. run with: npm test (compiles to dist first, no watcher).

import test from "node:test";
import assert from "node:assert/strict";
import { analyze } from "../src/core.js";
import { PROVIDER_TABLE_AS_OF } from "../src/providers.js";
import { handleInput } from "../src/stages/input-handling.js";
import { gatherEvidence } from "../src/evidence.js";

const T0 = "2026-10-08T00:00:00Z";

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

test("shared registrar infrastructure makes no arrangement claim in either direction", () => {
  const r = analyze(ev("p@biz.example", [["mailstore1.secureserver.net", 10]]));
  assert.ok(r.signals.some((s) => s.name === "shared_mail_infrastructure"));
  assert.ok(!r.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
  assert.ok(!r.signals.some((s) => s.name === "forwarding_infrastructure"));
  assert.ok(r.limitations.some((l) => l.includes("no per-address arrangement is claimed")));
});

test("google workspace single-host mx smtp.google.com is recognized, not unknown", () => {
  const r = analyze(ev("user@example-shop.com", [["smtp.google.com", 1]]));
  assert.ok(r.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
  assert.ok(!r.signals.some((s) => s.name === "gateway_infrastructure"));
});

test("spacemail (spaceship hosted mail) is recognized as mailbox-capable", () => {
  const r = analyze(ev("user@example-spaceship.dev", [["mx1.spacemail.com", 0]]));
  assert.ok(r.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
});

test("unicode domains are converted to punycode, never rejected as invalid", () => {
  const r = analyze(ev("user@münchen.example"));
  assert.equal(r.input_valid, true);
  assert.equal(r.domain, "xn--mnchen-3ya.example");
  assert.ok(r.limitations.some((l) => l.includes("punycode")));
  // a domain that cannot be converted is rejected honestly
  const bad = analyze(ev("user@x..y"));
  assert.equal(bad.input_valid, false);
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
  const r = analyze(ev("x@mailinator.com"), { now: "2027-10-06T00:00:00Z", maxAgeDays: 90 });
  const d = r.signals.find((s) => s.name === "disposable_service");
  assert.equal(d?.strength, "unresolved");
  assert.equal(r.state, "unknown");
  assert.ok(r.limitations.some((l) => l.includes("stale intelligence")));
});

test("builtin table signals carry the table's as-of date, not the lookup time", () => {
  const r = analyze(ev("user@gmail.example", [["gmail-smtp-in.l.google.com", 5]]));
  const m = r.signals.find((s) => s.name === "mailbox_capable_infrastructure");
  assert.ok(m);
  // the evidence was gathered at t0; the knowledge ages from its own date
  assert.equal(m!.observed_at, PROVIDER_TABLE_AS_OF);
  const d = r.signals.find((s) => s.name === "disposable_service");
  if (d) {
    assert.ok(d.observed_at.startsWith("2026-10-"));
    assert.notEqual(d.observed_at, T0);
  }
});

test("an unmaintained table goes stale by itself: every builtin claim downgrades", () => {
  // one year past the table's as-of date, with no adapter or list refresh
  const r = analyze(ev("user@gmail.example", [["gmail-smtp-in.l.google.com", 5]]), {
    now: "2027-10-06T00:00:00Z",
    maxAgeDays: 90,
  });
  for (const s of r.signals) {
    assert.equal(s.strength, "unresolved", `${s.name} should be downgraded`);
  }
  assert.equal(r.state, "unknown");
  assert.ok(r.limitations.some((l) => l.includes("stale intelligence")));
});

test("adapter findings age from their own observation time", () => {
  const oldSignal = {
    name: "alias_syntax",
    scope: "address",
    source: "adapter/external-harmony",
    observed_at: "2026-01-01T00:00:00Z",
    strength: "recognized",
    detail: "external adapter says this address is a forwarding alias",
  } as const;
  const r = analyze(
    {
      address: "user@example.org",
      mx_records: [],
      adapter_signals: [oldSignal],
      observed_at: T0,
    },
    { now: T0, maxAgeDays: 90 }
  );
  const a = r.signals.find((s) => s.source === "adapter/external-harmony");
  assert.equal(a?.strength, "unresolved");
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

test("secondary evidence: spf include is its own signal, never mx forwarding", () => {
  const r = analyze({
    address: "hello@example-forwarded.dev",
    mx_records: [{ exchange: "mx.unknown.example", priority: 10 }],
    secondary_evidence: { txt_records: ["v=spf1 include:spf.improvmx.com ~all"] },
    observed_at: T0,
  });
  assert.ok(r.signals.some((s) => s.name === "spf_forwarding_include"));
  assert.ok(!r.signals.some((s) => s.name === "forwarding_infrastructure"));
  assert.ok(r.limitations.some((l) => l.includes("send-path configuration")));
  // table knowledge, stamped with the table date
  const spf = r.signals.find((s) => s.name === "spf_forwarding_include")!;
  assert.equal(spf.observed_at, PROVIDER_TABLE_AS_OF);
});

test("secondary evidence: dkim selector at a known forwarding convention", () => {
  const r = analyze({
    address: "x@example-idea.dev",
    mx_records: [{ exchange: "mx.example-idea.dev", priority: 10 }],
    secondary_evidence: {
      domainkey_records: [{ selector: "dkimprovmx2", value: "v=DKIM1; k=rsa; p=..." }],
    },
    observed_at: T0,
  });
  assert.ok(r.signals.some((s) => s.name === "dkim_forwarder_selector"));
  assert.ok(!r.signals.some((s) => s.name === "forwarding_infrastructure"));
});

test("secondary evidence: mta-sts and autodiscover are suggestive presence-only", () => {
  const r = analyze({
    address: "ops@example-selfhost.io",
    mx_records: [{ exchange: "mail.example-selfhost.io", priority: 10 }],
    secondary_evidence: {
      mta_sts_policy: "version: STSv1; mode: enforce",
      autodiscover_srv: true,
    },
    observed_at: T0,
  });
  const mta = r.signals.find((s) => s.name === "mta_sts_policy_present")!;
  assert.equal(mta.strength, "suggestive");
  const ad = r.signals.find((s) => s.name === "autodiscover_present")!;
  assert.equal(ad.strength, "suggestive");
  assert.ok(!r.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
});

test("apple relay domains are detected; icloud.com never is", () => {
  for (const addr of ["x@privaterelay.appleid.com", "y@private.icloud.com"]) {
    const r = analyze(ev(addr));
    assert.ok(r.signals.some((s) => s.name === "masking_relay_service"), addr);
  }
  const icloud = analyze(ev("user@icloud.com", [["mx01.mail.icloud.com", 10]]));
  assert.ok(!icloud.signals.some((s) => s.name === "masking_relay_service"));
  assert.ok(icloud.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
});

test("relay domain on mailbox-capable infrastructure is signals_present, not contradictory", () => {
  // apple's relay domain runs on icloud mail infrastructure; that pair is
  // legitimate, not a conflict between lists and routing
  const r = analyze(ev("ab12cd@private.icloud.com", [["mx01.mail.icloud.com", 10]]));
  assert.equal(r.state, "signals_present");
  assert.ok(r.signals.some((s) => s.name === "masking_relay_service"));
  assert.ok(r.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
});

test("disposable listed domain on mailbox infra stays contradictory", () => {
  const r = analyze(ev("x@mailinator.com", [["aspmx.l.google.com", 1]]));
  assert.equal(r.state, "contradictory");
});

test("new provider batch: migadu, ionos legacy, web.de, atmail platform", () => {
  const migadu = analyze(ev("x@example.org", [["aspmx2.migadu.com", 20]]));
  assert.ok(migadu.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
  const ionos = analyze(ev("x@example.de", [["mx00.kundenserver.de", 10]]));
  assert.ok(ionos.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
  const webde = analyze(ev("x@web.de", [["mx-ha03.web.de", 100]]));
  assert.ok(webde.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
  const optus = analyze(ev("x@optusnet.com.au", [["mx-10.au-east.atmailcloud.com", 10]]));
  assert.ok(optus.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
});

test("ovh and gandi are shared infrastructure, no arrangement claim", () => {
  for (const mx of ["mx1.ovh.net", "mail12.gandi.net"]) {
    const r = analyze(ev("x@example.fr", [[mx, 10]]));
    assert.ok(r.signals.some((s) => s.name === "shared_mail_infrastructure"), mx);
    assert.ok(!r.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
    assert.ok(!r.signals.some((s) => s.name === "forwarding_infrastructure"));
  }
});

test("yousee consumer mail fronts with proofpoint and reports gateway, not mailbox", () => {
  const r = analyze(ev("x@yousee.dk", [["mxa-00360101.gslb.pphosted.com", 10]]));
  assert.ok(r.signals.some((s) => s.name === "gateway_infrastructure"));
  assert.ok(!r.signals.some((s) => s.name === "mailbox_capable_infrastructure"));
});

test("gmail dot semantics are declared, never applied", () => {
  const r = analyze(ev("j.o.h.n@gmail.com", [["gmail-smtp-in.l.google.com", 5]]));
  const sem = r.signals.find((s) => s.name === "local_part_semantics")!;
  assert.equal(sem.strength, "recognized");
  assert.ok(sem.detail.includes("dots"));
  // the local part is preserved verbatim
  assert.ok(r.limitations.some((l) => l.includes("never rewritten")));
});

test("outlook alias-product semantics are reported for plain local parts", () => {
  const r = analyze(ev("plain@outlook.com", [["outlook-com.olc.protection.outlook.com", 0]]));
  const sem = r.signals.find((s) => s.name === "local_part_semantics")!;
  assert.ok(sem.detail.includes("alias addresses"));
});

test("dkim probe ignores wildcard txt answers that are not dkim records", () => {
  // seen live: *.migadu.com serves "migadu" to any name; yousee.dk's
  // wildcard serves a google-site-verification value
  const r = analyze({
    address: "x@migadu.com",
    mx_records: [{ exchange: "mx.migadu.com", priority: 10 }],
    secondary_evidence: {
      domainkey_records: [
        { selector: "dkimprovmx1", value: "migadu" },
        { selector: "dkimprovmx2", value: "google-site-verification=LHGED..." },
      ],
    },
    observed_at: T0,
  });
  assert.ok(!r.signals.some((s) => s.name === "dkim_forwarder_selector"));
});

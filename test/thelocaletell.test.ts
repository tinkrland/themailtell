// unit tests. run with: npm test (compiles to dist first, no watcher).

import test from "node:test";
import assert from "node:assert/strict";
import { analyze } from "../src/core.js";
import { handleInput } from "../src/stages/input-handling.js";
import { gatherEvidence } from "../src/evidence.js";

const T0 = "2026-10-08T00:00:00Z";

const ev = (market: string, lines: string[], extra: Record<string, string> = {}) => ({
  address: { market, lines, ...extra },
  observed_at: T0,
});

test("input handling preserves the lines verbatim and never rewrites them", () => {
  const h = handleInput({
    market: "US",
    lines: ["12 Rue de l'Exemple", "Bâtiment B"],
    city: "Paris",
  });
  assert.equal(h.valid, true);
  assert.equal(h.market, "us"); // normalized copy; the address is untouched
  assert.equal(h.address.lines[1], "Bâtiment B");
  // the match copies fold diacritics; the stored lines do not
  assert.ok(!h.match_lines[1].includes("â"));
});

test("broken input is rejected honestly without a verdict", () => {
  for (const bad of [
    { market: "usa", lines: ["1 Main St"] },
    { market: "us", lines: [] },
    { market: "us", lines: [""] },
  ]) {
    const r = analyze({ address: bad as never, observed_at: T0 });
    assert.equal(r.input_valid, false);
    assert.equal(r.state, "unknown");
    assert.equal(r.signals.length, 0);
  }
});

test("a po box is detected with no evidence claim about the rest of the address", () => {
  const r = analyze(ev("us", ["PO Box 12345"], { city: "Anytown", region: "NY", postal_code: "10001" }));
  assert.ok(r.signals.some((s) => s.name === "po_box_equivalent"));
  assert.equal(r.shape_findings.po_box_equivalent, "evidence_found");
  assert.ok(r.shape_findings.parcel_locker_or_pickup_point === "no_evidence_found");
});

test("po box variants across spellings match", () => {
  for (const line of ["P.O. Box 12", "p.o. box 12", "Post Office Box 12", "PO box 12"]) {
    const r = analyze(ev("us", [line], { city: "x", region: "NY", postal_code: "10001" }));
    assert.ok(r.signals.some((s) => s.name === "po_box_equivalent"), line);
  }
});

test("diacritics match folded and accented spellings without rewriting the line", () => {
  for (const line of ["Boîte postale 12", "Boite postale 12", "BOÎTE POSTALE 12"]) {
    const r = analyze(ev("fr", [line], { city: "Paris", postal_code: "75001" }));
    assert.ok(r.signals.some((s) => s.name === "po_box_equivalent"), line);
  }
});

test("a genuine street address is no evidence found, never street address verified", () => {
  const r = analyze(ev("us", ["1600 Example Parkway"], { city: "Anytown", region: "NY", postal_code: "10001" }));
  assert.equal(r.shape_findings.po_box_equivalent, "no_evidence_found");
  assert.equal(r.shape_findings.parcel_locker_or_pickup_point, "no_evidence_found");
  assert.equal(r.shape_findings.cmra_or_virtual_mailbox, "no_evidence_found");
  assert.ok(r.limitations.some((l) => l.includes("not a verification of a street address")));
  // every local check had coverage none; the result says so
  assert.ok(r.limitations.some((l) => l.includes("no carrier validation adapter ran")));
});

test("packstation is detected as a carrier pickup point, not a po box", () => {
  const r = analyze(ev("de", ["Packstation 123"], { company: "987654321", city: "Berlin", postal_code: "10115" }));
  assert.ok(r.signals.some((s) => s.name === "parcel_locker_or_pickup_point"));
  assert.equal(r.shape_findings.parcel_locker_or_pickup_point, "evidence_found");
  assert.equal(r.shape_findings.po_box_equivalent, "no_evidence_found");
  assert.ok(r.limitations.some((l) => l.includes("postnummer")));
});

test("flexdelivery is one linked finding reported under both names, not a mix", () => {
  const r = analyze(ev("ca", ["FlexDelivery 123456"], { city: "Toronto", region: "ON", postal_code: "M5V 2T6" }));
  assert.ok(r.signals.some((s) => s.name === "parcel_locker_or_pickup_point"));
  assert.ok(r.signals.some((s) => s.name === "po_box_equivalent"));
  assert.equal(r.state, "signals_present");
  assert.equal(r.shape_findings.po_box_equivalent, "evidence_found");
});

test("the ups store is a cmra match", () => {
  const r = analyze(ev("us", ["The UPS Store #123"], { city: "x", region: "NY", postal_code: "10001" }));
  assert.ok(r.signals.some((s) => s.name === "cmra_or_virtual_mailbox"));
});

test("a virtual mailbox suite address stays no evidence found with the gap documented", () => {
  const r = analyze(ev("us", ["123 Main St", "Suite 100"], { city: "x", region: "NY", postal_code: "10001" }));
  assert.equal(r.shape_findings.cmra_or_virtual_mailbox, "no_evidence_found");
  assert.ok(r.limitations.some((l) => l.includes("no local token exists")));
  assert.ok(r.limitations.some((l) => l.includes("not a verification of a street address")));
});

test("market without tables is unknown, never clean", () => {
  const r = analyze(ev("jp", ["1-2-3 Shibuya"], { city: "Tokyo", postal_code: "150-0002" }));
  assert.equal(r.shape_findings.po_box_equivalent, "unknown");
  assert.equal(r.shape_findings.format_validity, "unknown");
  assert.ok(r.limitations.some((l) => l.includes("no local tables")));
});

test("missing postal code is a format issue where the market requires it", () => {
  const r = analyze(ev("us", ["123 Main St"], { city: "Anytown", region: "NY" }));
  assert.ok(r.signals.some((s) => s.name === "format_issue"));
  assert.equal(r.shape_findings.format_validity, "issues_found");
});

test("nz absence of postcode is noted, not a format issue, per its format row", () => {
  const r = analyze(ev("nz", ["12 Example Street"], { city: "Wellington" }));
  assert.ok(!r.signals.some((s) => s.name === "format_issue" && s.detail.includes("postal code is missing")));
  assert.ok(r.limitations.some((l) => l.includes("does not list a postal code as required")));
});

test("contradiction: po box evidence vs carrier-confirmed street delivery point", () => {
  const r = analyze({
    address: { market: "us", lines: ["PO Box 12345"], city: "Anytown", region: "NY", postal_code: "10001" },
    adapter_signals: [
      {
        name: "street_delivery_point_confirmed",
        scope: "address",
        source: "adapter:example-dpv/1.0",
        observed_at: T0,
        strength: "recognized",
        coverage: "full",
        detail: "dpv confirmed a street delivery point",
      },
    ],
    observed_at: T0,
  });
  assert.equal(r.state, "contradictory");
  assert.ok(r.limitations.some((l) => l.includes("neither wins")));
});

test("mixed evidence needs two shape classes from different sources", () => {
  const r = analyze(ev("us", ["The UPS Store", "PO Box 123"], { city: "x", region: "NY", postal_code: "10001" }));
  assert.equal(r.state, "mixed_evidence");
});

test("stale tables downgrade to unresolved and the finding becomes unknown", () => {
  const r = analyze(ev("us", ["PO Box 12345"], { city: "x", region: "NY", postal_code: "10001" }), {
    now: "2027-10-08T00:00:00Z",
    maxAgeDays: 90,
  });
  for (const s of r.signals) {
    if (s.name !== "format_issue") assert.equal(s.strength, "unresolved", s.name);
  }
  assert.equal(r.shape_findings.po_box_equivalent, "unknown");
  assert.ok(r.limitations.some((l) => l.includes("stale intelligence")));
});

test("every local signal carries coverage none; an adapter finding carries its own", () => {
  const r = analyze(ev("de", ["Postfach 12 34 56"], { city: "Bonn", postal_code: "53000" }));
  for (const s of r.signals) {
    assert.equal(s.coverage, "none", s.name);
  }
});

test("unverified seed rows can only be suggestive and say so", () => {
  const r = analyze(ev("se", ["Box 1234"], { city: "Stockholm", postal_code: "111 22" }));
  const sig = r.signals.find((s) => s.name === "po_box_equivalent");
  assert.ok(sig);
  // seed rows start unverified; after verification research lands, this
  // test asserts the strength the row actually has
  assert.ok(sig.strength === "suggestive" || sig.strength === "recognized");
  if (sig.strength === "suggestive") {
    assert.ok(r.limitations.some((l) => l.includes("unverified seed")));
  }
});

test("the core is a pure function: same evidence, same result", () => {
  const e = ev("de", ["Packstation 123"], { company: "987654321", city: "Berlin", postal_code: "10115" });
  assert.deepEqual(analyze(e), analyze(e));
});

test("the result never echoes the address lines", () => {
  const e = ev("us", ["42 Secretlane Grove"], { city: "Anytown", region: "NY", postal_code: "10001" });
  const r = analyze(e);
  assert.equal(JSON.stringify(r).includes("Secretlane"), false);
});

test("gatherEvidence runs address_only adapters and reports outages as gaps", async () => {
  const address = { market: "us", lines: ["PO Box 12345"], city: "x", region: "NY", postal_code: "10001" };
  const ok = await gatherEvidence(address, {
    adapters: [
      {
        name: "example-dpv",
        version: "1.0",
        data_exposure: "address_only",
        capabilities: ["delivery_point_validation"],
        lookupAddress: async () => [
          {
            signal_name: "street_delivery_point_confirmed",
            scope: "address",
            strength: "recognized",
            coverage: "full",
            detail: "dpv says this is a po box, not a street delivery point... but adapters report, not decide",
            observed_at: T0,
          },
        ],
      },
    ],
    observedAt: T0,
  });
  assert.equal(ok.adapter_signals?.length, 1);

  const failing = await gatherEvidence(address, {
    adapters: [
      {
        name: "flaky-validator",
        version: "0.1",
        data_exposure: "address_only",
        capabilities: ["delivery_point_validation"],
        lookupAddress: async () => {
          throw new Error("timeout");
        },
      },
    ],
    observedAt: T0,
  });
  assert.ok(failing.adapter_errors?.[0].includes("flaky-validator"));
  const r = analyze(failing);
  assert.ok(r.limitations.some((l) => l.includes("coverage")));
});

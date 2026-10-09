import { test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// replays the recorded live veriphone responses through the adapter's
// mapping. the recordings are evidence, not synthetic fixtures: they
// pin the lowercase type vocabulary, the "unknown" carrier absence,
// and the fact that veriphone never checks in-service status
test("veriphone adapter maps recorded live responses honestly", async () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const mod: any = await import(
    join(here, "..", "..", "scripts", "veriphone-gather.mjs")
  );
  const rec = (name: string): any =>
    JSON.parse(readFileSync(join(here, "..", "..", "data", "recorded", name), "utf8"));
  const t = "2026-10-09T00:00:00.000Z";

  const google = mod.veriphoneToCarrier(rec("veriphone-16502530000.json").response, t);
  assert.equal(google.carrier?.line_type, "landline");
  assert.equal(google.carrier?.carrier_name, "Verizon");
  assert.equal(google.carrier?.active, null);

  const library = mod.veriphoneToCarrier(rec("veriphone-442079304832.json").response, t);
  assert.equal(library.carrier?.line_type, "landline");
  assert.equal(library.carrier?.carrier_name, null);

  const tollFree = mod.veriphoneToCarrier(rec("veriphone-18004633339.json").response, t);
  assert.equal(tollFree.carrier?.line_type, null);
  assert.ok(tollFree.carrier.detail.includes("toll_free"));

  const fictional = mod.veriphoneToCarrier(rec("veriphone-15551234567.json").response, t);
  assert.equal(fictional.carrier?.line_type, null);
  assert.ok(fictional.carrier.detail.includes("format-level"));

  const unknownCarrier = mod.veriphoneToCarrier(rec("veriphone-14155551010.json").response, t);
  assert.equal(unknownCarrier.carrier?.line_type, null);
  assert.equal(unknownCarrier.carrier?.carrier_name, null);
});

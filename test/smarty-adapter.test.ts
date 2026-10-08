import { test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// replays the recorded live smarty responses through the adapter's
// mapping. the recordings are evidence, not synthetic fixtures: they
// pin the y/s/d/no-candidate semantics the fixture corpus relies on
test("smarty adapter maps recorded live responses honestly", async () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const mod: any = await import(
    /* smarty adapter, plain module so the gather script can run under
       plain node without a build step */
    join(here, "..", "..", "scripts", "smarty-gather.mjs")
  );
  const rec = (name: string): any =>
    JSON.parse(readFileSync(join(here, "..", "..", "data", "recorded", name), "utf8"));
  const t = "2026-10-08T15:52:50.501Z";

  const aptF = mod.smartyToSignal(rec("smarty-1-w-72nd-st-apt-f.json").response, t);
  assert.equal(aptF.signal?.existence, "disconfirmed");
  assert.ok(aptF.signal.detail.includes("dpv_match_code S"));

  const apt7 = mod.smartyToSignal(rec("smarty-1-w-72nd-st-apt-7.json").response, t);
  assert.equal(apt7.signal?.existence, "confirmed_exists");

  const noUnit = mod.smartyToSignal(rec("smarty-1-w-72nd-st.json").response, t);
  assert.equal(noUnit.signal?.existence, undefined);
  assert.ok(noUnit.signal.detail.includes("unknown"));

  const bogus = mod.smartyToSignal(rec("smarty-9999-w-80th-st.json").response, t);
  assert.equal(bogus.signal?.existence, "disconfirmed");
  assert.ok(bogus.signal.detail.includes("no candidates"));
});

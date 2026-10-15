#!/usr/bin/env node
// regenerates snapshots/*.json from the four radar branches. the
// engine never invents evidence: it reads these dated, provenance-
// carrying snapshots, and this script is the only way they change.
import { execSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const TSC = join(import.meta.dirname, "..", "..", "themailtell", "node_modules", ".bin", "tsc");
const ROOT = join(import.meta.dirname, "..");

const HEAD = 'export { SCHEMA_VERSION } from "./schema.js";\n';
const TAIL = "\nexport const EXTRA = undefined;\n";
const RADARS = [
  { name: "theproviderradar", import: 'import { PROVIDER_REGISTRY } from "./registry.js";\nexport const PAYLOAD = PROVIDER_REGISTRY;' },
  { name: "thevoipradar", import: 'import { VOIP_REGISTRY } from "./registry.js";\nexport const PAYLOAD = VOIP_REGISTRY;' },
  { name: "thetldradar", import: 'import { TLD_REGISTRY } from "./registry.js";\nimport { REGISTRAR_REGISTRY } from "./registrars.js";\nexport const PAYLOAD = TLD_REGISTRY;\nexport const EXTRA = REGISTRAR_REGISTRY;' },
  { name: "theccradar", import: 'import { INSTRUMENT_REGISTRY } from "./registry.js";\nexport const PAYLOAD = INSTRUMENT_REGISTRY;' },
];

const EXPORT_TS = 'import { SCHEMA_VERSION, PAYLOAD, EXTRA } from "./export-registry.js";\nconsole.log(JSON.stringify({ schema_version: SCHEMA_VERSION, rows: PAYLOAD, extra: EXTRA }));\n';

for (const r of RADARS) {
  const tmp = join(ROOT, "tmp", r.name);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(join(tmp, "src"), { recursive: true });
  execSync(`git archive ${r.name} src | tar -x -C ${tmp}`, { cwd: ROOT });
  // make sure SCHEMA_VERSION is exported from schema.ts
  const schemaPath = join(tmp, "src", "schema.ts");
  let s = readFileSync(schemaPath, "utf8");
  if (!/^export const SCHEMA_VERSION/m.test(s)) {
    const m = s.match(/const SCHEMA_VERSION[^;]+;/m);
    if (m) s += "\n" + m[0].replace("const", "export const") + "\n";
    else s += '\nexport const SCHEMA_VERSION = "unknown";\n';
    writeFileSync(schemaPath, s);
  }
  const wrapper = (r.name === "thetldradar" ? HEAD : HEAD) + r.import + (r.name === "thetldradar" ? "" : TAIL);
  writeFileSync(join(tmp, "src", "export-registry.ts"), wrapper);
  writeFileSync(join(tmp, "src", "export.ts"), EXPORT_TS);
  execSync(`${TSC} --module nodenext --moduleResolution nodenext --target es2022 --skipLibCheck --esModuleInterop --outDir ${join(tmp, "out")} ${join(tmp, "src", "export.ts")}`, { cwd: tmp });
  const exportJs = existsSync(join(tmp, "out", "src", "export.js"))
    ? join(tmp, "out", "src", "export.js")
    : join(tmp, "out", "export.js");
  const out = execSync(`node ${exportJs}`, { cwd: tmp, encoding: "utf8" });
  const parsed = JSON.parse(out);
  const commit = execSync(`git rev-parse ${r.name}`, { cwd: ROOT, encoding: "utf8" }).trim();
  const snapshot = {
    radar: r.name,
    schema_version: parsed.schema_version,
    commit,
    exported_at: new Date().toISOString().slice(0, 10),
    rows: parsed.rows,
  };
  if (parsed.extra) snapshot.registrars = parsed.extra;
  writeFileSync(join(ROOT, "snapshots", r.name + ".json"), JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`${r.name}: ${parsed.rows.length} rows, schema ${parsed.schema_version}, commit ${commit.slice(0, 7)}`);
}

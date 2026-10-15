#!/usr/bin/env node
// the network adapter for domain age. usage:
//   node scripts/rdap-lookup.mjs example.xyz [--record path.json]
// rdap.org is the bootstrap: it redirects to the registry's own rdap
// service. failures are coverage unknowns, never guesses, and the
// adapter prints exactly what the pure parser produced.
import { writeFileSync } from "node:fs";
import { parseRdapRegistration } from "../dist/rdap.js";

const domain = process.argv[2];
const recordAt = process.argv.includes("--record")
  ? process.argv[process.argv.indexOf("--record") + 1]
  : null;
if (!domain) {
  console.error("usage: node scripts/rdap-lookup.mjs <domain> [--record path]");
  process.exit(2);
}
const fetchedAt = new Date().toISOString();
let raw;
let status = 0;
try {
  // rdap.org serves 403 to headerless clients (verified live
// 2026-10-15: fetch without a user-agent gets 403, with one gets
// 200), so the adapter identifies itself instead of pretending
const res = await fetch(`https://rdap.org/domain/${domain}`, {
  headers: { "User-Agent": "thecomposer-rdap-adapter/0.2.0 (+research, fixture-recorded)" },
});
  status = res.status;
  const text = await res.text();
  try {
    raw = JSON.parse(text);
  } catch {
    raw = null;
  }
  if (recordAt) writeFileSync(recordAt, JSON.stringify(raw, null, 2) + "\n");
} catch (err) {
  // network failure is a coverage unknown, never evidence
  console.log(JSON.stringify({
    source: "rdap",
    created_on: null,
    fetched_at: fetchedAt,
    coverage: "unknown",
    coverage_note: "network error during rdap lookup: " + String(err),
  }, null, 2));
  process.exit(0);
}
const finding = parseRdapRegistration(raw, fetchedAt);
const out =
  status !== 200 && finding.coverage === "unknown"
    ? { ...finding, coverage_note: `rdap http ${status}: ` + (finding.coverage_note ?? "") }
    : finding;
console.log(JSON.stringify(out, null, 2));

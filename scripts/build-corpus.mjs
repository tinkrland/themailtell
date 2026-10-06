// build-corpus.mjs — turns labeled, authorized addresses into
// data/authorized-corpus.json for the eval runner.
//
// usage:  node scripts/build-corpus.mjs [input.json] [output.json]
// default input:  data/corpus-input.json   (gitignored: real addresses)
// default output: data/authorized-corpus.json (gitignored)
//
// the important property: expectations come from the arrangement YOU declare
// (ground truth you know), never from what themailtell outputs. if you ran
// the tool and copied its answer in, the corpus could only agree with itself.
//
// input format: an array of
//   { id, address, arrangement, ground_truth_source, notes? }
// where arrangement is one of the keys in ARRANGEMENTS below and
// ground_truth_source says how you know (e.g. "i own it; registrar dashboard").
//
// this script uses the network (dns). the core and the runner never do.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { resolveMx } from "node:dns/promises";

// mx lookup with a dns-over-https fallback, so the builder also works on
// networks where udp/53 is blocked (same trade the evidence gatherer makes).
async function lookupMx(domain) {
  try {
    const recs = await resolveMx(domain);
    return recs.map((r) => ({ exchange: r.exchange.toLowerCase(), priority: r.priority }));
  } catch {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      { headers: { accept: "application/dns-json" } }
    );
    const d = await res.json();
    if (!d.Answer || d.Answer.length === 0) {
      if (d.Status === 3) throw new Error("queryA ENODATA / NXDOMAIN");
      throw new Error("no mx answer");
    }
    return d.Answer.filter((a) => a.type === 15).map((a) => {
      const data = a.data.trim().replace(/\.$/, "");
      const space = data.indexOf(" ");
      return {
        priority: Number(data.slice(0, space)),
        exchange: data.slice(space + 1).toLowerCase(),
      };
    });
  }
}

// ground-truth arrangement -> what must / must not be claimed.
// edit these deliberately; loosening one to make a case pass defeats the point.
const ARRANGEMENTS = {
  "registrar-forwarding": {
    label: "custom domain using registrar-provided forwarding, no own mailbox",
    scope: "provider_infrastructure",
    expectations: {
      expect_signals: ["forwarding_infrastructure"],
      forbid_signals: ["mailbox_capable_infrastructure"],
    },
  },
  "registrar-hosted-mailbox": {
    label: "custom domain registered at same registrar, hosted mailboxes",
    scope: "provider_infrastructure",
    // the contrast case. if this registrar's hosted mail shares MX hosts with
    // its forwarding, this is where the table gets exposed.
    expectations: {
      expect_signals: ["mailbox_capable_infrastructure"],
      forbid_signals: ["forwarding_infrastructure"],
    },
  },
  "forwarding-service": {
    label: "custom domain pointed at a known forwarding-only service",
    scope: "provider_infrastructure",
    expectations: {
      expect_signals: ["forwarding_infrastructure"],
      forbid_signals: ["mailbox_capable_infrastructure"],
    },
  },
  "dedicated-mailbox": {
    label: "dedicated mailbox at a mailbox provider",
    scope: "provider_infrastructure",
    expectations: {
      expect_signals: ["mailbox_capable_infrastructure"],
      forbid_signals: ["forwarding_infrastructure"],
    },
  },
  "plus-tag-at-mailbox-provider": {
    label: "plus-tag alias at a mailbox provider",
    scope: "provider_infrastructure",
    expectations: {
      expect_signals: ["mailbox_capable_infrastructure"],
      expect_signals_any_strength: ["alias_syntax"],
      forbid_signals: ["forwarding_infrastructure"],
    },
  },
  "masked-relay-domain": {
    label: "known masked relay address on the service's own domain",
    scope: "domain",
    expectations: {
      expect_signals: ["masking_relay_service"],
    },
  },
  "disposable-domain": {
    label: "known temporary/disposable service",
    scope: "domain",
    expectations: {
      expect_signals: ["disposable_service"],
    },
  },
  "security-gateway": {
    label: "security gateway in front of the final host",
    scope: "provider_infrastructure",
    expectations: {
      expect_signals: ["gateway_infrastructure"],
      forbid_signals: ["forwarding_infrastructure"],
    },
  },
  "self-hosted-or-unknown": {
    label: "self-hosted or unrecognized infrastructure",
    scope: "provider_infrastructure",
    // honest answer is unknown: no category claim in either direction.
    expectations: {
      expect_state: "unknown",
      forbid_signals: ["forwarding_infrastructure", "mailbox_capable_infrastructure"],
    },
  },
};

const inPath = process.argv[2] ?? "data/corpus-input.json";
const outPath = process.argv[3] ?? "data/authorized-corpus.json";

if (!existsSync(inPath)) {
  console.error(`input not found: ${inPath}`);
  console.error("copy data/corpus-input.example.json to data/corpus-input.json and fill it in.");
  process.exit(1);
}

const input = JSON.parse(readFileSync(inPath, "utf8"));
if (!Array.isArray(input)) {
  console.error("input must be a json array");
  process.exit(1);
}

const cases = [];
const problems = [];
const seenIds = new Set();

for (const row of input) {
  if (row._example) continue; // template rows are never collected
  const where = row.id ?? "(no id)";
  const spec = ARRANGEMENTS[row.arrangement];
  if (!row.id || !row.address || !spec) {
    problems.push(`${where}: needs id, address and a known arrangement (${Object.keys(ARRANGEMENTS).join(", ")})`);
    continue;
  }
  if (seenIds.has(row.id)) {
    problems.push(`${where}: duplicate id`);
    continue;
  }
  seenIds.add(row.id);
  if (!row.ground_truth_source) {
    problems.push(`${where}: ground_truth_source is required; say how you know the arrangement`);
    continue;
  }

  const at = row.address.lastIndexOf("@");
  const domain = at > 0 ? row.address.slice(at + 1).toLowerCase() : "";
  if (!domain) {
    problems.push(`${where}: address is not local@domain`);
    continue;
  }

  const observedAt = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  let mx;
  let dnsError;
  try {
    mx = await lookupMx(domain);
  } catch (err) {
    dnsError = `mx lookup failed (${err?.code ?? err?.message ?? "unknown"})`;
  }

  cases.push({
    id: row.id,
    arrangement: spec.label,
    scope: spec.scope,
    evidence: {
      address: row.address,
      mx_records: mx,
      dns_error: dnsError,
      observed_at: observedAt,
    },
    expectations: spec.expectations,
    // provenance, ignored by the runner but kept for you
    ground_truth_source: row.ground_truth_source,
    notes: row.notes,
  });
  console.log(`${row.id}: ${domain} -> ${mx ? mx.map((m) => m.exchange).join(", ") || "(no mx)" : dnsError}`);
}

if (problems.length > 0) {
  console.error("\nproblems (these rows were skipped):");
  for (const p of problems) console.error(`  ${p}`);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(cases, null, 2) + "\n");
console.log(`\nwrote ${cases.length} case(s) to ${outPath}`);
console.log("run:  npm run eval");
if (problems.length > 0) process.exitCode = 1;

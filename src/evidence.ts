// evidence.ts — gathers evidence so the core can stay pure.
// resolves mx records for the domain and runs adapters (domain-only unless
// the adapter declares full_address exposure). returns raw evidence; it
// never interprets anything.

import { resolveMx, resolveTxt, resolveSrv } from "node:dns/promises";
import type { Evidence } from "./core.js";
import { findingToSignal, type IntelligenceAdapter } from "./adapters.js";
import type { Signal } from "./schema.js";
import { DKIM_FORWARDING_SELECTORS } from "./providers.js";

export type EvidenceKind = "mx" | "txt" | "dkim" | "mta_sts" | "autodiscover";

export async function gatherEvidence(
  address: string,
  opts: {
    adapters?: IntelligenceAdapter[];
    resolver?: (domain: string) => Promise<Array<{ exchange: string; priority: number }>>;
    // which evidence to gather. default: mx only, so existing callers see no
    // cost or behavior change. the cli passes all kinds.
    kinds?: EvidenceKind[];
    // pluggable resolvers for secondary evidence (doh versions exist in
    // src/doh.ts for restricted networks). defaults use node dns.
    // txt results are normalized to flat strings regardless of resolver.
    txtResolver?: (domain: string) => Promise<string[] | string[][]>;
    srvResolver?: (name: string) => Promise<Array<{ priority: number; weight: number; port: number; target: string }>>;
    // fetches https://mta-sts.domain/.well-known/mta-sts.txt; absent
    // (undefined) when the policy does not exist. uses the network over
    // https, like doh.
    mtaStsFetch?: (domain: string) => Promise<string | undefined>;
    observedAt?: string;
  } = {}
): Promise<Evidence> {
  const domain = address.slice(address.lastIndexOf("@") + 1).toLowerCase();
  const resolve = opts.resolver ?? resolveMx;
  const observedAt =
    opts.observedAt ?? new Date().toISOString().replace(/\.\d+Z$/, "Z");

  const kinds = opts.kinds ?? ["mx"];

  let mx: Array<{ exchange: string; priority: number }> | undefined;
  let dnsError: string | undefined;
  if (kinds.includes("mx")) {
    try {
      mx = await resolve(domain);
    } catch (err) {
      dnsError = `mx lookup failed (${(err as Error).message ?? "unknown dns error"})`;
    }
  }

  // secondary evidence: raw observations, no interpretation happens here
  let secondary: Evidence["secondary_evidence"];
  if (kinds.some((k) => k !== "mx")) {
    secondary = {};
    const txtResolve = opts.txtResolver ?? resolveTxt;
    if (kinds.includes("txt")) {
      try {
        const txts = await txtResolve(domain);
        secondary.txt_records = (txts as string[][]).flat().filter(
          (t): t is string => typeof t === "string"
        );
      } catch {
        // a txt lookup failure is not a dns-level failure of the domain;
        // the evidence is simply not reported and no claim is made
      }
    }
    if (kinds.includes("dkim")) {
      const records: Array<{ selector: string; value: string }> = [];
      for (const sel of DKIM_FORWARDING_SELECTORS) {
        try {
          const values = await txtResolve(`${sel.selector}._domainkey.${domain}`);
          for (const v of (values as string[][]).flat()) {
            // a wildcard txt record answers every name (seen live: migadu.com
            // answers any selector with "migadu", yousee.dk with a
            // google-site-verification value). only a dkim-shaped record
            // counts: per rfc 6376 the v= tag is first and required.
            if (typeof v === "string" && /^\s*v\s*=\s*DKIM1\b/i.test(v)) {
              records.push({ selector: sel.selector, value: v });
            }
          }
        } catch {
          // absent selector: expected for most domains; not an error
        }
      }
      if (records.length > 0) secondary.domainkey_records = records;
    }
    if (kinds.includes("autodiscover")) {
      const srvResolve = opts.srvResolver ?? resolveSrv;
      try {
        const srv = await srvResolve(`_autodiscover._tcp.${domain}`);
        secondary.autodiscover_srv = srv.length > 0;
      } catch {
        // absent srv records are expected; presence-only evidence
      }
    }
    if (kinds.includes("mta_sts") && opts.mtaStsFetch) {
      secondary.mta_sts_policy = await opts.mtaStsFetch(domain);
    }
    if (Object.keys(secondary).length === 0) secondary = undefined;
  }

  let adapterSignals: Signal[] | undefined;
  if (opts.adapters && opts.adapters.length > 0) {
    adapterSignals = [];
    for (const adapter of opts.adapters) {
      if (adapter.data_exposure !== "domain_only") {
        continue; // full-address adapters are opt-in and not run by default
      }
      try {
        const findings = await adapter.lookupDomain(domain);
        adapterSignals.push(...findings.map((f) => findingToSignal(adapter, f)));
      } catch {
        // an adapter outage is a limitation, not a fabricated signal
        adapterSignals.push({
          name: "disposable_service",
          scope: "domain",
          source: `adapter:${adapter.name}/${adapter.version}`,
          observed_at: observedAt,
          strength: "unresolved",
          detail: `adapter ${adapter.name} was unreachable; its signal is unresolved`,
        });
      }
    }
  }

  return {
    address,
    mx_records: mx,
    dns_error: dnsError,
    secondary_evidence: secondary,
    adapter_signals: adapterSignals,
    observed_at: observedAt,
  };
}

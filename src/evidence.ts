// evidence.ts — gathers evidence so the core can stay pure.
// resolves mx records for the domain and runs adapters (domain-only unless
// the adapter declares full_address exposure). returns raw evidence; it
// never interprets anything.

import { resolveMx } from "node:dns/promises";
import type { Evidence } from "./core.js";
import { findingToSignal, type IntelligenceAdapter } from "./adapters.js";
import type { Signal } from "./schema.js";

export async function gatherEvidence(
  address: string,
  opts: {
    adapters?: IntelligenceAdapter[];
    resolver?: (domain: string) => Promise<Array<{ exchange: string; priority: number }>>;
    observedAt?: string;
  } = {}
): Promise<Evidence> {
  const domain = address.slice(address.lastIndexOf("@") + 1).toLowerCase();
  const resolve = opts.resolver ?? resolveMx;
  const observedAt =
    opts.observedAt ?? new Date().toISOString().replace(/\.\d+Z$/, "Z");

  let mx: Array<{ exchange: string; priority: number }> | undefined;
  let dnsError: string | undefined;
  try {
    mx = await resolve(domain);
  } catch (err) {
    dnsError = `mx lookup failed (${(err as Error).message ?? "unknown dns error"})`;
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
    adapter_signals: adapterSignals,
    observed_at: observedAt,
  };
}

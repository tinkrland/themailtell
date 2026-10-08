// evidence.ts — gathers evidence so the core can stay pure.
// local analysis needs no network: evidence is the address itself, plus
// any adapter findings the caller opts into. adapters that declare
// address_only exposure run by default when passed; full-address adapters
// would be opt-in but this component never holds a recipient name, so
// none exist yet.

import type { Evidence } from "./core.js";
import { findingToSignal, type IntelligenceAdapter } from "./adapters.js";
import type { Signal } from "./schema.js";
import type { PostalAddress } from "./stages/input-handling.js";

export async function gatherEvidence(
  address: PostalAddress,
  opts: {
    adapters?: IntelligenceAdapter[];
    observedAt?: string;
  } = {}
): Promise<Evidence> {
  const observedAt =
    opts.observedAt ?? new Date().toISOString().replace(/\.\d+Z$/, "Z");

  let adapterSignals: Signal[] | undefined;
  const adapterErrors: string[] = [];
  if (opts.adapters && opts.adapters.length > 0) {
    adapterSignals = [];
    for (const adapter of opts.adapters) {
      if (adapter.data_exposure !== "address_only") {
        continue; // full-address adapters are opt-in and not run by default
      }
      try {
        const findings = await adapter.lookupAddress(address);
        adapterSignals.push(...findings.map((f) => findingToSignal(adapter, f)));
      } catch (err) {
        // an adapter outage is a coverage gap, not a fabricated signal
        adapterErrors.push(`${adapter.name}: ${(err as Error).message ?? "unreachable"}`);
      }
    }
  }

  return {
    address,
    adapter_signals: adapterSignals,
    adapter_errors: adapterErrors.length > 0 ? adapterErrors : undefined,
    observed_at: observedAt,
  };
}

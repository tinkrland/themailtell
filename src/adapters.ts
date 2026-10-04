// adapters.ts — external intelligence boundary.
// third-party lists and apis plug in behind this interface. adapters must
// declare what data they receive; domain-only lookups are preferred so the
// local part never leaves the core. provenance is retained on every finding.

import type { Signal, SignalName, SignalScope, EvidenceStrength } from "./schema.js";

export interface AdapterFinding {
  signal_name: SignalName;
  scope: SignalScope;
  strength: EvidenceStrength;
  detail: string;
  // iso 8601 observation time from the provider, used for freshness
  observed_at: string;
}

export interface IntelligenceAdapter {
  name: string;
  version: string;
  // declares what this adapter receives. domain_only is preferred.
  data_exposure: "domain_only" | "full_address";
  // must map output to the provider-independent contract above
  lookupDomain(domain: string): Promise<AdapterFinding[]>;
}

// findings are converted to signals with provenance by the core; the core
// itself stays pure and receives them as already-gathered evidence.
export function findingToSignal(
  adapter: IntelligenceAdapter,
  finding: AdapterFinding
): Signal {
  return {
    name: finding.signal_name,
    scope: finding.scope,
    source: `adapter:${adapter.name}/${adapter.version}`,
    observed_at: finding.observed_at,
    strength: finding.strength,
    detail: finding.detail,
  };
}

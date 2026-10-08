// adapters.ts — the external intelligence boundary.
// carrier validation and address validation providers plug in behind
// this interface. adapters declare what data they receive and what checks
// they can evaluate, and every finding carries coverage semantics: an
// unevaluated check is coverage "none", never a clean verdict. provenance
// is retained on every signal.
//
// candidate adapters (none implemented here; all are optional and paid
// unless noted): a usps address validation chain (cass-certified tools
// with dpv confirmation and the dpv cmra and business/residential
// indicators), royal mail paf, canada post address complete, australia
// post address verification, postnl address check, swiss post address
// verification, google address validation api, smarty, loqate, melissa,
// lob. see docs/implementation.md for what each can and cannot see.

import type {
  Signal,
  SignalName,
  SignalScope,
  EvidenceStrength,
  Coverage,
} from "./schema.js";
import type { PostalAddress } from "./stages/input-handling.js";

export interface AdapterFinding {
  // e.g. "street_delivery_point_confirmed", "cmra_or_virtual_mailbox",
  // "format_issue"
  signal_name: SignalName;
  scope: SignalScope;
  strength: EvidenceStrength;
  // what this specific check covered. "none" means the check was not
  // performed; it must never be reported as a clean result.
  coverage: Coverage;
  detail: string;
  // iso 8601 observation time from the provider, used for freshness
  observed_at: string;
}

export interface IntelligenceAdapter {
  name: string;
  version: string;
  // declares what this adapter receives. "address_only" means the postal
  // address fields without any recipient name; it is the preferred shape.
  data_exposure: "address_only" | "full_address_with_recipient";
  // the checks this adapter can evaluate, e.g.
  // "delivery_point_validation", "cmra_indicator",
  // "residential_business_indicator". a finding claiming a capability the
  // adapter does not declare is scope overreach and fails the eval.
  capabilities: string[];
  lookupAddress(address: PostalAddress): Promise<AdapterFinding[]>;
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
    coverage: finding.coverage,
    detail: finding.detail,
  };
}

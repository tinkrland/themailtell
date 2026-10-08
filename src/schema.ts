// schema.ts — versioned result format.
// required concepts, deliberately not invented probabilities.

export const SCHEMA_VERSION = "0.3.0";

// the signal kinds. each is independent evidence, never a verdict.
export type SignalName =
  | "disposable_service" // known temporary/disposable mail service
  | "masking_relay_service" // known alias/relay service (envelope domain)
  | "forwarding_infrastructure" // mx maps to a recognized forwarding-only service
  | "mailbox_capable_infrastructure" // mx maps to a service that hosts inboxes
  | "gateway_infrastructure" // mx maps to a recognized security gateway
  | "shared_mail_infrastructure" // mx maps to infrastructure shared by forwarding and mailbox products; no arrangement claim
  | "alias_syntax" // address-level syntax that may indicate an alias
  | "spf_forwarding_include" // the domain's spf includes a known forwarding service (send-path evidence, separate from mx)
  | "dkim_forwarder_selector" // a dkim selector matching a known forwarding convention publishes signing keys for the domain
  | "mta_sts_policy_present" // the domain publishes an mta-sts policy (managed inbound mail, distinguishes nothing)
  | "autodiscover_present" // the domain publishes autodiscover/srv records (hosted-mailbox client configuration)
  | "local_part_semantics"; // declared provider knowledge about local parts (dot handling, alias products); reported, never applied

// what the signal is about, not what it proves.
export type SignalScope =
  | "address"
  | "domain"
  | "provider_infrastructure";

// evidence strength with explicit meanings. never a probability.
//   recognized  — matched a maintained provider pattern or list entry
//   suggestive  — structural evidence only, no recognized match
//   unresolved  — evidence exists but the arrangement could not be established
export type EvidenceStrength = "recognized" | "suggestive" | "unresolved";

export interface Signal {
  name: SignalName;
  scope: SignalScope;
  // provenance: builtin table version, adapter name+version, or dns observation
  source: string;
  // iso 8601. when the underlying evidence was observed. for builtin-table
  // signals this is the table's verification date and for community-list
  // signals the snapshot date, so the knowledge itself ages; for dns
  // observations and adapter findings it is the observation time; for
  // syntax facts it is the evidence time of the address sighting.
  observed_at: string;
  strength: EvidenceStrength;
  detail: string;
}

// aggregate states. unknown is a first-class answer, never flattened.
//   signals_present — consistent evidence collected, no contradiction
//   mixed_routing   — recognized forwarding and mailbox infrastructure both seen
//   contradictory   — recognized signals from different scopes disagree
//   unknown         — no established arrangement, or evidence gathering failed
export type ResultState =
  | "signals_present"
  | "mixed_routing"
  | "contradictory"
  | "unknown";

export interface DetectionResult {
  schema_version: string;
  // the domain only. the local part is not echoed back or logged here.
  domain: string;
  input_valid: boolean;
  invalid_reason?: string;
  signals: Signal[];
  state: ResultState;
  // honest statements about what the evidence cannot establish
  limitations: string[];
  evaluated_at: string;
}

// core.ts — the pure function over evidence.
// no dns, no clock, no network, no policy. everything it needs arrives as
// evidence; decisions stay with the consuming application.

import { SCHEMA_VERSION, type DetectionResult, type Signal } from "./schema.js";
import { handleInput } from "./stages/input-handling.js";
import { domainIntelligence } from "./stages/domain-intelligence.js";
import { routingIntelligence } from "./stages/routing-intelligence.js";
import { addressAnalysis } from "./stages/address-analysis.js";
import { aggregate } from "./stages/aggregation.js";

export interface Evidence {
  address: string;
  // mx records as observed. omitted when lookup failed or was not attempted
  mx_records?: Array<{ exchange: string; priority: number }>;
  // dns-level failure: timeout, servfail, etc. results in unknown, not a guess
  dns_error?: string;
  // already-gathered adapter signals, converted with provenance
  adapter_signals?: Signal[];
  // when this evidence was observed (iso 8601). supplied by the caller,
  // typically from gatherEvidence(), so this function stays deterministic
  observed_at: string;
}

export interface AnalyzeOptions {
  // iso 8601 evaluation time. default: observed_at
  now?: string;
  // max age of a signal before it is downgraded to unresolved
  maxAgeDays?: number;
}

export function analyze(
  evidence: Evidence,
  options: AnalyzeOptions = {}
): DetectionResult {
  const observedAt = evidence.observed_at;
  const evaluatedAt = options.now ?? observedAt;
  const input = handleInput(evidence.address);

  if (!input.valid || !input.domain) {
    return {
      schema_version: SCHEMA_VERSION,
      domain: input.domain ?? "",
      input_valid: false,
      invalid_reason: input.invalid_reason,
      signals: [],
      state: "unknown",
      limitations: [],
      evaluated_at: evaluatedAt,
    };
  }

  const limitations: string[] = [];
  const signals: Signal[] = [];

  // stage 2: domain-level list intelligence
  signals.push(...domainIntelligence(input.domain, observedAt));

  if (evidence.dns_error) {
    limitations.push(
      `routing evidence unavailable: ${evidence.dns_error}; the result is ` +
        `unknown rather than assumed`
    );
  }

  // stage 3: routing intelligence over the observed mx records
  const routing = routingIntelligence(evidence.mx_records, observedAt);
  signals.push(...routing.signals);
  limitations.push(...routing.limitations);

  // stage 4: address-level syntax facts, kept separate from provider semantics
  const address = addressAnalysis(input, routing.matchedEntries, observedAt);
  signals.push(...address.signals);
  limitations.push(...address.limitations);

  // external adapters, already converted to signals with provenance
  if (evidence.adapter_signals) {
    signals.push(...evidence.adapter_signals);
  }

  if (!evidence.mx_records && !evidence.dns_error) {
    limitations.push(
      "no routing evidence was supplied; forwarding and mailbox claims " +
        "are limited to list and syntax signals"
    );
  }

  // stage 5: aggregation. collects, reports contradictions, never decides
  const outcome = aggregate(signals, limitations, {
    now: evaluatedAt,
    maxAgeDays: options.maxAgeDays,
  });

  return {
    schema_version: SCHEMA_VERSION,
    domain: input.domain,
    input_valid: true,
    signals: outcome.signals,
    state: outcome.state,
    limitations: outcome.limitations,
    evaluated_at: evaluatedAt,
  };
}

// core.ts — the pure function over evidence.
// no network, no clock, no policy. everything it needs arrives as
// evidence; decisions stay with the consuming application. the core never
// says accept or reject, and never converts "no box-shaped evidence found"
// into "street address verified".

import { SCHEMA_VERSION, type DetectionResult, type Signal, type ShapeFindings } from "./schema.js";
import { handleInput, type PostalAddress } from "./stages/input-handling.js";
import { lexicalIntelligence } from "./stages/lexical-intelligence.js";
import { carrierIntelligence } from "./stages/carrier-intelligence.js";
import { providerIntelligence } from "./stages/provider-intelligence.js";
import { formatIntelligence } from "./stages/format-intelligence.js";
import { aggregate } from "./stages/aggregation.js";
import { MARKET_TABLES, MAILBOX_PROVIDERS } from "./markets/index.js";
import type { MailboxProviderEntry, FacilityAddressEntry } from "./tables.js";
import { FACILITY_ADDRESSES } from "./markets/facilities.js";
import { facilityIntelligence } from "./stages/facility-intelligence.js";

export interface Evidence {
  address: PostalAddress;
  // injectable provider and facility tables, for tests and for consumers
  // that maintain their own tables; the seeded tables are the default
  providers?: MailboxProviderEntry[];
  facilities?: FacilityAddressEntry[];
  // already-gathered adapter signals, converted with provenance
  adapter_signals?: Signal[];
  // adapter outages, reported as limitations; never a fabricated signal
  adapter_errors?: string[];
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

const UNKNOWN_FINDINGS: ShapeFindings = {
  po_box_equivalent: "unknown",
  parcel_locker_or_pickup_point: "unknown",
  cmra_or_virtual_mailbox: "unknown",
  mail_forwarding_or_reshipping: "unknown",
  format_validity: "unknown",
};

export function analyze(
  evidence: Evidence,
  options: AnalyzeOptions = {}
): DetectionResult {
  const evaluatedAt = options.now ?? evidence.observed_at;
  const input = handleInput(evidence.address);

  if (!input.valid || !input.market) {
    return {
      schema_version: SCHEMA_VERSION,
      market: typeof evidence.address?.market === "string" ? evidence.address.market : "",
      input_valid: false,
      invalid_reason: input.invalid_reason,
      signals: [],
      state: "unknown",
      shape_findings: UNKNOWN_FINDINGS,
      limitations: [],
      evaluated_at: evaluatedAt,
    };
  }

  const tables = MARKET_TABLES[input.market];
  const limitations: string[] = [];
  const signals: Signal[] = [];

  if (!tables) {
    limitations.push(
      `market ${input.market} has no local tables; shape findings are unknown, ` +
        `not "no evidence". adding a market is additive table rows, not code changes`
    );
  }

  // stage 2: po box equivalents from the market's lexical table
  if (tables) {
    const lexical = lexicalIntelligence(input, tables);
    signals.push(...lexical.signals);
    limitations.push(...lexical.limitations);
  }

  // stage 3: carrier locker and pickup-point formats
  if (tables) {
    const carrier = carrierIntelligence(input, tables);
    signals.push(...carrier.signals);
    limitations.push(...carrier.limitations);
  }

  // stage 4: cmra, virtual-mailbox and forwarding providers (cross-market
  // table). forwarder rows emit their own signal: a reshipping facility is
  // a distinct commercial class from a virtual mailbox and consumers may
  // treat the two differently; the component never decides which.
  const providerTable = evidence.providers ?? MAILBOX_PROVIDERS;
  const facilityTable = evidence.facilities ?? FACILITY_ADDRESSES;
  const providerRows = providerTable.filter(
    (p) => p.kind !== "mail_forwarder" && p.markets.includes(input.market!)
  );
  const forwarderRows = providerTable.filter(
    (p) => p.kind === "mail_forwarder" && p.markets.includes(input.market!)
  );
  const provider = providerIntelligence(input, providerTable);
  signals.push(...provider.signals);
  limitations.push(...provider.limitations);
  if (providerRows.length === 0) {
    limitations.push(
      `market ${input.market} has no cmra or virtual-mailbox provider rows seeded; ` +
        `that finding is unknown, not "no evidence"`
    );
  }
  if (forwarderRows.length === 0) {
    limitations.push(
      `market ${input.market} has no parcel-forwarding or reshipping provider rows ` +
        `seeded; that finding is unknown, not "no evidence"`
    );
  }

  // stage 4b: known facility street addresses (providers and forwarders).
  // a facility address match catches branded-suite and unbranded-suite
  // use at a known facility without any adapter; the table is a snapshot
  // of a moving target, so absence of a match is never evidence of a
  // private residence.
  const marketFacilities = facilityTable.filter((f) => f.market === input.market);
  const facility = facilityIntelligence(input, marketFacilities);
  signals.push(...facility.signals);
  limitations.push(...facility.limitations);

  // stage 5: format validity from the market's format rules
  const format = formatIntelligence(input, tables);
  signals.push(...format.signals);
  limitations.push(...format.limitations);

  // external adapters, already converted to signals with provenance
  if (evidence.adapter_signals) {
    signals.push(...evidence.adapter_signals);
  }
  for (const err of evidence.adapter_errors ?? []) {
    limitations.push(
      `carrier validation adapter unavailable (${err}); its check is coverage ` +
        `none, and the result is honest about not having run it`
    );
  }

  // stage 6: aggregation. collects, reports contradictions, never decides
  const outcome = aggregate(signals, limitations, {
    now: evaluatedAt,
    maxAgeDays: options.maxAgeDays,
    coverage: {
      po_box_covered: !!tables,
      carrier_covered: !!tables,
      provider_covered:
        providerRows.length > 0 ||
        marketFacilities.some((f) => f.kind !== "mail_forwarder"),
      forwarding_covered:
        forwarderRows.length > 0 ||
        marketFacilities.some((f) => f.kind === "mail_forwarder"),
    },
    formatFinding: format.finding,
  });

  return {
    schema_version: SCHEMA_VERSION,
    market: input.market,
    input_valid: true,
    signals: outcome.signals,
    state: outcome.state,
    shape_findings: outcome.shape_findings,
    limitations: outcome.limitations,
    evaluated_at: evaluatedAt,
  };
}

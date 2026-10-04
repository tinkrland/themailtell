// stage 3: routing intelligence.
// maps observed mx exchanges through the provider table into categories.
// unknown infrastructure gets no category claim. gateways are never
// classified as forwarding-only. matched provider semantics (plus-tag
// conventions, shared infrastructure) are surfaced as separate facts.

import { findProvider, PROVIDER_TABLE_VERSION, type ProviderEntry } from "../providers.js";
import type { Signal } from "../schema.js";

export interface MxRecord {
  exchange: string;
  priority: number;
}

export interface RoutingOutcome {
  signals: Signal[];
  limitations: string[];
  // provider entries matched by routing, for the address-analysis stage
  matchedEntries: ProviderEntry[];
  // true if a matched provider is known to host both inboxes and forwarding
  sharedInfrastructure: boolean;
}

export function routingIntelligence(
  mxRecords: MxRecord[] | undefined,
  observedAt: string
): RoutingOutcome {
  const signals: Signal[] = [];
  const limitations: string[] = [];
  const matched = new Map<string, ProviderEntry>();
  const seen = new Set<string>();

  if (!mxRecords || mxRecords.length === 0) {
    return { signals, limitations, matchedEntries: [], sharedInfrastructure: false };
  }

  for (const rec of mxRecords) {
    const entry = findProvider(rec.exchange);
    if (entry) matched.set(entry.provider, entry);
  }

  let shared = false;
  for (const [provider, entry] of matched) {
    if (entry.shared_infrastructure) {
      shared = true;
      limitations.push(
        `${provider}: forwarding and mailbox products share this ` +
          `infrastructure; the arrangement of an individual address cannot be ` +
          `distinguished from routing evidence`
      );
    }
    if (entry.category === "forwarding" && !seen.has("forwarding")) {
      seen.add("forwarding");
      signals.push({
        name: "forwarding_infrastructure",
        scope: "provider_infrastructure",
        source: `mx-lookup:${provider} (builtin-table/${PROVIDER_TABLE_VERSION})`,
        observed_at: observedAt,
        strength: "recognized",
        detail: `mx points at ${provider}, a recognized forwarding-only service`,
      });
      limitations.push(
        "forwarding is established at the domain level; the private " +
          "destination mailbox is not and will not be discovered"
      );
    }
    if (entry.category === "mailbox_capable" && !seen.has("mailbox")) {
      seen.add("mailbox");
      signals.push({
        name: "mailbox_capable_infrastructure",
        scope: "provider_infrastructure",
        source: `mx-lookup:${provider} (builtin-table/${PROVIDER_TABLE_VERSION})`,
        observed_at: observedAt,
        strength: "recognized",
        detail: `mx points at ${provider}, which hosts inboxes`,
      });
      limitations.push(
        "mailbox-capable infrastructure establishes the service's " +
          "capability, not this address's storage arrangement"
      );
    }
    if (entry.category === "gateway" && !seen.has("gateway")) {
      seen.add("gateway");
      signals.push({
        name: "gateway_infrastructure",
        scope: "provider_infrastructure",
        source: `mx-lookup:${provider} (builtin-table/${PROVIDER_TABLE_VERSION})`,
        observed_at: observedAt,
        strength: "recognized",
        detail:
          `mx points at ${provider}, a security gateway: ` +
          (entry.note ?? "it relays mail to a final host"),
      });
      limitations.push(
        "a security gateway relays mail onward; it is not classified as " +
          "forwarding-only and the final arrangement stays unobserved"
      );
    }
  }

  if (matched.size === 0) {
    limitations.push(
      "mx hosts are not recognized; no infrastructure category is claimed"
    );
  }

  return {
    signals,
    limitations,
    matchedEntries: [...matched.values()],
    sharedInfrastructure: shared,
  };
}

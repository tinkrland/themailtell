// stage 3: routing intelligence.
// maps observed mx exchanges through the provider table into categories.
// unknown infrastructure gets no category claim. gateways are never
// classified as forwarding-only. infrastructure shared by forwarding and
// mailbox products gets a "shared" signal that makes no arrangement claim.
// matched provider semantics (plus-tag conventions) are surfaced as
// separate facts. signals are stamped with the table's verification date:
// the knowledge ages, not the lookup.

import { findProvider, PROVIDER_TABLE_VERSION, PROVIDER_TABLE_AS_OF, type ProviderEntry } from "../providers.js";
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
}

export function routingIntelligence(
  mxRecords: MxRecord[] | undefined
): RoutingOutcome {
  const signals: Signal[] = [];
  const limitations: string[] = [];
  const matched = new Map<string, ProviderEntry>();
  const seen = new Set<string>();

  if (!mxRecords || mxRecords.length === 0) {
    return { signals, limitations, matchedEntries: [] };
  }

  for (const rec of mxRecords) {
    const entry = findProvider(rec.exchange);
    if (entry) matched.set(entry.provider, entry);
  }

  for (const [provider, entry] of matched) {
    const base = {
      scope: "provider_infrastructure" as const,
      source: `mx-lookup:${provider} (builtin-table/${PROVIDER_TABLE_VERSION})`,
      observed_at: PROVIDER_TABLE_AS_OF,
      strength: "recognized" as const,
    };

    if (entry.category === "forwarding" && !seen.has("forwarding")) {
      seen.add("forwarding");
      signals.push({
        ...base,
        name: "forwarding_infrastructure",
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
        ...base,
        name: "mailbox_capable_infrastructure",
        detail: `mx points at ${provider}, which hosts inboxes`,
      });
      limitations.push(
        "mailbox-capable infrastructure establishes the service's " +
          "capability, not this address's storage arrangement"
      );
    }
    if (entry.category === "shared" && !seen.has("shared")) {
      seen.add("shared");
      signals.push({
        ...base,
        name: "shared_mail_infrastructure",
        detail:
          `mx points at ${provider}, whose forwarding and mailbox products ` +
          `share this infrastructure; the arrangement of an individual ` +
          `address cannot be established from routing alone`,
      });
      limitations.push(
        `${provider}: forwarding and mailbox products share this ` +
          `infrastructure; no per-address arrangement is claimed`
      );
    }
    if (entry.category === "gateway" && !seen.has("gateway")) {
      seen.add("gateway");
      signals.push({
        ...base,
        name: "gateway_infrastructure",
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
  };
}

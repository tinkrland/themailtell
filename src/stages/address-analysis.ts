// stage 4: address analysis.
// reports syntax features that may indicate an alias, and — separately —
// what a matched provider is known to do with that syntax. the syntax fact
// and the provider-semantics fact are never merged into one claim.

import type { InputHandle } from "./input-handling.js";
import type { Signal } from "../schema.js";
import { PROVIDER_TABLE_VERSION } from "../providers.js";

export interface AddressOutcome {
  signals: Signal[];
  limitations: string[];
  // providers with a known plus-tag convention, from routing
  plusTagProviders: string[];
}

export function addressAnalysis(
  input: InputHandle,
  matchedProviders: Array<{ provider: string; plus_tag_semantics?: boolean }>,
  observedAt: string
): AddressOutcome {
  const signals: Signal[] = [];
  const limitations: string[] = [];
  if (!input.valid || !input.local_part) {
    return { signals, limitations, plusTagProviders: [] };
  }

  if (input.syntax_facts.has_plus) {
    signals.push({
      name: "alias_syntax",
      scope: "address",
      source: "syntax-observation",
      observed_at: observedAt,
      strength: "suggestive",
      detail:
        "local part contains a plus sign; it may be a tagging alias or a " +
        "literal character — the address is not rewritten to test either",
    });
  }

  const plusProviders = matchedProviders.filter((p) => p.plus_tag_semantics);
  for (const p of plusProviders) {
    signals.push({
      name: "alias_syntax",
      scope: "provider_infrastructure",
      source: `builtin-table/${PROVIDER_TABLE_VERSION}`,
      observed_at: observedAt,
      strength: "recognized",
      detail:
        `${p.provider} is known to treat a plus tag as a sub-address ` +
        `convention; a distinct address here does not imply a distinct mailbox`,
    });
  }
  const hasAliasishSyntax =
    input.syntax_facts.has_plus || input.syntax_facts.has_dot_in_local_part;
  if (plusProviders.length === 0 && hasAliasishSyntax) {
    limitations.push(
      "provider alias semantics unknown; plus/dot syntax is reported " +
        "without claiming what this provider does with it"
    );
  }

  return {
    signals,
    limitations,
    plusTagProviders: plusProviders.map((p) => p.provider),
  };
}

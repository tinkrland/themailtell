// stage 4: address analysis.
// reports syntax features that may indicate an alias, and — separately —
// what a matched provider is known to do with that syntax. the syntax fact
// and the provider-semantics fact are never merged into one claim.

import type { InputHandle } from "./input-handling.js";
import type { Signal } from "../schema.js";
import { PROVIDER_TABLE_VERSION, PROVIDER_TABLE_AS_OF } from "../providers.js";

// declared provider semantics beyond plus tags. these are knowledge
// statements about how a provider treats local parts (dot equivalence,
// account-level alias products); they are reported as signals and never
// applied as rewrites. the contract already forbids rewriting; these
// signals make the declared knowledge explicit instead of leaving it
// implicit in the plus-tag flag.

export interface AddressOutcome {
  signals: Signal[];
  limitations: string[];
  // providers with a known plus-tag convention, from routing
  plusTagProviders: string[];
}

export function addressAnalysis(
  input: InputHandle,
  matchedProviders: Array<{
    provider: string;
    plus_tag_semantics?: boolean;
    dots_ignored?: boolean;
    alias_semantics_note?: string;
  }>,
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
      observed_at: observedAt, // the sighting time; syntax does not age
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
      observed_at: PROVIDER_TABLE_AS_OF,
      strength: "recognized",
      detail:
        `${p.provider} is known to treat a plus tag as a sub-address ` +
        `convention; a distinct address here does not imply a distinct mailbox`,
    });
  }
  // declared dot semantics: reported only when the provider is known to
  // ignore dots and the address actually contains dots. never a rewrite.
  const dotProviders = matchedProviders.filter((p) => p.dots_ignored);
  if (input.syntax_facts.has_dot_in_local_part) {
    for (const p of dotProviders) {
      signals.push({
        name: "local_part_semantics",
        scope: "provider_infrastructure",
        source: `builtin-table/${PROVIDER_TABLE_VERSION}`,
        observed_at: PROVIDER_TABLE_AS_OF,
        strength: "recognized",
        detail:
          `${p.provider} is known to ignore dots in local parts at delivery ` +
          `for its own address families (google notes dot handling may ` +
          `differ on organization-configured custom domains); dotted and ` +
          `undotted variants deliver to the same mailbox there. declared ` +
          `knowledge, reported only; the address is never rewritten`,
      });
      limitations.push(
        "dot-equivalence is provider knowledge, not an address-level " +
          "claim; the address is never rewritten, and consuming " +
          "applications decide what to do with it"
      );
    }
  }

  // declared alias-product semantics: providers whose mailboxes can hold
  // account-level alias addresses with no syntax marker. reported for every
  // address at that infrastructure, because syntax cannot confirm or deny it.
  for (const p of matchedProviders) {
    if (p.alias_semantics_note) {
      signals.push({
        name: "local_part_semantics",
        scope: "provider_infrastructure",
        source: `builtin-table/${PROVIDER_TABLE_VERSION}`,
        observed_at: PROVIDER_TABLE_AS_OF,
        strength: "recognized",
        detail: `${p.provider}: ${p.alias_semantics_note}`,
      });
    }
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

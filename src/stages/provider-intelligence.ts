// provider stage: known virtual-number providers and community lists.
//
// honest by design: most consumer voip apps (google voice, textnow, burner,
// hushed, mysudo) draw numbers from ordinary national blocks, so local
// detection cannot see them and their rows document that gap. the local
// evidence paths for virtual numbers are the market's designated virtual
// ranges (gb 056, de 032, nl 085, fr 09, ...), carrier adapter line types,
// and community lists of numbers seen on public sms-receive websites.
//
// every row ages the same way: a provider row ages from its verified_on
// date like a numbering-plan row, and a community snapshot ages from its
// snapshot date. both downgrade to unresolved instead of asserting, and
// aggregation never converts unresolved evidence into a finding.

import type { CommunityListRow, ParseEvidence, ProviderRow } from "../tables.js";
import { PROVIDERS, COMMUNITY_LISTS } from "../providers.js";
import type { Signal } from "../schema.js";

export interface ProviderStageOutput {
  signals: Signal[];
  virtual_number: boolean;
  limitation: string | null;
}

export function providerStage(
  parse: ParseEvidence,
  community_lists: CommunityListRow[],
  observed_at: string,
  max_age_days: number,
  // injectable for tests; the seeded table is the default
  providers: ProviderRow[] = PROVIDERS,
): ProviderStageOutput {
  const signals: Signal[] = [];
  let virtual_number = false;
  let limitation: string | null = null;

  // known providers with distinguishable prefixes, if any ever gain them
  const market_providers = providers.filter(
    (p) => parse.market && p.markets.includes(parse.market),
  );
  const invisible = market_providers.filter((p) => p.prefixes === null);
  if (invisible.length > 0 && parse.valid) {
    limitation =
      "known virtual-number providers operate in this market whose " +
      "numbers local range detection cannot see; absence of a provider " +
      "signal is not evidence of a carrier number";
  }

  for (const provider of market_providers) {
    if (!provider.prefixes || !parse.national_significant_number) continue;
    const hit = provider.prefixes.find((p) => parse.national_significant_number!.startsWith(p));
    if (!hit) continue;
    // the same age math as a numbering-plan row: verified rows age from
    // verified_on and downgrade to unresolved past the window; unverified
    // rows stay suggestive
    const strength: Signal["strength"] = !provider.verified_on
      ? "suggestive"
      : ageDays(provider.verified_on, observed_at) > max_age_days
        ? "unresolved"
        : "recognized";
    virtual_number = true;
    signals.push({
      name: "known_virtual_provider",
      scope: "provider",
      market: parse.market,
      source: `provider table (${provider.provider})`,
      observed_at,
      strength,
      coverage: "partial",
      detail:
        `the national significant number starts with ${hit}, a prefix known to be used by ${provider.provider}` +
        (strength === "unresolved"
          ? "; the provider row is past its verification window, so it downgrades to unresolved rather than asserting"
          : ""),
      citation: provider.citation,
    });
  }

  // community list snapshots: exact number matches only
  for (const list of [...community_lists, ...COMMUNITY_LISTS]) {
    if (!parse.e164 || !list.numbers.includes(parse.e164)) continue;
    const stale =
      ageDays(list.snapshot_date, observed_at) > max_age_days;
    const strength = stale ? "unresolved" : "suggestive";
    virtual_number = true;
    signals.push({
      name: "community_list",
      scope: "provider",
      market: parse.market,
      source: `community list (${list.list})`,
      observed_at,
      strength,
      coverage: "partial",
      detail:
        `the number was observed on the public sms-receive list ${list.list} ` +
        `(snapshot ${list.snapshot_date})` +
        (stale
          ? "; the snapshot is stale, so it downgrades to unresolved rather than asserting"
          : ""),
      citation: list.citation,
    });
  }

  return { signals, virtual_number, limitation };
}

function ageDays(from_iso_date: string, to_iso: string): number {
  const from = new Date(from_iso_date + "T00:00:00Z").getTime();
  const to = new Date(to_iso).getTime();
  return Math.max(0, (to - from) / 86_400_000);
}

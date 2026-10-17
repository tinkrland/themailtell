// stage 2: domain intelligence.
// checks the address domain against known relay and disposable lists and
// emits domain-scope signals. it makes no address-level claims. the curated
// lists and the community snapshot keep separate provenance, and each
// carries its own knowledge date so staleness applies to the lists
// themselves, not to the moment of lookup.

import {
  RELAY_DOMAINS,
  PROVIDER_TABLE_VERSION,
  PROVIDER_TABLE_AS_OF,
  domainMatchesList,
  findDisposableSource,
  findEphemeralAccount,
} from "../providers.js";
import type { Signal } from "../schema.js";

export function domainIntelligence(domain: string): Signal[] {
  const signals: Signal[] = [];
  if (domainMatchesList(domain, RELAY_DOMAINS)) {
    signals.push({
      name: "masking_relay_service",
      scope: "domain",
      source: `builtin-list/${PROVIDER_TABLE_VERSION}`,
      observed_at: PROVIDER_TABLE_AS_OF,
      strength: "recognized",
      detail: "domain belongs to a known masking/relay service",
    });
  }
  const ephemeral = findEphemeralAccount(domain);
  if (ephemeral) {
    signals.push({
      name: "ephemeral_account_domain",
      scope: "domain",
      source: `builtin-list/${PROVIDER_TABLE_VERSION}`,
      observed_at: ephemeral.verified_on,
      strength: "recognized",
      detail:
        `${ephemeral.provider}: accounts on this domain are minted ` +
        "per session and deleted when the session ends. while they " +
        "live they are full accounts that pass sso gates, so an " +
        "oauth pass here is never an ownership or age bound",
    });
  }
  const disposable = findDisposableSource(domain);
  if (disposable) {
    signals.push({
      name: "disposable_service",
      scope: "domain",
      source: disposable.source,
      observed_at: disposable.observedAt,
      strength: "recognized",
      detail: disposable.detail,
    });
  }
  return signals;
}

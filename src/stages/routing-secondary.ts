// stage 3b: secondary routing evidence.
// non-mx dns evidence: spf includes, dkim selector conventions, mta-sts
// and autodiscover/srv records. every signal here is kept strictly separate
// from mx-based routing: an spf include or dkim selector is send-path
// configuration, showing the domain has authorized a service to send or
// sign for it, which is typical for forwarding setups but never proof of a
// current forwarding arrangement. mta-sts and autodiscover are presence-only
// observations and distinguish nothing by themselves; their absence proves
// nothing either, because probing is imperfect.
//
// why this exists: some forwarding products (notably spaceship's) publish
// no mx hosts, so their domains report unknown infrastructure. secondary
// evidence gives those domains a separate, honestly-worded domain-scope
// signal without ever flattening it into the mx-based forwarding signal.

import {
  SPF_FORWARDING_INCLUDES,
  DKIM_FORWARDING_SELECTORS,
  PROVIDER_TABLE_VERSION,
  PROVIDER_TABLE_AS_OF,
} from "../providers.js";
import type { Signal } from "../schema.js";

export interface SecondaryEvidence {
  // raw txt records observed for the domain
  txt_records?: string[];
  // dkim records observed at known selector conventions, as probed
  domainkey_records?: Array<{ selector: string; value: string }>;
  // the raw mta-sts policy text fetched from
  // https://mta-sts.domain/.well-known/mta-sts.txt, when present
  mta_sts_policy?: string;
  // true when an _autodiscover._tcp srv record was observed
  autodiscover_srv?: boolean;
}

export interface SecondaryOutcome {
  signals: Signal[];
  limitations: string[];
}

export function secondaryRoutingEvidence(
  ev: SecondaryEvidence,
  observedAt: string
): SecondaryOutcome {
  const signals: Signal[] = [];
  const limitations: string[] = [];
  const seenSpf = new Set<string>();

  // spf includes: send-path authorization evidence
  let sawSpfRecord = false;
  const spfHits = new Map<string, { token: string; provider: string }>();
  for (const txt of ev.txt_records ?? []) {
    if (!txt.trim().toLowerCase().startsWith("v=spf1")) continue;
    sawSpfRecord = true;
    for (const m of txt.matchAll(/include:([^\s]+)/gi)) {
      const token = m[1].toLowerCase().replace(/\.$/, "");
      const entry = SPF_FORWARDING_INCLUDES.find(
        (e) => e.token.toLowerCase() === token
      );
      if (entry) {
        spfHits.set(entry.provider, { token: entry.token, provider: entry.provider });
      }
    }
  }
  for (const [provider, hit] of spfHits) {
    if (seenSpf.has(provider)) continue;
    seenSpf.add(provider);
    signals.push({
      name: "spf_forwarding_include",
      scope: "domain",
      source: `dns-observation:txt (builtin-table/${PROVIDER_TABLE_VERSION})`,
      observed_at: PROVIDER_TABLE_AS_OF,
      strength: "recognized",
      detail:
        `the domain's spf record includes ${hit.token}, ${provider}'s ` +
        `sending infrastructure`,
    });
    limitations.push(
      `${provider}: an spf include is send-path configuration. it ` +
        `authorizes ${provider}'s servers to send mail for the domain, ` +
        `which is typical for a forwarding setup but is not proof of a ` +
        `current forwarding arrangement; it is never flattened into the ` +
        `mx-based forwarding signal`
    );
  }
  if (sawSpfRecord && spfHits.size === 0) {
    limitations.push(
      "the domain's spf record contains no recognized forwarding-service " +
        "include"
    );
  }

  // dkim selectors at known forwarding conventions: signing-key evidence.
  // only dkim-shaped records count (v=DKIM1 first, per rfc 6376): wildcard
  // txt records answer any selector name with unrelated values, seen live
  // at migadu.com and yousee.dk, and must not produce signals.
  const seenDkim = new Set<string>();
  for (const rec of ev.domainkey_records ?? []) {
    if (!/^\s*v\s*=\s*DKIM1\b/i.test(rec.value)) continue;
    const entry = DKIM_FORWARDING_SELECTORS.find(
      (e) => e.selector.toLowerCase() === rec.selector.toLowerCase()
    );
    if (entry && !seenDkim.has(entry.provider)) {
      seenDkim.add(entry.provider);
      signals.push({
        name: "dkim_forwarder_selector",
        scope: "domain",
        source: `dns-observation:txt/${rec.selector}._domainkey (builtin-table/${PROVIDER_TABLE_VERSION})`,
        observed_at: PROVIDER_TABLE_AS_OF,
        strength: "recognized",
        detail:
          `a dkim record at ${rec.selector}._domainkey matches ` +
          `${entry.provider}'s selector convention; ${entry.provider} ` +
          `publishes signing keys for the domain`,
      });
      limitations.push(
        `${entry.provider}: a dkim selector is signing-path evidence. the ` +
          `service signs mail for the domain, which is typical for a ` +
          `forwarding setup but is not proof of a current forwarding ` +
          `arrangement; it is kept separate from mx-based forwarding evidence`
      );
    }
  }

  // mta-sts: presence-only, distinguishes nothing
  if (ev.mta_sts_policy !== undefined) {
    signals.push({
      name: "mta_sts_policy_present",
      scope: "domain",
      source: "https-observation:mta-sts/.well-known/mta-sts.txt",
      observed_at: observedAt,
      strength: "suggestive",
      detail:
        "the domain publishes an mta-sts policy, indicating deliberate " +
        "inbound mail configuration; it distinguishes neither forwarding " +
        "nor mailboxes",
    });
  }

  // autodiscover/srv: presence-only, weakly associated with hosted clients
  if (ev.autodiscover_srv) {
    signals.push({
      name: "autodiscover_present",
      scope: "domain",
      source: "dns-observation:srv/_autodiscover._tcp",
      observed_at: observedAt,
      strength: "suggestive",
      detail:
        "the domain publishes an _autodiscover._tcp srv record, associated " +
        "with hosted mailbox client configuration; suggestive only, and " +
        "the absence of such a record proves nothing (presence-only evidence)",
    });
  }

  return { signals, limitations };
}

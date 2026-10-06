// providers.ts — intelligence tables.
// entries marked "verified" were confirmed against live dns or official
// provider docs on the dates in their notes. everything else needs verified
// research before production use; this is a seed plus a community snapshot,
// not a claim of coverage.
//
// staleness: signals derived from this table are stamped with
// PROVIDER_TABLE_AS_OF, not the lookup time, so an unmaintained table goes
// stale and stops producing claims on its own (see the aggregation stage).
// refresh the verification and bump the date, or the intelligence expires.
//
// matching is exact-host or dns-style suffix (host equals "example.com" or
// ends with ".example.com"), longest match wins.

import {
  COMMUNITY_DISPOSABLE_DOMAINS,
  COMMUNITY_LIST_SNAPSHOT,
} from "./generated/disposable-domains.js";

export type InfrastructureCategory =
  | "mailbox_capable"
  | "forwarding"
  | "gateway"
  | "shared";

// the date this table's knowledge was last verified. derived signals carry
// this date as their observed_at so staleness applies to the knowledge,
// not to the moment of lookup.
export const PROVIDER_TABLE_AS_OF = "2026-10-06";
export const PROVIDER_TABLE_VERSION = "seed/0.3.0";

export interface ProviderEntry {
  // host or parent domain to match mx exchanges against
  match: string;
  provider: string;
  category: InfrastructureCategory;
  // this provider is known to treat a plus tag as a sub-address convention.
  // reported separately from raw syntax so the two facts never blur.
  plus_tag_semantics?: boolean;
  note?: string;
}

// forwarding-only services and registrar forwarding products. a custom domain
// pointing here is strong domain-level forwarding evidence.
export const FORWARDING_ENTRIES: ProviderEntry[] = [
  {
    match: "fwd1.porkbun.com",
    provider: "porkbun email forwarding",
    category: "forwarding",
    note:
      "the fwd hosts serve the forwarding product (verified: kb.porkbun.com). " +
      "porkbun also sells an in-house hosted email product (inboxes plus 20 " +
      "free forwards) and a proton partnership; the hosted product's mx " +
      "hosts are not published in text and are not yet in this table, so a " +
      "porkbun-hosted domain's other records must not be guessed from these",
  }, // verified 2026-10-06: kb.porkbun.com
  {
    match: "fwd2.porkbun.com",
    provider: "porkbun email forwarding",
    category: "forwarding",
    note: "see the fwd1 entry for the porkbun hosted-email gap",
  }, // verified 2026-10-06: kb.porkbun.com
  { match: "improvmx.com", provider: "improvmx", category: "forwarding" },
  { match: "forwardemail.net", provider: "forward email", category: "forwarding" },
  { match: "route1.mx.cloudflare.net", provider: "cloudflare email routing", category: "forwarding" },
  { match: "route2.mx.cloudflare.net", provider: "cloudflare email routing", category: "forwarding" },
  { match: "route3.mx.cloudflare.net", provider: "cloudflare email routing", category: "forwarding" },
];

// infrastructure shared by forwarding and mailbox products. no per-address
// arrangement claim is made: neither "forwarding-only" nor "hosts inboxes".
export const SHARED_INFRASTRUCTURE_ENTRIES: ProviderEntry[] = [
  {
    match: "secureserver.net",
    provider: "godaddy mail infrastructure",
    category: "shared",
    note:
      "registrar hosted-mail and forwarding products have shared this " +
      "infrastructure; routing evidence cannot distinguish them per address",
  },
  {
    match: "mx.mailbox.org",
    provider: "mailbox.org family products",
    category: "shared",
    note:
      "the same infrastructure serves mailbox.org mailboxes and forwarding " +
      "family products; routing evidence cannot distinguish them per address",
  },
];

export const MAILBOX_ENTRIES: ProviderEntry[] = [
  {
    // covers aspmx.l.google.com (workspace multi-host setups) and
    // gmail-smtp-in.l.google.com (gmail), plus their alt hosts
    match: "l.google.com",
    provider: "google mail infrastructure",
    category: "mailbox_capable",
    plus_tag_semantics: true,
    note: "covers gmail and google workspace custom domains",
  },
  {
    // current google workspace single-host mx (priority 1 smtp.google.com),
    // not covered by the l.google.com suffix above
    match: "smtp.google.com",
    provider: "google mail infrastructure",
    category: "mailbox_capable",
    plus_tag_semantics: true,
    note:
      "workspace domains can use the single-host mx smtp.google.com " +
      "(verified 2026-10-06: support.google.com/a/answer/174125)",
  },
  // consumer microsoft mail. exact hosts verified live 2026-10-04; they must
  // beat the generic protection.outlook.com gateway suffix below.
  {
    match: "outlook-com.olc.protection.outlook.com",
    provider: "outlook.com (consumer microsoft mail)",
    category: "mailbox_capable",
    plus_tag_semantics: true,
  },
  {
    match: "hotmail-com.olc.protection.outlook.com",
    provider: "hotmail.com (consumer microsoft mail)",
    category: "mailbox_capable",
    plus_tag_semantics: true,
  },
  {
    match: "messagingengine.com",
    provider: "fastmail",
    category: "mailbox_capable",
    plus_tag_semantics: true,
  }, // verified live 2026-10-04
  {
    match: "protonmail.com",
    provider: "proton mail",
    category: "mailbox_capable",
    plus_tag_semantics: true,
  },
  { match: "protonmail.ch", provider: "proton mail", category: "mailbox_capable", plus_tag_semantics: true }, // verified live 2026-10-04
  { match: "mail.icloud.com", provider: "icloud mail (apple)", category: "mailbox_capable" }, // verified live 2026-10-04
  { match: "mail.me.com", provider: "icloud mail (apple custom domains)", category: "mailbox_capable" },
  { match: "smtpin.zoho.com", provider: "zoho mail", category: "mailbox_capable" }, // verified live 2026-10-04
  { match: "smtpin.zoho.eu", provider: "zoho mail (eu)", category: "mailbox_capable" },
  { match: "smtpin.zoho.in", provider: "zoho mail (in)", category: "mailbox_capable" },
  { match: "mx.zoho.com", provider: "zoho mail (legacy)", category: "mailbox_capable" },
  { match: "mx.zohomail.com", provider: "zoho mail", category: "mailbox_capable" },
  { match: "yahoodns.net", provider: "yahoo mail infrastructure (yahoo, aol)", category: "mailbox_capable" }, // verified live 2026-10-04
  { match: "yandex.ru", provider: "yandex mail", category: "mailbox_capable" }, // verified live 2026-10-04
  { match: "yandex.net", provider: "yandex mail", category: "mailbox_capable" },
  { match: "yandex.com", provider: "yandex mail", category: "mailbox_capable" },
  { match: "gmx.net", provider: "gmx (united internet)", category: "mailbox_capable" }, // verified live 2026-10-04
  { match: "mx00.mail.com", provider: "mail.com (1&1)", category: "mailbox_capable" }, // verified live 2026-10-04
  { match: "mx01.mail.com", provider: "mail.com (1&1)", category: "mailbox_capable" },
  { match: "hey.com", provider: "hey", category: "mailbox_capable" }, // verified live 2026-10-04
  { match: "tutanota.de", provider: "tuta (tutanota)", category: "mailbox_capable" }, // verified live 2026-10-04
  { match: "tutanota.com", provider: "tuta (tutanota)", category: "mailbox_capable" },
  {
    match: "mx.rediffmail.rediff.akadns.net",
    provider: "rediffmail",
    category: "mailbox_capable",
  }, // verified live 2026-10-04
  { match: "qq.com", provider: "qq mail (tencent)", category: "mailbox_capable" }, // verified live 2026-10-04
  { match: "mxmail.netease.com", provider: "netease mail (163.com, 126.com)", category: "mailbox_capable" },
  { match: "hushmail.com", provider: "hushmail", category: "mailbox_capable" }, // verified live 2026-10-04
  { match: "mailfence.com", provider: "mailfence", category: "mailbox_capable" }, // verified live 2026-10-04
  { match: "posteo.de", provider: "posteo", category: "mailbox_capable" }, // verified live 2026-10-04
  { match: "runbox.com", provider: "runbox", category: "mailbox_capable" }, // verified live 2026-10-04
  {
    match: "spacemail.com",
    provider: "spacemail (spaceship)",
    category: "mailbox_capable",
    note:
      "spaceship's hosted mail product. spaceship's forwarding product does " +
      "not publish mx hosts in its knowledgebase (verified 2026-10-06); a " +
      "spaceship-forwarded domain reports as unknown infrastructure, and " +
      "that is the honest result until its forwarding hosts are verified",
  }, // verified live 2026-10-06: spaceship.com itself runs mx1/mx2.spacemail.com
];

// security gateways. a gateway relays to the final host; that is not
// forwarding-only infrastructure and not proof of a mailbox. tenant-hosted
// exchange online uses {tenant}.mail.protection.outlook.com; consumer
// outlook exact hosts above outrank this suffix.
export const GATEWAY_ENTRIES: ProviderEntry[] = [
  {
    match: "protection.outlook.com",
    provider: "microsoft exchange online protection",
    category: "gateway",
    note:
      "can front hosted mailboxes or on-premises servers; capability is not " +
      "established from routing alone",
  },
  {
    match: "pphosted.com",
    provider: "proofpoint",
    category: "gateway",
    note: "relays to the final host; the final arrangement stays unobserved",
  },
  {
    match: "mimecast.com",
    provider: "mimecast",
    category: "gateway",
    note: "relays to the final host; the final arrangement stays unobserved",
  },
  {
    match: "barracudanetworks.com",
    provider: "barracuda ess",
    category: "gateway",
    note: "relays to the final host; the final arrangement stays unobserved",
  },
  {
    match: "trendmicro.com",
    provider: "trend micro email security",
    category: "gateway",
    note: "relays to the final host; the final arrangement stays unobserved",
  },
];

const ALL_ENTRIES: ProviderEntry[] = [
  ...FORWARDING_ENTRIES,
  ...SHARED_INFRASTRUCTURE_ENTRIES,
  ...MAILBOX_ENTRIES,
  ...GATEWAY_ENTRIES,
];

// longest match wins, so exact hosts beat broader suffixes (consumer
// outlook vs the generic eop gateway, a specific provider vs its parent)
export function findProvider(host: string): ProviderEntry | undefined {
  const h = host.toLowerCase().trim().replace(/\.$/, "");
  let best: ProviderEntry | undefined;
  let bestLen = -1;
  for (const e of ALL_ENTRIES) {
    const m = e.match.toLowerCase();
    if (h === m || h.endsWith("." + m)) {
      if (m.length > bestLen) {
        best = e;
        bestLen = m.length;
      }
    }
  }
  return best;
}

// known relay/alias envelope domains. an address at one of these is a relay
// regardless of how professional the local part looks. sources: service
// docs and faqs; the authoritative current list for each service is its own
// dashboard/docs (maintenance item).
export const RELAY_DOMAINS: string[] = [
  "mozmail.com", // firefox relay
  "duck.com", // duckduckgo email protection
  "simplelogin.io", // simplelogin
  "simplelogin.co", // simplelogin
  "slmail.me", // simplelogin
  "8shield.net", // simplelogin
  "droidhx.com", // simplelogin (verify against dashboard)
  "pipemail.space", // simplelogin (confirmed via community list)
  "anonaddy.me", // addy.io
  "anonaddy.com", // addy.io
  "addy.io", // addy.io
  "33mail.com", // 33mail
  "inboxbear.com", // inboxbear (also in community list)
  "improvmx.com", // improvmx's own alias domain
];

// curated seed disposable list. the main disposable source is the generated
// community snapshot below; this seed stays for cases it should never miss.
export const DISPOSABLE_SEED: string[] = [
  "mailinator.com",
  "guerrillamail.com",
  "sharklasers.com",
  "grr.la",
  "yopmail.com",
  "temp-mail.org",
  "tempmail.com",
  "10minutemail.com",
  "maildrop.cc",
  "dispostable.com",
  "getnada.com",
  "trashmail.com",
  "mailnesia.com",
  "mohmal.com",
  "fakeinbox.com",
  "throwawaymail.com",
];

// community blocklist snapshot (cc0), generated by scripts/sync-disposable-list.mjs.
// not verified per-domain; its provenance and snapshot date travel with its
// signals and it goes stale with everything else.
export const DISPOSABLE_COMMUNITY: string[] = COMMUNITY_DISPOSABLE_DOMAINS;
export const DISPOSABLE_COMMUNITY_SNAPSHOT: string = COMMUNITY_LIST_SNAPSHOT;

export function domainMatchesList(domain: string, list: string[]): boolean {
  const d = domain.toLowerCase().trim().replace(/\.$/, "");
  return list.some((e) => d === e || d.endsWith("." + e));
}

// returns which disposable source matched, for provenance and staleness
export function findDisposableSource(
  domain: string
): { source: string; observedAt: string; detail: string } | undefined {
  if (domainMatchesList(domain, DISPOSABLE_SEED)) {
    return {
      source: `builtin-list/${PROVIDER_TABLE_VERSION}`,
      observedAt: PROVIDER_TABLE_AS_OF,
      detail: "domain matches the curated disposable seed list",
    };
  }
  if (domainMatchesList(domain, DISPOSABLE_COMMUNITY)) {
    return {
      source: `community-list/disposable-email-domains@${DISPOSABLE_COMMUNITY_SNAPSHOT}`,
      observedAt: DISPOSABLE_COMMUNITY_SNAPSHOT,
      detail:
        "domain matches the community disposable blocklist snapshot " +
        "(cc0, not verified per-domain)",
    };
  }
  return undefined;
}

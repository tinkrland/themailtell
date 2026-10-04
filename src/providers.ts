// providers.ts — intelligence tables.
// entries marked "verified" were confirmed against live dns on 2026-10-04.
// everything else needs verified research before production use; this is a
// seed plus a community snapshot, not a claim of coverage. matching is
// exact-host or dns-style suffix (host equals "example.com" or ends with
// ".example.com"), longest match wins.

import {
  COMMUNITY_DISPOSABLE_DOMAINS,
  COMMUNITY_LIST_SNAPSHOT,
} from "./generated/disposable-domains.js";

export type InfrastructureCategory =
  | "mailbox_capable"
  | "forwarding"
  | "gateway";

export interface ProviderEntry {
  // host or parent domain to match mx exchanges against
  match: string;
  provider: string;
  category: InfrastructureCategory;
  // forwarding and mailbox products share this infrastructure; per-address
  // arrangement cannot be distinguished from routing alone
  shared_infrastructure?: boolean;
  // this provider is known to treat a plus tag as a sub-address convention.
  // reported separately from raw syntax so the two facts never blur.
  plus_tag_semantics?: boolean;
  note?: string;
}

// forwarding-only services and registrar forwarding products. a custom domain
// pointing here is strong domain-level forwarding evidence.
export const FORWARDING_ENTRIES: ProviderEntry[] = [
  { match: "fwd1.porkbun.com", provider: "porkbun email forwarding", category: "forwarding" }, // verified: kb.porkbun.com
  { match: "fwd2.porkbun.com", provider: "porkbun email forwarding", category: "forwarding" }, // verified: kb.porkbun.com
  { match: "improvmx.com", provider: "improvmx", category: "forwarding" },
  { match: "forwardemail.net", provider: "forward email", category: "forwarding" },
  { match: "route1.mx.cloudflare.net", provider: "cloudflare email routing", category: "forwarding" },
  { match: "route2.mx.cloudflare.net", provider: "cloudflare email routing", category: "forwarding" },
  { match: "route3.mx.cloudflare.net", provider: "cloudflare email routing", category: "forwarding" },
  { match: "mx.mailbox.org", provider: "mailbox.org family products", category: "forwarding", shared_infrastructure: true },
];

export const MAILBOX_ENTRIES: ProviderEntry[] = [
  {
    // verified live: gmail-smtp-in.l.google.com and workspace aspmx hosts
    match: "l.google.com",
    provider: "google mail infrastructure",
    category: "mailbox_capable",
    plus_tag_semantics: true,
    note: "covers gmail and google workspace custom domains",
  },
  // consumer microsoft mail. exact hosts verified live; they must beat the
  // generic protection.outlook.com gateway suffix below (longest match wins).
  {
    match: "outlook-com.olc.protection.outlook.com",
    provider: "outlook.com (consumer microsoft mail)",
    category: "mailbox_capable",
    plus_tag_semantics: true,
  }, // verified live
  {
    match: "hotmail-com.olc.protection.outlook.com",
    provider: "hotmail.com (consumer microsoft mail)",
    category: "mailbox_capable",
    plus_tag_semantics: true,
  }, // verified live
  {
    match: "messagingengine.com",
    provider: "fastmail",
    category: "mailbox_capable",
    plus_tag_semantics: true,
  }, // verified live: in1-smtp.messagingengine.com
  {
    match: "protonmail.com",
    provider: "proton mail",
    category: "mailbox_capable",
    plus_tag_semantics: true,
  },
  { match: "protonmail.ch", provider: "proton mail", category: "mailbox_capable", plus_tag_semantics: true }, // verified live
  { match: "mail.icloud.com", provider: "icloud mail (apple)", category: "mailbox_capable" }, // verified live: mx01.mail.icloud.com
  { match: "mail.me.com", provider: "icloud mail (apple custom domains)", category: "mailbox_capable" },
  { match: "smtpin.zoho.com", provider: "zoho mail", category: "mailbox_capable" }, // verified live
  { match: "smtpin.zoho.eu", provider: "zoho mail (eu)", category: "mailbox_capable" },
  { match: "smtpin.zoho.in", provider: "zoho mail (in)", category: "mailbox_capable" },
  { match: "mx.zoho.com", provider: "zoho mail (legacy)", category: "mailbox_capable" },
  { match: "mx.zohomail.com", provider: "zoho mail", category: "mailbox_capable" },
  { match: "yahoodns.net", provider: "yahoo mail infrastructure (yahoo, aol)", category: "mailbox_capable" }, // verified live
  { match: "yandex.ru", provider: "yandex mail", category: "mailbox_capable" }, // verified live
  { match: "yandex.net", provider: "yandex mail", category: "mailbox_capable" },
  { match: "yandex.com", provider: "yandex mail", category: "mailbox_capable" },
  { match: "gmx.net", provider: "gmx (united internet)", category: "mailbox_capable" }, // verified live: mx00.gmx.net
  { match: "mx00.mail.com", provider: "mail.com (1&1)", category: "mailbox_capable" }, // verified live
  { match: "mx01.mail.com", provider: "mail.com (1&1)", category: "mailbox_capable" },
  { match: "hey.com", provider: "hey", category: "mailbox_capable" }, // verified live: home-mx.app.hey.com
  { match: "tutanota.de", provider: "tuta (tutanota)", category: "mailbox_capable" }, // verified live
  { match: "tutanota.com", provider: "tuta (tutanota)", category: "mailbox_capable" },
  {
    match: "mx.rediffmail.rediff.akadns.net",
    provider: "rediffmail",
    category: "mailbox_capable",
  }, // verified live (india)
  { match: "qq.com", provider: "qq mail (tencent)", category: "mailbox_capable" }, // verified live: mx1.qq.com
  { match: "mxmail.netease.com", provider: "netease mail (163.com, 126.com)", category: "mailbox_capable" },
  { match: "hushmail.com", provider: "hushmail", category: "mailbox_capable" }, // verified live
  { match: "mailfence.com", provider: "mailfence", category: "mailbox_capable" }, // verified live
  { match: "posteo.de", provider: "posteo", category: "mailbox_capable" }, // verified live
  { match: "runbox.com", provider: "runbox", category: "mailbox_capable" }, // verified live
  {
    match: "secureserver.net",
    provider: "godaddy mail infrastructure",
    category: "mailbox_capable",
    shared_infrastructure: true,
    note:
      "registrar hosted-mail and forwarding products have shared this " +
      "infrastructure; routing evidence cannot distinguish them per address",
  },
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

export const PROVIDER_TABLE_VERSION = "seed/0.2.0";

const ALL_ENTRIES: ProviderEntry[] = [
  ...FORWARDING_ENTRIES,
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
// not verified per-domain; its provenance travels with its signals.
export const DISPOSABLE_COMMUNITY: string[] = COMMUNITY_DISPOSABLE_DOMAINS;
export const DISPOSABLE_COMMUNITY_SNAPSHOT: string = COMMUNITY_LIST_SNAPSHOT;

export function domainMatchesList(domain: string, list: string[]): boolean {
  const d = domain.toLowerCase().trim().replace(/\.$/, "");
  return list.some((e) => d === e || d.endsWith("." + e));
}

// returns which disposable source matched, for provenance
export function findDisposableSource(
  domain: string
): { source: string; detail: string } | undefined {
  if (domainMatchesList(domain, DISPOSABLE_SEED)) {
    return {
      source: `builtin-list/${PROVIDER_TABLE_VERSION}`,
      detail: "domain matches the curated disposable seed list",
    };
  }
  if (domainMatchesList(domain, DISPOSABLE_COMMUNITY)) {
    return {
      source: `community-list/disposable-email-domains@${DISPOSABLE_COMMUNITY_SNAPSHOT}`,
      detail:
        "domain matches the community disposable blocklist snapshot " +
        "(cc0, not verified per-domain)",
    };
  }
  return undefined;
}

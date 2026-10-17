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
import type { EvidenceStrength } from "./schema.js";

export type InfrastructureCategory =
  | "mailbox_capable"
  | "forwarding"
  | "gateway"
  | "shared";

// the date this table's knowledge was last verified. derived signals carry
// this date as their observed_at so staleness applies to the knowledge,
// not to the moment of lookup.
export const PROVIDER_TABLE_AS_OF = "2026-10-08";
export const PROVIDER_TABLE_VERSION = "seed/0.4.0";

export interface ProviderEntry {
  // host or parent domain to match mx exchanges against
  match: string;
  provider: string;
  category: InfrastructureCategory;
  // this provider is known to treat a plus tag as a sub-address convention.
  // reported separately from raw syntax so the two facts never blur.
  plus_tag_semantics?: boolean;
  // this provider is known to ignore dots in local parts at delivery for at
  // least some of its address families. reported as declared semantics,
  // never applied as a rewrite.
  dots_ignored?: boolean;
  // declared local-part semantics beyond plus tags, emitted as a
  // local_part_semantics signal when the provider is matched.
  alias_semantics_note?: string;
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
  {
    match: "ovh.net",
    provider: "ovh mail infrastructure",
    category: "shared",
    note:
      "ovh sells hosted mailboxes (mx plans) and free email redirection " +
      "under the same infrastructure; per-address arrangement cannot be " +
      "established from routing alone (verified live 2026-10-08: ovh.com " +
      "serves mx1/mx2.ovh.net)",
  },
  {
    match: "gandi.net",
    provider: "gandi mail infrastructure",
    category: "shared",
    note:
      "gandi sells paid mailboxes and free mail forwarding under the same " +
      "infrastructure; per-address arrangement cannot be established from " +
      "routing alone (verified live 2026-10-08: gandi.net serves " +
      "mail8/mail12.gandi.net)",
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
    dots_ignored: true,
    note:
      "covers gmail and google workspace custom domains. dots are ignored " +
      "for @gmail.com/@googlemail.com addresses; on workspace custom " +
      "domains dot handling is organization-configured (verified: google " +
      "support, address 7436150). reported, never applied",
  },
  {
    // current google workspace single-host mx (priority 1 smtp.google.com),
    // not covered by the l.google.com suffix above
    match: "smtp.google.com",
    provider: "google mail infrastructure",
    category: "mailbox_capable",
    plus_tag_semantics: true,
    dots_ignored: true,
    note:
      "workspace domains can use the single-host mx smtp.google.com " +
      "(verified 2026-10-06: support.google.com/a/answer/174125); see the " +
      "l.google.com entry for dot semantics",
  },
  // consumer microsoft mail. exact hosts verified live 2026-10-04; they must
  // beat the generic protection.outlook.com gateway suffix below.
  {
    match: "outlook-com.olc.protection.outlook.com",
    provider: "outlook.com (consumer microsoft mail)",
    category: "mailbox_capable",
    plus_tag_semantics: true,
    alias_semantics_note:
      "consumer microsoft mail supports account-level alias addresses " +
      "(up to 10 per account, created in account settings) that share one " +
      "mailbox and carry no syntax marker; a plain local part can neither " +
      "confirm nor deny an alias arrangement. plus tags are sub-addresses " +
      "and dots are significant. reported, never applied",
  },
  {
    match: "hotmail-com.olc.protection.outlook.com",
    provider: "hotmail.com (consumer microsoft mail)",
    category: "mailbox_capable",
    plus_tag_semantics: true,
    alias_semantics_note:
      "consumer microsoft mail supports account-level alias addresses that " +
      "share one mailbox and carry no syntax marker; a plain local part can " +
      "neither confirm nor deny an alias arrangement. reported, never applied",
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
  {
    match: "yahoodns.net",
    provider: "yahoo mail infrastructure (yahoo, aol)",
    category: "mailbox_capable",
    note: "also fronts sky.com consumer mail (uk), verified live 2026-10-08",
  }, // verified live 2026-10-04
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
  {
    match: "migadu.com",
    provider: "migadu",
    category: "mailbox_capable",
    note:
      "customer domains use aspmx1/aspmx2/aspmx3.migadu.com per migadu's " +
      "setup guides; migadu.com itself serves mx.migadu.com (verified live " +
      "2026-10-08)",
  },
  { match: "purelymail.com", provider: "purelymail", category: "mailbox_capable" }, // verified live 2026-10-08: mailserver.purelymail.com
  {
    match: "mxrouting.net",
    provider: "mxroute",
    category: "mailbox_capable",
    note:
      "customer domains get per-account subdomains of mxrouting.net " +
      "(verified live 2026-10-08: mxroute.com itself serves " +
      "arrow.mxrouting.net)",
  },
  {
    match: "1and1.com",
    provider: "ionos/1&1 mail infrastructure",
    category: "mailbox_capable",
    note:
      "current ionos and 1&1 brand domains (ionos.de, 1und1.de, " +
      "kundenserver.de, perfora.net, schlund.de) all serve " +
      "mxint01/mxint02.1and1.com (verified live 2026-10-08)",
  },
  {
    match: "kundenserver.de",
    provider: "ionos/1&1 mail infrastructure (legacy customer hosts)",
    category: "mailbox_capable",
    note:
      "the classic 1&1 customer exchange hostnames (mx00/mx01.kundenserver.de); " +
      "brand family verified live 2026-10-08",
  },
  {
    match: "perfora.net",
    provider: "ionos/1&1 mail infrastructure (legacy customer hosts)",
    category: "mailbox_capable",
    note: "the schlund/partner-era customer exchange hostnames; brand " +
      "family verified live 2026-10-08",
  },
  {
    match: "one.com",
    provider: "one.com mail infrastructure",
    category: "mailbox_capable",
    note: "hosted mail pods like mx1..4.pub.mailpod12-cph3.one.com (verified live 2026-10-08)",
  },
  {
    match: "hostinger.com",
    provider: "hostinger mail infrastructure",
    category: "mailbox_capable",
    note:
      "hostinger email serves mx1.hostinger.com (prio 5) and " +
      "mx2.hostinger.com (prio 10) per hostinger's support docs; " +
      "hostinger.com itself runs google workspace and cannot serve as the " +
      "live check (docs-verified 2026-10-08)",
  },
  {
    match: "mx.bt.prod.cloud.openwave.ai",
    provider: "bt mail infrastructure (btinternet)",
    category: "mailbox_capable",
    note: "bt consumer mail moved to the openwave cloud platform (verified live 2026-10-08)",
  },
  {
    match: "atmailcloud.com",
    provider: "atmail hosted platform",
    category: "mailbox_capable",
    note:
      "the atmail hosted mail platform fronts virgin media (uk/eu-west), " +
      "iinet and optusnet (au/au-east) consumer mail (verified live " +
      "2026-10-08)",
  },
  {
    match: "oxcs.net",
    provider: "open-xchange consumer mail platform",
    category: "mailbox_capable",
    note: "fronts talktalk.net consumer mail (verified live 2026-10-08)",
  },
  { match: "laposte.net", provider: "laposte.net (la poste, fr)", category: "mailbox_capable" }, // verified live 2026-10-08
  { match: "orange.fr", provider: "orange.fr (fr)", category: "mailbox_capable" }, // verified live 2026-10-08: smtp-in.orange.fr
  { match: "sfr.fr", provider: "sfr.fr (fr)", category: "mailbox_capable" }, // verified live 2026-10-08: smtp-in.sfr.fr
  { match: "free.fr", provider: "free.fr (fr)", category: "mailbox_capable" }, // verified live 2026-10-08: mx1/mx2.free.fr
  { match: "web.de", provider: "web.de (de)", category: "mailbox_capable" }, // verified live 2026-10-08: mx-ha02/03.web.de
  { match: "t-online.de", provider: "t-online.de (de)", category: "mailbox_capable" }, // verified live 2026-10-08: mx00..03.t-online.de
  { match: "freenet.de", provider: "freenet.de (de)", category: "mailbox_capable" }, // verified live 2026-10-08
  { match: "libero.it", provider: "libero.it (it)", category: "mailbox_capable" }, // verified live 2026-10-08: smtp-in.libero.it
  { match: "virgilio.it", provider: "virgilio.it (it)", category: "mailbox_capable" }, // verified live 2026-10-08: smtp-in.virgilio.it
  { match: "tiscali.it", provider: "tiscali.it (it)", category: "mailbox_capable" }, // verified live 2026-10-08: etb/imp.mail.tiscali.it
  { match: "ziggo.nl", provider: "ziggo.nl consumer mail (nl)", category: "mailbox_capable" }, // verified live 2026-10-08: mxin5/10.ziggo.nl
  { match: "kpnmail.nl", provider: "kpnmail.nl consumer mail (nl)", category: "mailbox_capable" }, // verified live 2026-10-08: mx.kpnmail.nl
  { match: "telenet-ops.be", provider: "telenet.be consumer mail (be)", category: "mailbox_capable" }, // verified live 2026-10-08: mx1/2.telenet-ops.be
  { match: "bigpond.com", provider: "bigpond/telstra consumer mail (au)", category: "mailbox_capable" }, // verified live 2026-10-08: extmail.bigpond.com
  {
    match: "smxcloud.com",
    provider: "smx platform",
    category: "mailbox_capable",
    note: "fronts xtra.co.nz (spark nz) consumer mail (verified live 2026-10-08)",
  },
  {
    match: "cloudfilter.net",
    provider: "cloudfilter platform",
    category: "mailbox_capable",
    note: "fronts eircom.net (eir, ie) consumer mail (verified live 2026-10-08)",
  },
  { match: "mail.telia.com", provider: "telia consumer mail (se)", category: "mailbox_capable" }, // verified live 2026-10-08
  {
    match: "norlys.dk",
    provider: "norlys consumer mail (stofa, dk)",
    category: "mailbox_capable",
    note: "stofa.dk merged into norlys; mx10/20.norlys.dk (verified live 2026-10-08)",
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
    note:
      "relays to the final host; the final arrangement stays unobserved. " +
      "seen fronting yousee.dk consumer mail, verified live 2026-10-08: " +
      "yousee's own mx is mxa/mxb-00360101.gslb.pphosted.com, so yousee " +
      "addresses report as gateway, which is the honest routing answer",
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
//
// apple, verified against the developer news (see research/sources/):
// - sign in with apple legacy addresses stay at privaterelay.appleid.com and
//   keep working (apple developer news update, 2026-08-24)
// - new sign in with apple addresses move to private.icloud.com
//   (rollout "later this year" as of that announcement)
// - icloud+ hide my email addresses stay at icloud.com after apple reversed
//   the unification plan following user feedback. icloud.com is shared with
//   real icloud mailboxes, so icloud.com can never be classified as a relay
//   domain from domain evidence; that case is documented as uncovered in
//   the readme instead of being guessed at here.
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
  "privaterelay.appleid.com", // apple sign in with apple relay (legacy, active)
  "private.icloud.com", // apple sign in with apple relay (new addresses)
];

// spf include tokens published by forwarding services for their customers'
// domains. send-path configuration evidence only: an include authorizes
// the service's servers to send for the domain, which is typical for a
// forwarding setup but is never proof of a current forwarding arrangement.
// kept separate from mx-based forwarding evidence, never flattened into it.
export const SPF_FORWARDING_INCLUDES: Array<{ token: string; provider: string; note?: string }> = [
  {
    token: "spf.improvmx.com",
    provider: "improvmx",
    note: "verified 2026-10-08: improvmx guide (combining spf records)",
  },
  {
    token: "spf.forwardemail.net",
    provider: "forward email",
    note: "verified 2026-10-08: forward email faq setup records",
  },
  {
    token: "_spf.mx.cloudflare.net",
    provider: "cloudflare email routing",
    note:
      "verified 2026-10-08: cloudflare email service postmaster docs state " +
      "email routing configures this include on the root domain",
  },
];

// dkim selector conventions used by forwarding services on their customers'
// domains. presence of a selector here means the service publishes signing
// keys for the domain: send-path evidence, not a current-arrangement proof.
export const DKIM_FORWARDING_SELECTORS: Array<{ selector: string; provider: string; note?: string }> = [
  {
    selector: "dkimprovmx1",
    provider: "improvmx",
    note: "verified 2026-10-08: improvmx guide (adding dkim records)",
  },
  {
    selector: "dkimprovmx2",
    provider: "improvmx",
    note: "verified 2026-10-08: improvmx guide (adding dkim records)",
  },
  // forward email's dkim selector is not published in their faq; unverified,
  // deliberately not added (recorded as a gap, not guessed).
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
// signals and it goes stale with everything else. two failure modes are
// documented in the sync script and readme: stale entries (domains change
// hands; a former disposable domain can be a legitimate business today) and
// detection lag (new disposable domains appear faster than snapshots update).
export const DISPOSABLE_COMMUNITY: string[] = COMMUNITY_DISPOSABLE_DOMAINS;
export const DISPOSABLE_COMMUNITY_SNAPSHOT: string = COMMUNITY_LIST_SNAPSHOT;

export function domainMatchesList(domain: string, list: string[]): boolean {
  const d = domain.toLowerCase().trim().replace(/\.$/, "");
  return list.some((e) => d === e || d.endsWith("." + e));
}

// system-minted account domains: providers whose accounts a system
// created, not a person. two flavors so far: session-minted lab
// accounts, real full accounts that receive mail, sign in with the
// provider's own sso, and are deleted when the session that granted
// them ends; and auto-created shadow accounts, which a provider
// provisioned in the background and whose owner may not even know
// they exist. an sso gate passes in both cases, which is exactly why
// gates that read oauth as a trust indicator miss the class. the
// disposable lists do not carry these domains either. provenance is
// per row: verified_on is the date the citations were read, and
// owner-reported facts are marked as such.
export interface SystemMintedAccountEntry {
  // host or parent domain of the account addresses
  match: string;
  provider: string;
  // what mints the accounts, what they can do, and when they die
  note: string;
  // the signal detail this row emits; the honest counter per class
  signal_detail: string;
  citations: string;
  // the date the citations were read
  verified_on: string;
  // rows whose domain cannot isolate the class emit suggestive instead.
  // recognized is the default: the class fact is established at the domain.
  signal_strength?: EvidenceStrength;
}

export const SYSTEM_MINTED_ACCOUNT_ENTRIES: SystemMintedAccountEntry[] = [
  {
    match: "qwiklabs.net",
    provider: "google skills (qwiklabs) lab account",
    note:
      "every lab start mints a fresh student-xx-xxxxxx@qwiklabs.net " +
      "google account, real while the lab runs: it signs into the " +
      "cloud console, and gmail labs grant it a gmail inbox for the " +
      "duration. it is a full google account, so sign-in-with-google " +
      "on a third-party site completes normally: owner-reported, " +
      "confirmed first-hand 2026-10-17, including the owner's actual " +
      "use for it, satisfying gates that demand connecting a google " +
      "calendar without exposing the real account. most gates read " +
      "an oauth pass as a trust indicator and miss the class " +
      "entirely, because the domain is also on no public disposable " +
      "list. when the lab timer ends the account and its project " +
      "are deleted, and mail sent to the address stops existing; the " +
      "deletion on lab end is the provider's own documentation. " +
      "supply routes are wider than skills.google alone: coursera " +
      "and pluralsight deliver their google cloud labs through " +
      "embedded qwiklabs, so the same student accounts mint from " +
      "those platforms too",
    signal_detail:
      "google skills (qwiklabs) lab account: accounts on this domain " +
      "are minted per session and deleted when the session ends. " +
      "while they live they are full google accounts that complete " +
      "sign-in-with-google, so an oauth pass here is never an " +
      "ownership or age bound",
    citations:
      "https://www.skills.google/focuses/2794?parent=catalog (make " +
      "sure to use the student-xx-xxxxxx@qwiklabs.net email to sign " +
      "in; the temporary project and everything it contains gets " +
      "deleted when the lab ends), " +
      "https://support.google.com/qwiklabs/answer/9134811 (temporary " +
      "credentials are created after start lab), " +
      "https://www.skills.google/focuses/5825?parent=catalog (gmail " +
      "labs give new temporary credentials that access gmail for the " +
      "duration of the lab), " +
      "https://support.google.com/qwiklabs/answer/16918189 (run labs " +
      "in incognito to prevent conflicts between your personal " +
      "account and your temporary student account), " +
      "https://help.pluralsight.com/help/learn-google-cloud-with-qwiklabs " +
      "(pluralsight's google cloud labs run on embedded qwiklabs), " +
      "https://www.coursera.support/s/article/learner-000001503 " +
      "(coursera's google cloud assignments use qwiklabs)",
    verified_on: "2026-10-17",
  },
  {
    match: "gtempaccount.com",
    provider: "google shadow account",
    note:
      "created automatically by google, not chosen by a person: when " +
      "a google workspace share or invite reached a personal " +
      "non-google address, google provisioned a full google account " +
      "at @gtempaccount.com tied to that address, and the owner may " +
      "not know the account exists. university it desks document the " +
      "class and the confusion it causes: sign-in warnings for " +
      "accounts users never created, with the original address " +
      "percent-encoded into the local part. unlike the qwiklabs " +
      "member this class is not ephemeral: the account persists " +
      "until the user converts or deletes it, so the class fact is " +
      "provenance, not lifetime. a system-created account completes " +
      "sign-in-with-google like any google account. google's own " +
      "documentation of the mechanism is sparse; the citations are " +
      "university google workspace knowledge bases",
    signal_detail:
      "google shadow account: accounts on this domain were " +
      "auto-created by google when a workspace share hit a " +
      "non-google address, and the owner may not know the account " +
      "exists. they are persistent full google accounts that " +
      "complete sign-in-with-google, so an oauth pass here is never " +
      "an ownership or age bound",
    citations:
      "https://ithelp.brown.edu/kb/articles/warning-notices-about-gtempaccounts " +
      "(sign-in warnings about @gtempaccount.com accounts users did " +
      "not create, updated 2021-07-09), " +
      "https://services.udel.edu/TDClient/32/Portal/KB/ArticleDet?ID=277 " +
      "(conflicting gtemp accounts are independent of the workspace " +
      "account; delete or associate them), " +
      "https://it.lbl.gov/googles-critical-security-alert-email/ " +
      "(gtempaccount sign-in alerts explained)",
    verified_on: "2026-10-17",
  },
  {
    match: "onmicrosoft.com",
    provider: "entra initial domain (suggestive: class cannot be isolated)",
    note:
      "why this row is suggestive while the members above are recognized: " +
      "the suffix onmicrosoft.com is assigned by microsoft entra itself to " +
      "every tenant, durable corporate tenants and disposable training " +
      "tenants alike, so the domain alone cannot establish which one an " +
      "address belongs to. the documented disposable sub-class is " +
      "microsoft worldwide learning training tenants: official " +
      "instructor-led courses issue a full microsoft 365 e5 trial tenant " +
      "per class, and the terms of use in the course lab instructions " +
      "state the tenant cannot be used or accessed after the class is " +
      "over, is not eligible for extension, must not be converted to a " +
      "paid subscription, and remains the property of microsoft. lab " +
      "login is the global administrator account provided for the lab. " +
      "the lab host's student guide (helix by xtremelabs, the moc " +
      "hosted lab environment) documents the credential lifetimes: " +
      "cloud credentials are assigned for the duration of the lab " +
      "session and the cloud resources are torn down and deleted when " +
      "the session ends, while an office 365 or dynamics 365 tenant " +
      "credential expires 14 to 25 days from the date it is assigned, " +
      "so the tenant can outlive the class itself " +
      "tenant names vary per class, so no narrower match is possible. " +
      "whether a training-tenant user completes a third-party " +
      "work-or-school sign-in depends on the relying party: the v2 " +
      "common authority accepts work and school accounts from any tenant. " +
      "microsoft learn sandboxes are a different mechanism and not a " +
      "member: the sandbox activates a temporary azure subscription on " +
      "the learner's own account, minting no new identity. azure devops " +
      "demo generator and azuredevopslabs.com also use your own account",
    signal_detail:
      "entra initial domain: every microsoft entra tenant has a " +
      "name.onmicrosoft.com address domain and most tenants are durable " +
      "corporate identities, so the domain alone cannot establish the " +
      "class. one documented disposable sub-class is microsoft's " +
      "training tenants, deleted after the class. an address on this " +
      "suffix is unusual and worth a look, never a verdict",
    signal_strength: "suggestive",
    citations:
      "https://raw.githubusercontent.com/MicrosoftLearning/SC-300-Identity-and-Access-Administrator/master/Instructions/Labs/Lab_01_ManageUserRoles.md " +
      "(WWL tenants terms of use: trial tenant, cannot be used or " +
      "accessed after the class is over, not eligible for extension, " +
      "must not be converted to a paid subscription, remain the " +
      "property of microsoft; sign in using the global administrator " +
      "account provided for this lab), " +
      "https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols " +
      "(the common authority accepts work and school accounts from any " +
      "tenant), " +
      "https://learn.microsoft.com/en-us/training/modules/accounting-distributions-invoice-validation-dyn365-finance-ops-pro-erp/ " +
      "(microsoft learn labs that cannot be signed into with a personal " +
      "account use hosted lab tenants), " +
      "https://learn.microsoft.com/en-us/answers/questions/5775291/ " +
      "(microsoft learn sandbox runs on the learner's own account), " +
      "https://labs.xtremelabs.io/LabManuals/Guides/Self-ServiceStudentGuidetoXLabs_HTML5.pdf " +
      "(cloud credentials assigned for the duration of the lab session, " +
      "cloud resources torn down and deleted when the session ends; " +
      "o365 and d365 tenant credentials expire 14 to 25 days from " +
      "assignment), " +
      "https://labs.xtremelabs.io/Account/FAQ " +
      "(helix by xtremelabs is the microsoft official courseware " +
      "hosted lab environment)",
    verified_on: "2026-10-17",
  },
];

// returns the system-minted account entry a domain belongs to, longest
// suffix match wins, same convention as the mx entry lookup
export function findSystemMintedAccount(
  domain: string
): SystemMintedAccountEntry | undefined {
  const h = domain.toLowerCase().trim().replace(/\.$/, "");
  let best: SystemMintedAccountEntry | undefined;
  let bestLen = -1;
  for (const e of SYSTEM_MINTED_ACCOUNT_ENTRIES) {
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

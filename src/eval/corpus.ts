// eval/corpus.ts — the evaluation corpus harness.
// the contract wants authorized test addresses with known arrangements and
// contrasting cases on the same provider, so success cannot be explained by
// recognizing a brand.
//
// honest limitation: these seed cases use fixture evidence (recorded mx
// sets) written by the same author as the provider tables, so they can
// only prove internal consistency — fixtures agree with the tables by
// construction. the errors that matter (like a shared-infrastructure
// service being filed as forwarding, or a provider whose products changed)
// are exactly the ones only real, authorized addresses with verified
// arrangements can expose. put those in data/authorized-corpus.json
// (gitignored) and the runner merges them automatically.

import type { Evidence } from "../core.js";

export interface Expectation {
  // signals that must be present at recognized strength
  expect_signals?: string[];
  // signals that must be present at any strength
  expect_signals_any_strength?: string[];
  // signals that must NOT be present at any strength
  forbid_signals?: string[];
  // the required aggregate state
  expect_state?: string;
  // limitations that must be mentioned (substring match)
  expect_limitation?: string;
}

export interface CorpusCase {
  id: string;
  // the known ground-truth arrangement
  arrangement: string;
  // scope the evidence should be resolvable at
  scope: "address" | "domain" | "provider_infrastructure";
  // fixture evidence: recorded mx records, declared errors, or adapter output
  evidence: Evidence;
  expectations: Expectation;
}

const T0 = "2026-10-08T00:00:00Z";

function ev(address: string, mx?: Array<[string, number]>, dnsError?: string): Evidence {
  return {
    address,
    mx_records: mx?.map(([exchange, priority]) => ({ exchange, priority })),
    dns_error: dnsError,
    observed_at: T0,
  };
}

export const CORPUS: CorpusCase[] = [
  {
    id: "free-mailbox",
    arrangement: "dedicated mailbox at free provider",
    scope: "provider_infrastructure",
    evidence: ev("someone@gmail.com", [
      ["aspmx.l.google.com", 5],
      ["alt1.aspmx.l.google.com", 10],
    ]),
    expectations: {
      expect_signals: ["mailbox_capable_infrastructure"],
      forbid_signals: ["forwarding_infrastructure", "disposable_service", "masking_relay_service"],
      expect_state: "signals_present",
    },
  },
  {
    id: "gmail-plus-alias",
    arrangement: "plus-tag alias at a mailbox provider",
    scope: "address",
    evidence: ev("someone+shopping@gmail.com", [
      ["aspmx.l.google.com", 5],
    ]),
    expectations: {
      expect_signals: [
        "alias_syntax", // syntax fact, address scope
      ],
      forbid_signals: ["forwarding_infrastructure"],
      expect_state: "signals_present",
      expect_limitation: "not this address's storage arrangement",
    },
  },
  {
    id: "custom-domain-porkbun-forwarding",
    arrangement: "custom domain using registrar forwarding, no own mailbox",
    scope: "domain",
    evidence: ev("hello@example-shop.com", [
      ["fwd1.porkbun.com", 10],
      ["fwd2.porkbun.com", 20],
    ]),
    expectations: {
      expect_signals: ["forwarding_infrastructure"],
      forbid_signals: ["disposable_service", "mailbox_capable_infrastructure"],
      expect_state: "signals_present",
      expect_limitation: "private destination mailbox is not and will not be discovered",
    },
  },
  {
    id: "custom-domain-same-registrar-hosted-mailbox",
    arrangement: "custom domain registered at same registrar, hosted mailboxes",
    // contrast pair with custom-domain-porkbun-forwarding: same kind of
    // registrar-registered custom domain, different mail arrangement, so
    // the pass cannot come from recognizing the registrar
    scope: "provider_infrastructure",
    evidence: ev("hello@example-shop.com", [
      ["aspmx.l.google.com", 1],
      ["alt1.aspmx.l.google.com", 5],
    ]),
    expectations: {
      expect_signals: ["mailbox_capable_infrastructure"],
      forbid_signals: ["forwarding_infrastructure"],
      expect_state: "signals_present",
    },
  },
  {
    id: "custom-domain-forwarding-service",
    arrangement: "custom domain pointed at a known forwarding-only service",
    scope: "domain",
    evidence: ev("contact@example-idea.dev", [
      ["mx1.improvmx.com", 10],
      ["mx2.improvmx.com", 20],
    ]),
    expectations: {
      expect_signals: ["forwarding_infrastructure"],
      forbid_signals: ["disposable_service"],
      expect_state: "signals_present",
    },
  },
  {
    id: "masked-relay-custom-domain",
    arrangement: "known masked relay, custom-domain relay configuration",
    scope: "domain",
    evidence: ev("abc123.you.abcdf3e@mozmail.com", [
      ["relay.mozmail.com", 10],
    ]),
    expectations: {
      expect_signals: ["masking_relay_service"],
      expect_state: "signals_present",
    },
  },
  {
    id: "disposable-known",
    arrangement: "known temporary/disposable service",
    scope: "domain",
    evidence: ev("throwaway@mailinator.com"),
    expectations: {
      expect_signals: ["disposable_service"],
      expect_state: "signals_present",
    },
  },
  {
    id: "mixed-routing",
    arrangement: "mixed mail infrastructure",
    scope: "provider_infrastructure",
    evidence: ev("ops@example-mixed.co", [
      ["fwd1.porkbun.com", 10],
      ["aspmx.l.google.com", 20],
    ]),
    expectations: {
      expect_signals: ["forwarding_infrastructure", "mailbox_capable_infrastructure"],
      expect_state: "mixed_routing",
    },
  },
  {
    id: "contradictory-evidence",
    arrangement: "domain list says disposable, routing says mailbox-capable",
    scope: "domain",
    evidence: ev("x@mailinator.com", [
      ["aspmx.l.google.com", 1],
    ]),
    expectations: {
      expect_signals: ["disposable_service", "mailbox_capable_infrastructure"],
      expect_state: "contradictory",
    },
  },
  {
    id: "security-gateway",
    arrangement: "security gateway in front of the final host",
    scope: "provider_infrastructure",
    evidence: ev("person@example-corp.de", [
      ["mx1.pphosted.com", 10],
      ["mx2.pphosted.com", 20],
    ]),
    expectations: {
      expect_signals: ["gateway_infrastructure"],
      forbid_signals: ["forwarding_infrastructure"],
      expect_state: "signals_present",
      expect_limitation: "not classified as forwarding-only",
    },
  },
  {
    id: "shared-infrastructure-registrar",
    arrangement: "registrar mail infrastructure shared by forwarding and hosting",
    scope: "provider_infrastructure",
    evidence: ev("person@example-biz.net", [
      ["mailstore1.secureserver.net", 10],
      ["smtp.secureserver.net", 20],
    ]),
    expectations: {
      // shared infrastructure makes no arrangement claim in either
      // direction: not "hosts inboxes", not "forwarding-only"
      expect_signals: ["shared_mail_infrastructure"],
      forbid_signals: ["forwarding_infrastructure", "mailbox_capable_infrastructure"],
      expect_state: "signals_present",
      expect_limitation: "no per-address arrangement is claimed",
    },
  },
  {
    id: "plus-literal-unknown-provider",
    arrangement: "plus sign that may be a literal character, unknown semantics",
    scope: "address",
    evidence: ev("user+literal@example-unknown.xyz", [
      ["mail.example-unknown.xyz", 10],
    ]),
    expectations: {
      // syntax evidence is suggestive by design; no recognized claim is made
      expect_signals_any_strength: ["alias_syntax"],
      forbid_signals: ["forwarding_infrastructure", "masking_relay_service"],
      expect_state: "signals_present",
      expect_limitation: "provider alias semantics unknown",
    },
  },
  {
    id: "missing-mx",
    arrangement: "no mx records at all",
    scope: "domain",
    evidence: ev("user@example-nomx.net", []),
    expectations: {
      expect_state: "unknown",
    },
  },
  {
    id: "dns-timeout",
    arrangement: "dns timeout / resolver failure",
    scope: "domain",
    evidence: ev("user@example-slow.net", undefined, "mx lookup failed (timeout)"),
    expectations: {
      expect_state: "unknown",
      expect_limitation: "unknown rather than assumed",
    },
  },
  {
    id: "unknown-host",
    arrangement: "self-hosted or unrecognized infrastructure",
    scope: "provider_infrastructure",
    evidence: ev("root@example-selfhost.io", [
      ["mail.example-selfhost.io", 10],
    ]),
    expectations: {
      expect_state: "unknown",
      expect_limitation: "no infrastructure category is claimed",
    },
  },
  {
    id: "google-workspace-single-host-mx",
    arrangement: "google workspace using the single-host mx smtp.google.com",
    scope: "provider_infrastructure",
    evidence: ev("hello@example-workspace.com", [
      ["smtp.google.com", 1],
    ]),
    expectations: {
      expect_signals: ["mailbox_capable_infrastructure"],
      forbid_signals: ["forwarding_infrastructure", "gateway_infrastructure"],
      expect_state: "signals_present",
    },
  },
  {
    id: "spacemail-hosted",
    arrangement: "custom domain on spaceship's spacemail hosted product",
    scope: "provider_infrastructure",
    evidence: ev("hello@example-spaceship.dev", [
      ["mx1.spacemail.com", 0],
      ["mx2.spacemail.com", 0],
    ]),
    expectations: {
      expect_signals: ["mailbox_capable_infrastructure"],
      forbid_signals: ["forwarding_infrastructure"],
      expect_state: "signals_present",
    },
  },
  {
    id: "apple-siwa-relay-legacy",
    arrangement: "sign in with apple relay address on the legacy domain",
    scope: "domain",
    evidence: ev("xp6g2f7x4f@privaterelay.appleid.com"),
    expectations: {
      expect_signals: ["masking_relay_service"],
      expect_state: "signals_present",
    },
  },
  {
    id: "apple-siwa-relay-new-domain",
    arrangement: "sign in with apple relay address on the new unified domain",
    scope: "domain",
    evidence: ev("ab12cd34ef@private.icloud.com", [
      ["mx01.mail.icloud.com", 10],
    ]),
    expectations: {
      expect_signals: ["masking_relay_service"],
      expect_state: "signals_present",
    },
  },
  {
    id: "hide-my-email-at-icloud-is-not-classifiable",
    arrangement: "icloud+ hide my email alias shares icloud.com with real mailboxes",
    scope: "domain",
    evidence: ev("someone@icloud.com", [
      ["mx01.mail.icloud.com", 10],
    ]),
    expectations: {
      // the honest uncovered case: icloud.com hosts both real mailboxes and
      // hide my email aliases, so domain evidence must not claim relay here.
      // consumers needing that distinction need an oauth-shaped route.
      expect_signals: ["mailbox_capable_infrastructure"],
      forbid_signals: ["masking_relay_service"],
      expect_state: "signals_present",
    },
  },
  {
    id: "spf-include-forwarding-no-mx-match",
    arrangement: "custom domain with a forwarding service's spf include and unrecognized mx",
    scope: "domain",
    evidence: {
      address: "hello@example-spaceship-forwarded.dev",
      mx_records: [{ exchange: "mx.example-spaceship-forwarded.dev", priority: 10 }],
      secondary_evidence: {
        txt_records: ["v=spf1 include:spf.improvmx.com ~all"],
      },
      observed_at: T0,
    },
    expectations: {
      // send-path evidence is its own signal; it must never become the
      // mx-based forwarding signal
      expect_signals: ["spf_forwarding_include"],
      forbid_signals: ["forwarding_infrastructure"],
      expect_state: "signals_present",
      expect_limitation: "not proof of a current forwarding arrangement",
    },
  },
  {
    id: "dkim-selector-forwarding",
    arrangement: "custom domain with a forwarding service's dkim selector",
    scope: "domain",
    evidence: {
      address: "contact@example-idea.dev",
      mx_records: [{ exchange: "mx.example-idea.dev", priority: 10 }],
      secondary_evidence: {
        domainkey_records: [
          { selector: "dkimprovmx1", value: "v=DKIM1; k=rsa; p=MIGf..." },
        ],
      },
      observed_at: T0,
    },
    expectations: {
      expect_signals: ["dkim_forwarder_selector"],
      forbid_signals: ["forwarding_infrastructure"],
      expect_state: "signals_present",
    },
  },
  {
    id: "hosted-domain-mta-sts-autodiscover",
    arrangement: "self-hosted mail with mta-sts and autodiscover present",
    scope: "domain",
    evidence: {
      address: "ops@example-selfhost.io",
      mx_records: [{ exchange: "mail.example-selfhost.io", priority: 10 }],
      secondary_evidence: {
        mta_sts_policy: "version: STSv1; mode: enforce; mx: mail.example-selfhost.io",
        autodiscover_srv: true,
      },
      observed_at: T0,
    },
    expectations: {
      // presence-only evidence is suggestive and claims no arrangement
      expect_signals_any_strength: ["mta_sts_policy_present", "autodiscover_present"],
      forbid_signals: ["mailbox_capable_infrastructure", "forwarding_infrastructure"],
      expect_state: "signals_present",
    },
  },
  {
    id: "migadu-hosted-custom-domain",
    arrangement: "custom domain hosted at migadu",
    scope: "provider_infrastructure",
    evidence: ev("hello@example-migadu.org", [
      ["aspmx1.migadu.com", 10],
      ["aspmx2.migadu.com", 20],
      ["aspmx3.migadu.com", 20],
    ]),
    expectations: {
      expect_signals: ["mailbox_capable_infrastructure"],
      forbid_signals: ["forwarding_infrastructure"],
      expect_state: "signals_present",
    },
  },
  {
    id: "ionos-legacy-customer-hosts",
    arrangement: "custom domain on ionos/1&1 legacy customer hosts",
    scope: "provider_infrastructure",
    evidence: ev("kontakt@example-shop.de", [
      ["mx00.kundenserver.de", 10],
      ["mx01.kundenserver.de", 10],
    ]),
    expectations: {
      expect_signals: ["mailbox_capable_infrastructure"],
      forbid_signals: ["forwarding_infrastructure"],
      expect_state: "signals_present",
    },
  },
  {
    id: "ovh-shared-mail-infrastructure",
    arrangement: "custom domain at ovh, whose mailbox and redirection products share infra",
    scope: "provider_infrastructure",
    evidence: ev("contact@example-ovh.fr", [
      ["mx1.ovh.net", 1],
      ["mx2.ovh.net", 5],
    ]),
    expectations: {
      expect_signals: ["shared_mail_infrastructure"],
      forbid_signals: ["forwarding_infrastructure", "mailbox_capable_infrastructure"],
      expect_state: "signals_present",
    },
  },
  {
    id: "consumer-isp-webde",
    arrangement: "consumer isp mailbox (web.de)",
    scope: "provider_infrastructure",
    evidence: ev("user@web.de", [
      ["mx-ha02.web.de", 100],
      ["mx-ha03.web.de", 100],
    ]),
    expectations: {
      expect_signals: ["mailbox_capable_infrastructure"],
      forbid_signals: ["forwarding_infrastructure"],
      expect_state: "signals_present",
    },
  },
  {
    id: "gmail-dot-semantics-reported-not-applied",
    arrangement: "dotted local part at gmail, where dots are ignored at delivery",
    scope: "provider_infrastructure",
    evidence: ev("j.o.h.n.doe@gmail.com", [
      ["gmail-smtp-in.l.google.com", 5],
    ]),
    expectations: {
      expect_signals: ["local_part_semantics", "mailbox_capable_infrastructure"],
      forbid_signals: ["forwarding_infrastructure"],
      expect_state: "signals_present",
      expect_limitation: "the address is never rewritten",
    },
  },
  {
    id: "outlook-alias-product-semantics",
    arrangement: "plain local part at consumer microsoft mail, which supports account aliases",
    scope: "provider_infrastructure",
    evidence: ev("plainuser@outlook.com", [
      ["outlook-com.olc.protection.outlook.com", 0],
    ]),
    expectations: {
      expect_signals: ["local_part_semantics", "mailbox_capable_infrastructure"],
      expect_state: "signals_present",
    },
  },
];

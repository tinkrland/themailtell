// eval/corpus.ts — the evaluation corpus harness.
// the contract wants authorized test addresses with known arrangements and
// contrasting cases on the same provider, so success cannot be explained by
// recognizing a brand. these seed cases use fixture evidence (recorded mx
// sets) so the harness runs offline and deterministically; replace them
// with your own authorized, verified addresses and live lookups as you
// build the real corpus.

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

const T0 = "2026-10-04T00:00:00Z";

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
      expect_signals: ["mailbox_capable_infrastructure"],
      expect_state: "signals_present",
      expect_limitation: "cannot be distinguished from routing evidence",
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
];

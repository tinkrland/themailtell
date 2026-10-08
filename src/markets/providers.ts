// providers.ts — cmra and virtual-mailbox provider rows.
//
// the honest part of this table: us cmra rules require pmb disclosure but
// compliance varies, so absence of "pmb" in an address is not evidence of
// a private residence. and many virtual mailbox and virtual office
// providers deliberately issue street-style "ste" (suite) addresses that
// carry no brand token at all; rows with empty patterns document that
// undetectability instead of pretending a match exists. a carrier
// validation adapter with a cmra indicator (see adapters.ts) is the
// stronger evidence path for exactly this reason.

import type { MailboxProviderEntry } from "../tables.js";

export const MAILBOX_PROVIDERS: MailboxProviderEntry[] = [
  {
    provider: "the ups store",
    kind: "cmra_chain",
    markets: ["us", "ca"],
    patterns: ["\\bthe\\s+ups\\s+store\\b"],
    note:
      "the largest us cmra chain; storefront addresses put the brand in " +
      "the lines, but a mail drop used without the brand token is " +
      "indistinguishable from any other suite address locally",
    citation: "https://www.theupsstore.com/mailboxes",
    verified_on: null,
  },
  {
    provider: "mail boxes etc.",
    kind: "cmra_chain",
    markets: ["us", "gb"],
    patterns: ["\\bmail\\s+boxes\\s+etc\\.?\\b"],
    citation: "https://www.mbe.com",
    verified_on: null,
  },
  {
    provider: "regus",
    kind: "virtual_office",
    markets: ["us", "gb"],
    patterns: ["\\bregus\\b"],
    note:
      "virtual office addresses are business street addresses with suite " +
      "numbers; the brand appears in the lines only when the customer " +
      "writes it there",
    citation: "https://www.regus.com/virtual-offices",
    verified_on: null,
  },
  {
    provider: "ipostal1",
    kind: "virtual_mailbox",
    markets: ["us"],
    patterns: [],
    note:
      "issues street-style suite addresses at its facilities; no local " +
      "token exists to match, so local analysis cannot detect it. the " +
      "carrier validation adapter path (cmra indicator) or a facility " +
      "address table would be needed, and neither is seeded here",
    citation: "https://ipostal1.com",
    verified_on: null,
  },
  {
    provider: "anytime mailbox",
    kind: "virtual_mailbox",
    markets: ["us"],
    patterns: [],
    note: "same undetectability as the ipostal1 row: street-style suite addresses",
    citation: "https://www.anytimemailbox.com",
    verified_on: null,
  },
  {
    provider: "davinci virtual",
    kind: "virtual_office",
    markets: ["us"],
    patterns: [],
    note: "same undetectability as the ipostal1 row: street-style suite addresses",
    citation: "https://www.davincivirtual.com",
    verified_on: null,
  },
  {
    provider: "uk postbox",
    kind: "virtual_mailbox",
    markets: ["gb"],
    patterns: [],
    note:
      "gb virtual mailbox provider issuing street-style addresses; not " +
      "locally detectable by token",
    citation: "https://www.ukpostbox.com",
    verified_on: null,
  },
  {
    provider: "british monomark",
    kind: "cmra_chain",
    markets: ["gb"],
    patterns: ["\\bbm\\s*\\d"],
    note:
      "long-standing london mail-handling service whose addresses use a " +
      "distinctive bm number; verify the current address format before " +
      "relying on this pattern",
    citation: "https://www.britishmonomark.co.uk",
    verified_on: null,
  },
];

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
  // ---- parcel forwarders / reshippers: the mail_forwarding_or_reshipping
  // shape class. a forwarder holds a shipping identity for someone outside
  // the market, which is often entirely legitimate (expats, cross-border
  // shoppers); a matched row is a signal, never a verdict ----
  {
    provider: "forward2me",
    kind: "mail_forwarder",
    markets: ["gb"],
    patterns: ["\\bc/?o\\s+forward2me\\b", "\\bforward2me\\s+(ltd|gmbh)\\b"],
    note:
      "uk reshipper (now also operating mygermany's de warehouse under " +
      "forward2me gmbh). customer addresses carry the account number at " +
      "the warehouse; the facility row catches the street form. reships " +
      "worldwide with consolidation",
    citation:
      "https://www.forward2me.com/terms-of-trade (facility address), https://www.forward2me.com/warehouses/united-kingdom/",
    verified_on: "2026-10-08",
  },
  {
    provider: "myukmailbox",
    kind: "mail_forwarder",
    markets: ["gb"],
    patterns: ["\\bmy\\s*uk\\s*mailbox\\b"],
    note:
      "uk reshipper allocating a personal suite number at its sheffield " +
      "facility; no brand token appears in the shipping address itself, so " +
      "the facility row is the stronger local evidence. worldwide reshipping",
    citation: "https://www.myukmailbox.com/contact",
    verified_on: "2026-10-08",
  },
  {
    provider: "uk postbox",
    kind: "virtual_mailbox",
    markets: ["gb"],
    patterns: ["\\buk\\s*postbox\\s*(ltd)?\\b"],
    note:
      "uk virtual-mailbox and parcel-address provider; addresses are " +
      "allocated per account with no brand token in the street line, so " +
      "the facility row is the local evidence path",
    citation: "https://www.ukpostbox.com/contact",
    verified_on: "2026-10-08",
  },
  {
    provider: "colisexpat",
    kind: "mail_forwarder",
    markets: ["fr"],
    patterns: ["\\bc/?o\\s+colisexpat\\b", "\\bcxp\\s?\\d{4,}\\b"],
    note:
      "french reshipper (colisexpat by mondialrelay). the customer " +
      "address carries a cxp + account number recipient reference, quoted " +
      "verbatim on their homepage example; the facility row catches the " +
      "street form. reships worldwide",
    citation: "https://www.colisexpat.com/en/",
    verified_on: "2026-10-08",
  },
  {
    provider: "mygermany",
    kind: "mail_forwarder",
    markets: ["de"],
    patterns: ["\\bc/?o\\s+my\\s*germany\\b"],
    note:
      "german reshipper operated by forward2me gmbh from schwedt; the " +
      "contact page itself is addressed 'forward2me gmbh c/o mygermany', " +
      "so the c/o form is the brand's own. reships worldwide with " +
      "consolidation",
    citation: "https://mygermany.com/contact/",
    verified_on: "2026-10-08",
  },
  {
    provider: "reship",
    kind: "mail_forwarder",
    markets: ["ca", "gb", "us"],
    patterns: ["\\bc/?o\\s+reship\\b"],
    note:
      "ca/us/uk reshipper. its own blog quotes the customer address " +
      "verbatim: 'your name, suite #214 - n######, 19138 26th ave surrey " +
      "bc, v3z 3v7 canada' (an older surrey warehouse; current locations " +
      "on the about page). unbranded suite form, so the facility rows are " +
      "the stronger local evidence. reships worldwide with consolidation",
    citation:
      "https://www.reship.com/about (locations), https://www.reship.com/blog/how-to-buy-from-amazon-in-canada (address format)",
    verified_on: "2026-10-08",
  },
  {
    provider: "pmb designation (cmra disclosure marker)",
    kind: "cmra_marker",
    markets: ["us"],
    patterns: ["\\bp\\.?\\s?m\\.?\\s?b\\.?\\s*\\d"],
    note:
      "pub28 sec. 285 requires cmra addresses to include either the pmb " +
      "identifier or the # followed by the private mailbox number, so " +
      "presence of a pmb token is a legally mandated cmra disclosure, not a " +
      "brand. the # form is not matched locally: pub28 sec. 213 makes # the " +
      "ordinary secondary-unit designator for apartments and suites " +
      "everywhere, so a bare # is not locally distinguishable from an " +
      "apartment and must not fire alone; the carrier validation adapter " +
      "with a cmra indicator is the evidence path for it. absence of a pmb " +
      "token stays honest too: disclosure compliance varies, so absence is " +
      "never evidence of a private residence",
    citation:
      "https://pe.usps.com/text/pub28/28c2_040.htm (pub28 sec. 285: private mailbox addresses)",
    verified_on: "2026-10-08",
  },
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

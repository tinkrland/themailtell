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
    provider: "us global mail",
    kind: "virtual_mailbox",
    markets: ["us"],
    patterns: [],
    note:
      "us virtual-mailbox provider since 1999 operating from houston. " +
      "its own site footer publishes the facility (1321 upland drive, " +
      "houston tx 77043); customer addresses at it carry no brand token, " +
      "so this row cannot match locally and the facility row is the " +
      "evidence path. worldwide forwarding",
    citation:
      "https://www.usglobalmail.com/faq/ (site footer facility address)",
    verified_on: "2026-10-08",
  },
  {
    provider: "earth class mail",
    kind: "virtual_mailbox",
    markets: ["us"],
    patterns: [],
    note:
      "the earthclassmail.com domain now serves legalzoom virtual mail " +
      "(observed 2026-10-08: the domain redirects to legalzoom's virtual " +
      "mailbox product page), so the historical brand persists in the " +
      "wild but its own address format is no longer published there. no " +
      "verifiable facility address was published on the page read, so " +
      "this row has neither a pattern nor a facility row: honest " +
      "non-coverage",
    citation: "https://www.earthclassmail.com/ (redirects to legalzoom virtual mail)",
    verified_on: "2026-10-08",
  },
  {
    provider: "post scan mail",
    kind: "virtual_mailbox",
    markets: ["us"],
    patterns: [],
    note:
      "us virtual-mailbox network (1,000+ locations). its own location " +
      "page shows the verbatim customer form: name and company lines " +
      "above the facility street address, no brand token, so this row " +
      "cannot match locally and the facility row is the evidence path. " +
      "worldwide forwarding",
    citation: "https://www.postscanmail.com/a/2345-e-thomas-rd-ste-100.html (verbatim form)",
    verified_on: "2026-10-08",
  },
  {
    provider: "traveling mailbox",
    kind: "virtual_mailbox",
    markets: ["us"],
    patterns: [],
    note:
      "us virtual-mailbox provider. verification attempt on 2026-10-08 " +
      "failed: travelingmailbox.com returns 403 to automated reads, so " +
      "neither the verbatim address format nor a facility address could " +
      "be read from the provider's own site. this row stays an unverified " +
      "seed; treat coverage as unknown until it can be verified",
    citation: "https://www.travelingmailbox.com/ (403 as of 2026-10-08, unread)",
    verified_on: null,
  },
  {
    provider: "myus",
    kind: "mail_forwarder",
    markets: ["us"],
    patterns: [],
    note:
      "us reshipper (sarasota fl). its own checkout guide shows the " +
      "customer address as a suite number in address line 2 at the " +
      "warehouse street, with no brand token, so this row cannot match " +
      "locally; the facility row is the evidence path. reships worldwide " +
      "with consolidation",
    citation:
      "https://www.myus.com/blog/how-to-enter-payment-shipping-details-when-shopping-us-sites/ (format), https://www.myus.com/about/ (warehouse)",
    verified_on: "2026-10-08",
  },
  {
    provider: "planet express",
    kind: "mail_forwarder",
    markets: ["us"],
    patterns: [],
    note:
      "us reshipper (gardena ca). its own tutorial shows the verbatim " +
      "customer address '17224 s. figueroa street, suite #b1234' with no " +
      "brand token, so this row cannot match locally; the facility row is " +
      "the evidence path. reships worldwide with consolidation",
    citation:
      "https://planetexpress.com/tutorials/how-to-activate-your-us-address/ (format and warehouse)",
    verified_on: "2026-10-08",
  },
  {
    provider: "stackry",
    kind: "mail_forwarder",
    markets: ["us"],
    patterns: [],
    note:
      "us reshipper (nashua nh). its own faq states address line 1 is the " +
      "same for all clients and line 2 is the unique locker/unit number, " +
      "an unbranded form that cannot match locally; the facility row is " +
      "the evidence path. reships worldwide with consolidation",
    citation:
      "https://www.stackry.com/faq (locker/unit format), https://www.stackry.com/how-it-works (location)",
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
      "the largest us cmra chain. verification corrected the note: their " +
      "own mailbox faq documents the customer format as the holder name " +
      "first with a pmb or # designator at the store street address, " +
      "with 'the ups store' NOT in the lines ('instead of the ups " +
      "store, your name appears first'). the pattern still fires when " +
      "a sender writes the brand into the lines (merchant labels often " +
      "do), but the documented format is tokenless, so absence of the " +
      "brand is never evidence of a private residence",
    citation:
      "https://www.theupsstore.com/mailboxes/business-mailboxes (verbatim format example)",
    verified_on: "2026-10-08",
  },
  {
    provider: "mail boxes etc.",
    kind: "cmra_chain",
    markets: ["us", "gb"],
    patterns: ["\\bmail\\s+boxes\\s+etc\\.?\\b"],
    note:
      "the mbe.co.uk store pages verify the service: mailboxes and " +
      "virtual offices live at ordinary mbe store street addresses (for " +
      "example london maida vale at 464 edgware road w2 1ah) with " +
      "forwarding anywhere in the world. the brand token fires only " +
      "when the sender writes it into the lines; the store address " +
      "itself is tokenless",
    citation:
      "https://www.mbe.co.uk/londonmaidavale/mailbox/virtual-mailing-address",
    verified_on: "2026-10-08",
  },
  {
    provider: "regus",
    kind: "virtual_office",
    markets: ["us", "gb"],
    patterns: ["\\bregus\\b"],
    note:
      "verified on regus.com's own virtual-office pages: the address is " +
      "a business postal address usable on documents and company " +
      "registrations. the addresses themselves are plain business " +
      "street addresses with suite numbers; the brand appears in the " +
      "lines only when the customer writes it there, so the token fires " +
      "on that case and its absence says nothing",
    citation:
      "https://www.regus.com/virtual-offices, https://www.regus.com/virtual-offices/can-you-register-a-business-to-a-virtual-office",
    verified_on: "2026-10-08",
  },
  {
    provider: "ipostal1",
    kind: "virtual_mailbox",
    markets: ["us"],
    patterns: [],
    note:
      "issues street-style suite addresses across 4,250+ locations; no " +
      "local token exists, so the facility-address table is the local " +
      "evidence path. but ipostal1's location addresses sit behind a " +
      "cloudflare-protected store locator (ipostal1.com returns 403 to " +
      "automated reads, observed 2026-10-08), so no ipostal1 facility " +
      "row is honestly seedable yet and this provider stays locally " +
      "undetectable here; the carrier validation adapter with a cmra " +
      "indicator remains the evidence path",
    citation: "https://ipostal1.com/virtual-address-locations.php (403 as of 2026-10-08)",
    verified_on: "2026-10-08",
  },
  {
    provider: "anytime mailbox",
    kind: "virtual_mailbox",
    markets: ["us"],
    patterns: [],
    note:
      "street-style suite addresses across a 2500+ location network; no " +
      "local token exists, so the facility-address table is the local " +
      "evidence path, and a carson city nv facility row is seeded from " +
      "the provider's own locations page. one row in a moving network is " +
      "an enumerated snapshot, not coverage: absence of a match is never " +
      "evidence of a private residence",
    citation: "https://www.anytimemailbox.com/l/usa/nevada (facility address)",
    verified_on: "2026-10-08",
  },
  {
    provider: "davinci virtual",
    kind: "virtual_office",
    markets: ["us"],
    patterns: [],
    note:
      "virtual-office addresses across thousands of locations, each " +
      "issuing a personal suite number (their bayonne facility page: " +
      "'personal suite number issued/required'); no local token exists, " +
      "so the facility-address table is the local evidence path, and a " +
      "bayonne nj facility row is seeded from the provider's own " +
      "facility page. one row in a moving network is an enumerated " +
      "snapshot, not coverage",
    citation: "https://www.davincivirtual.com/loc/us/new-jersey/bayonne-virtual-offices/facility-1853",
    verified_on: "2026-10-08",
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
      "long-standing london mail-handling service whose addresses " +
      "historically use a distinctive bm number. verification attempt " +
      "on 2026-10-08 failed: britishmonomark.co.uk does not resolve and " +
      "britishmonomarks.co.uk is bot-gated, so the current address " +
      "format is unverified and this row stays a seed. treat a match as " +
      "suggestive, never verified. honest in the other direction too: " +
      "'bm' plus a number is plausible-shaped, so a false positive on " +
      "an unrelated bm-numbered line is possible",
    citation:
      "https://www.britishmonomarks.co.uk (bot-gated as of 2026-10-08, unread)",
    verified_on: null,
  },
];

# provider local-part semantics

verified: 2026-10-08 (vendor support pages, scraped)

- google, "dots don't matter in gmail addresses",
  support.google.com/mail/answer/7436150 — dots in gmail local parts are
  ignored at delivery; any dotted variant of an address delivers to the
  same mailbox. the same page notes dot handling may differ on
  organization-configured (workspace) custom domains, which the signal's
  wording keeps.
- microsoft, "how to add an email address to your microsoft account",
  support.microsoft.com/en-us/accounts-billing/manage/how-to-add-an-email-address-or-phone-number-to-your-microsoft-account
  — consumer microsoft accounts support multiple account-level alias
  addresses sharing one mailbox. no syntax marker exists; a plain local
  part can neither confirm nor deny an alias arrangement. the scrape hit
  a sign-in wall; the page title and its topic are the evidence, and the
  alias feature itself is standard, long-documented microsoft behavior.
  re-verify against that page on the next table refresh.

license/update terms: vendor support documentation, copyright google llc
and microsoft corporation; behavioral facts cited, not copied. update
terms: living support pages; recheck on every table refresh.

what this backs in the code:
- dots_ignored on the google entries; alias_semantics_note on the consumer
  microsoft entries; the local_part_semantics signal in
  src/stages/address-analysis.ts (reported only, never applied as a
  rewrite).

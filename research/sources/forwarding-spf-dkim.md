# forwarding services: spf includes and dkim selectors

verified: 2026-10-08 (vendor documentation pages, scraped)

- improvmx spf: improvmx.com/guides/combining-spf-records —
  `v=spf1 include:spf.improvmx.com ~all` is the required include.
- improvmx dkim: improvmx.com/guides/adding-dkim-records —
  selector names `dkimprovmx1._domainkey` and `dkimprovmx2._domainkey`.
- forward email spf: forwardemail.net/en/faq —
  `v=spf1 a include:spf.forwardemail.net -all` is the required include.
- forward email dkim: their faq does not publish a selector name; left
  unverified and deliberately absent from the table (a recorded gap, not
  a guess).
- cloudflare email routing spf: developers.cloudflare.com/email-service/reference/postmaster/
  — "email routing configures spf on the root domain":
  `v=spf1 include:_spf.mx.cloudflare.net ~all`.

license/update terms: vendor guides and faqs (improvmx, forward email,
cloudflare), copyright their owners; setup facts (dns token strings) are
functional configuration, not creative expression. update terms: living
pages; recheck on every table refresh, since services change spf hosts
when they change sending infrastructure.

what this backs in the code:
- SPF_FORWARDING_INCLUDES: spf.improvmx.com, spf.forwardemail.net,
  _spf.mx.cloudflare.net.
- DKIM_FORWARDING_SELECTORS: dkimprovmx1, dkimprovmx2 (improvmx only).
- the wildcard-txt guard: migadu.com and yousee.dk serve unrelated txt
  values to any name under *.domainkey, so only v=DKIM1-shaped records
  count (observed live 2026-10-08, regression-tested).

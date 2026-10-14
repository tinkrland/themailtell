# thetldradar

a domain reputation risk radar for top-level domains. .com and .dev
sit at the safe end; .xyz, .top, .click and peers sit at the abused
end; and none of it is timeless.

the twist this radar exists for: big tech risk radars rank tlds by
abuse share alone and stop there. but abuse share is partly a pricing
phenomenon. interisle's phishing landscape work documents it plainly:
phishers exploit cheap, the top 27 tlds with the highest proportions
of abuse were priced at us$2 or less, and malicious actors purchased
at least 10 percent of all new gtld domains registered in 2025. when
boutique registrars (spaceship, porkbun and peers) drop a tld to $4
first-year against a $25 renewal, they move registration economics,
and the abuse follows the cheap year. the radar therefore carries
two axes per tld:

- **abuse band**: where a cited dataset (spamhaus worst tld lists,
  interisle phishing landscape) places this tld, with the snapshot
  date. rates and counts are kept distinct and honest.
- **price pressure**: observed first-year and renewal prices at named
  registrars, each with its own observation date. price snapshots
  decay fast: promo economics move on weekly timescales.

## what each row carries

- tld, abuse band, abuse citation and verification date
- price observations: registrar, first-year price, renewal price,
  observed date, citation
- recheck cadence and honest notes, verbatim

verified rows were read from the cited sources on the date recorded.
unverified seeds are marked verified_on: null and say so.

## honest limits

- an abuse band is a snapshot of a dataset's coverage, not a property
  of the tld forever. .com carries the most malicious domains by raw
  count simply because it is the largest tld; by share it is ordinary.
  rate and count are never conflated.
- a cheap promo price is an observed fact about registration
  economics. it raises the prior for churn-driven and abuse-driven
  registration, as interisle documents; it never proves any specific
  domain abusive. the twist is a fact about economics, not a verdict
  about registrants.
- renewal-delta rows (four-dollar first year against twenty-five
  dollar renewal) are recorded as economics with observed dates, and
  they decay.

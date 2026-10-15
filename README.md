# thetldradar

a domain reputation risk radar for top-level domains. .com and .dev
sit at the safe end; .xyz, .top, .click and peers sit at the abused
end; and none of it is timeless.

the differentiation this radar exists for: we are not remaking what
already exists. interisle, spamhaus, google and microsoft all measure
aggregate abuse telemetry, and those feeds are dominated by api-scale
bulk purchase: scammers buying domains by the dozens, programmatically.
big tech radars score what lands in their feeds. the human path is the
blind spot: one or two domains bought at a polished consumer
storefront, at a sale price, with a card or bitcoin, sometimes through
a privacy buffer that owns the domain for them. no bulk, no api, no
feed footprint until the domain is used. that is the path this radar
enumerates.

the twist that makes it measurable: abuse is partly a pricing
phenomenon, and interisle documents it plainly: phishers exploit
cheap, the top 27 tlds with the highest proportions of abuse were
priced at us$2 or less, and malicious actors purchased at least 10
percent of all new gtld domains registered in 2025. when boutique
registrars drop a tld to a sale price against a steep renewal, they
move registration economics for humans and bots alike. the radar
therefore carries two axes per tld:

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

## the registrar landscape carried here

six storefronts, each a different point on the human path:

- **Spaceship**: the boutique storefront of Namecheap, Inc (its own
  2024 press release), not a small operator; first-year sales
- **Porkbun**: the clearest sale-churn pattern on its own live pricing
  page: .top $1.63, .click $1.54, .xyz $2.04 first year against
  struck-through renewals (read 2026-10-15)
- **Namecheap**: monthly rotating coupons plus bitcoin acceptance;
  the same organization behind Spaceship
- **Dynadot**: many payment rails; announced identity digital
  registry price changes for 227 tlds effective october 6, 2026
- **Cloudflare Registrar**: at-cost, no sales, the control row that
  shows the price-pressure signal absent
- **Njalla**: the extreme privacy path, a buffer that owns the domain
  for the registrant, bitcoin-friendly
- **gen.xyz**: the .xyz registry's own storefront, vertically
  integrated on both sides of the wholesale/retail line ($15/yr flat
  default, via research pass 2026-10-15; cloudflare-gated to direct
  reads)

a registrar row records architecture and economics, never a verdict
about its customers.

## premierity: the barrier axis

not every tld can be bought, at any price. .us requires an attested
us nexus, .ie a document-checked claim of connection to ireland, .de
holder verification under NIS2 (effective 2025-12-06), .eu eu/eea
residency itself. every row now carries its registration barrier,
because a cheap promo behind a gate is a different fact from a cheap
promo on an open tld: price pressure cannot inflate registrations
past a gate the registry operates.

## registration age: the renewal is where they get you

sale prices apply to the first year. a $4 .ltd two years past its
promo has paid $25.04 twice, and each paid renewal weakens the
sale-price prior: keeping the domain now costs real money. age is
per-domain evidence read at engine time from whois creation dates,
jointly with every other axis, never in a vacuum: aged does not mean
clean, fresh does not mean dirty, and moneyed registrants can be
nefarious too. the radar records economics and gates, never verdicts
about people.

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

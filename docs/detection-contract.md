# thetldradar detection contract

this component extends the themailtell discipline to tld-level
reputation. the rules carry over and gain two of their own:

1. every row is a set of cited facts with verification dates and
   recheck cadences. unverified seeds are marked and never relied on.
2. abuse bands are snapshots: dataset name, snapshot date, and band,
   carried together. a band is never promoted to a timeless property
   of a tld.
3. rate and count are never conflated. raw malicious-domain counts
   scale with tld size; bands are about share under a dataset's
   coverage. .com leads on count and is ordinary on share, and the
   registry says both.
4. price observations are first-class radar facts: registrar,
   first-year price, renewal price, observed date, citation. promo
   pricing moves on weekly timescales, so price observations carry
   their own decay and recheck cadences, faster than abuse bands.
5. the twist, stated honestly: interisle documents that phishers
   exploit cheap tlds (top 27 highest-abuse tlds priced at us$2 or
   less; 10 percent of new gtld registrations in 2025 malicious).
   price pressure therefore raises a prior for abuse-driven
   registration economics. it is evidence about economics, never
   proof about a registrant. infrastructure is not intent.
6. unknown is first-class. a tld with no dataset read yet carries
   abuse_band: unknown with its reason, not a guess.
7. when an engine lands on this branch, fixture passes prove
   consistency only; accuracy claims require the authorized corpus.

## schema 0.3.0: the human path is the factor

per owner direction: this radar does not remake the aggregate abuse
telemetry that already exists (interisle, spamhaus, big tech feeds),
because that telemetry is dominated by api-scale bulk purchase. the
registry's factor is the human path: sale-priced one-off purchases at
consumer boutique storefronts, invisible to feed-based radars until
the domain is used.

the registrar table (src/registrars.ts) carries that landscape:
registrar kind (consumer_boutique, at_cost, privacy_buffer), sale
pattern, payment privacy, ownership notes, each cited and dated with
its own recheck cadence. the control case is explicit: cloudflare
registrar sells at cost with no sales, so the price-pressure signal
is recorded as absent there rather than assumed everywhere. a
registrar row is architecture and economics, never a verdict about
customers: sales and privacy shields serve dissidents and abusers
alike.

price observations continue to decay on their own fast cadence, and
the interisle us$2-or-less abuse-price zone stays the reference for
reading them.

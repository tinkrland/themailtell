# implementation notes

## what is implemented

the classification core is a pure function over evidence
(src/core.ts, `analyze(evidence, options)`), organized as stages that
mirror [the detection contract](detection-contract.md):

- input handling (src/stages/input-handling.ts): shape validation and a
  diacritic-folded match copy. the address object itself is untouched.
- lexical intelligence (src/stages/lexical-intelligence.ts): po box
  equivalents from the market table.
- carrier intelligence (src/stages/carrier-intelligence.ts): locker and
  pickup-point rows, including linked po box shapes and the carrier
  customer number documented for the company field (the dhl postnummer).
- provider intelligence (src/stages/provider-intelligence.ts): cmra and
  virtual-mailbox rows, cross-market.
- format intelligence (src/stages/format-intelligence.ts): market format
  rules. a market without a format table yields unknown, not valid.
- aggregation (src/stages/aggregation.ts): staleness downgrade (stale
  intelligence becomes unresolved, never silently trusted), contradiction
  and mixed-evidence reporting, shape findings, and the honest limitations.

evidence gathering (src/evidence.ts, `gatherEvidence`) runs optional
adapters and converts their findings into signals with provenance; the
core itself never touches the network or the clock.

the result schema is versioned (src/schema.ts). signals carry name,
scope, source, observed_at, strength, coverage and detail; the result
carries per-shape findings, aggregate state and limitations.

## intelligence tables

market tables live in src/markets/, one file per market plus a
cross-market provider table. every row carries:

- its citation (the postal operator or carrier page it came from),
- a verification date (verified_on) or an honest null,
- a re-verification cadence for carrier rows (carrier formats change on
  the carrier's schedule; australia post changed its parcel locker
  format in 2026, so the au rows re-verify every 90 days),
- notes that document what exactly was verified and what still is not.

unverified seed rows can only produce suggestive signals, never
recognized, and each one emits its own limitation until verified. the
tables age as a whole too: signals older than maxAgeDays (default 90)
are downgraded to unresolved.

adding a market is one new file plus one line in src/markets/index.ts:
additive rows, never code changes in the matching stages.

## verification status of the seed tables

verified rows (official page fetched and confirmed on 2026-10-08) include
us po box and pbsa (usps publication 28, sections 281-285), ca po box and
flexdelivery, au po box, locked bag and both parcel locker formats (the
official address-change page), de postfach and packstation (dhl's own
postnummer documentation), fr boite postale, cedex and pickup, it
casella postale and punto poste, nl postbus and postnl-punt, es apartado
and citypaq, nz po box and private bag, gb bfpo, ch postfach and pickpost,
dk daoshop and GLS pakkeshop, se paketbox, at versandstation, and the
staffed-pickup rows for us amazon, ups and fedex.

still unverified, honestly null: gb po box and format, ie po box, at and
be postfach/postbus, se box and ombud, dk postboks and format, nz parcel
collect, it amazon locker, de paketshop, ch case postale and casella
postale (the french and italian language labels), and several format rows.

## adapters

none are implemented. the contract is src/adapters.ts: adapters declare
their data exposure (address_only preferred; this component never holds a
recipient name) and their capabilities, and every finding carries
coverage. an unevaluated check is coverage "none", never clean.

candidate adapters, all optional: a usps address validation chain
(cass-certified tools with dpv confirmation plus the dpv cmra and
business/residential indicators) for us; royal mail paf for gb; canada
post address complete; australia post address verification; postnl
address check; swiss post address verification; the google address
validation api; and commercial validators (smarty, loqate, melissa, lob)
as optional paid adapters.

what each can and cannot see differs: dpv with the cmra indicator is the
strongest counter to street-style cmra addresses, which local patterns
provably cannot catch (see the pbsa and pmb limitations). before trusting
any adapter claim, check its coverage semantics, not its marketing.

## the adapter path and why coverage is separate from strength

a local table row can be verified (recognized) while covering nothing
externally: coverage stays "none". an adapter check that ran and
evaluated the delivery point carries coverage "full" or "partial". the
eval harness treats an adapter finding that claims a capability its
adapter does not declare as scope overreach and fails the case.

## evaluation

`npm test` runs the unit suite. `npm run eval` runs the fixture corpus
(src/eval/corpus.ts) with contrast pairs, staleness re-evaluation,
generic scope-overreach checks and separate failure-kind counts (false
positives, false negatives, wrong states, wrong findings, missed
limitations). unknown-state results are reported as their own rate,
never counted as passes or folded into the failure count.

fixture cases and the tables share an author: passes prove consistency
only. real-world accuracy requires the authorized corpus; see
[the corpus guide](authorized-corpus.md).

## portability and conventions

npm install && npm test runs anywhere node 18+ runs, no network needed.
lowercase prose in code, docs and commit subjects; external names keep
their exact case (dhl packstation, flexdelivery, postnl-punt, GLS). no
em dashes, no emojis, no secrets, no accuracy claims without the
authorized corpus.

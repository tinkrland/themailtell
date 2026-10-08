# thelocaletell

a standalone delivery-address classification component for applications that
need signals about the shape of a postal address: po box equivalents, parcel
lockers and pickup points, commercial mail receiving agencies (cmra) and
virtual-mailbox providers, and format validity.

this repository contains the design brief and a reference implementation of
the classification core. it makes no accuracy claim: several market rows are
unverified seeds, and the fixture evaluation corpus requires authorized real
addresses before any production use. see [the implementation notes](docs/implementation.md).

## the problem

an address that arrives at a checkout can be written like a street address
while not being a street delivery point. post boxes have market-specific
lexical shapes; parcel lockers and pickup points have carrier-specific
address formats; cmra storefronts and virtual mailbox providers issue
street-style suite addresses, sometimes with no brand token in the lines at
all.

conversely, a buyer legitimately using a parcel locker or a parcel collect
point is not doing anything suspicious. classification is not judgment:
this component reports what an address looks like; consuming applications
decide what a signal means for them.

## what thelocaletell does

- detects po box equivalents per market, in each market's own postal
  vocabulary (po box, postfach, boite postale, apartado, postbus, postboks,
  box, private bag, locked bag, bfpo, cedex and more).
- detects carrier locker and pickup-point address formats per carrier,
  with the carrier's own documentation as the citation (dhl packstation,
  australia post parcel lockers in both the pre- and post-2026 formats,
  flexdelivery, citypaq, postnl-punt, daoshop, pickpost and more).
- detects cmra chains and virtual mailbox providers where the brand
  appears in the lines, and honestly reports where local detection
  cannot see them at all.
- detects parcel-forwarding / reshipping facilities (myus, stackry-style
  consolidators: a facility that exists so someone can hold a shipping
  identity in a market they are not in) as their own shape class,
  mail_forwarding_or_reshipping, never folded into the cmra class:
  forwarding use is often legitimate (expats, cross-border shoppers), a
  match is a signal never a verdict, and consumers may treat the classes
  differently.
- matches known facility street addresses of providers and forwarders
  (from their own location pages) against the full address, so a
  street-style suite address at a known facility is caught without any
  adapter; the facility table is an enumerated snapshot of a moving
  target, and absence of a match is never evidence of a private
  residence.
- checks format validity per market: missing street, missing or malformed
  postal code, required fields.
- returns unknown rather than guessing, reports contradictions rather than
  resolving them silently, and stamps every signal with its source, its
  evidence strength, its coverage and its observation time.
- scans every free-text field, not just the lines: box-shaped markers
  conventionally live on any field ("PO Box 123" as the city, "Paris Cedex
  07" as the city line, "Case postale 123" as the city), so the lexical,
  carrier and provider stages fold the lines, the city and the region into
  the match text the same way. the company field keeps its own patterns.

## what it never does

- it never says "street address verified". an address with no box-shaped
  evidence is reported as "no such evidence found", a statement about the
  search, never about the address.
- it never decides whether a business-use building is acceptable. a
  building-use adapter can report a commercial_building_indicator (office,
  retail, mixed-use), carried as independent evidence that feeds no shape
  finding: commercial buildings can legally hold residences, and whether
  one is acceptable is consumer policy. a residences-only service (a
  library e-card signup, for example) will treat that signal very
  differently from a parcel service; the facility table plus this signal
  are what make that policy decidable.
- it never accepts or rejects an address. consumers decide.
- it never treats a locker or pickup-point address as fraud, and never
  treats a market, a language or a diacritic as suspicious.
- it never edits or normalizes the address it was given; matching runs on
  a folded copy, and the original lines are preserved verbatim.
- it contains no reference to any consuming product and no policy prose
  about bans, fraud or admissions.

## decoupled by design

thelocaletell provides classification signals and supporting evidence.
consuming applications decide what each signal means for them.

the core is a pure function over evidence: no network, no clock, no
policy. external intelligence (usps-style address validation with delivery
point confirmation and cmra indicators, royal mail paf, canada post,
australia post, postnl, swiss post, google address validation, commercial
validators) plugs in as optional adapters behind a provider-independent
contract, and every adapter finding carries coverage semantics: an
unevaluated check is coverage "none", never a clean verdict.

## markets

seeded with 16 markets (iso 3166-1 alpha-2 codes): us ca gb au de fr it nl
es be at ch se dk ie nz. "market" in every user-facing string and schema,
never "country". adding a market is additive table rows, not code changes.

## limits that matter

- po box street addressing (pbsa) writes boxes exactly like street
  addresses with a secondary unit. local pattern detection alone cannot
  catch every box-shaped address; the limitation is carried in the output.
- us cmra rules require pmb disclosure (pub28 sec. 285 mandates pmb or #
  before the private box number), so presence of a "pmb" token is matched
  as a cmra disclosure marker. the "#" form is not matched: pub28 sec. 213
  makes # the ordinary secondary-unit designator for apartments everywhere,
  so a bare # cannot be locally distinguished from an apartment. compliance
  with the disclosure rule varies, so absence of "pmb" is not evidence of a
  private residence either.
- many virtual mailbox providers deliberately use street-style suite
  addressing with no brand token. the provider table documents this as a
  detection gap instead of pretending a match exists.
- carrier formats change on the carrier's schedule. australia post changed
  its parcel locker address format in 2026; both old and new formats are in
  the wild, and the au rows carry a short re-verification cadence for
  exactly that reason.
- multilingual markets (ch, be) are handled honestly: language labels are
  separate rows with their own verification status, not a merged blob.
- no per-market completeness claim is made anywhere.

## reading a result

consumers reading only the aggregate state can misread it, so the reading
rules are explicit:

- a fully-scanned clean address (every table ran, nothing matched) returns
  state "unknown" together with per-shape "no_evidence_found" findings. the
  state says nothing was established; the per-shape findings are the ones
  that say the searches ran and found nothing. "unknown" never means "we
  could not evaluate".
- a fully-scanned address where every signal has aged out also returns
  "unknown", but with its stale signals still present at unresolved
  strength; the difference is visible in signals[], not in the state.
- an unseeded market returns "unknown" with "unknown" findings, never
  "no_evidence_found": uncovered shape classes are honest about not having
  run.
- state "mixed_evidence" means recognized or suggestive signals from two
  different shape classes with different sources appeared together; it does
  not mean contradictory (that is the "contradictory" state).

see [the detection contract](docs/detection-contract.md) for the design
rules and [the corpus guide](docs/authorized-corpus.md) for evaluation
with authorized real addresses.

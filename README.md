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
- checks format validity per market: missing street, missing or malformed
  postal code, required fields.
- returns unknown rather than guessing, reports contradictions rather than
  resolving them silently, and stamps every signal with its source, its
  evidence strength, its coverage and its observation time.

## what it never does

- it never says "street address verified". an address with no box-shaped
  evidence is reported as "no such evidence found", a statement about the
  search, never about the address.
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
- us cmra rules require pmb disclosure, but compliance varies. absence of
  "pmb" is not evidence of a private residence.
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

see [the detection contract](docs/detection-contract.md) for the design
rules and [the corpus guide](docs/authorized-corpus.md) for evaluation
with authorized real addresses.

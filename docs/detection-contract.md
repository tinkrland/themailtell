# detection contract: evidence before verdicts

this is a design contract for the reference implementation in src/.

## independent responsibilities

1. input handling preserves the address verbatim and validates its shape
   without product-specific acceptance rules, never rewriting the lines.
2. lexical intelligence identifies po box equivalents per market, from
   that market's official-language postal vocabulary.
3. carrier intelligence identifies parcel locker and pickup-point address
   formats, per carrier, with the carrier's own documentation cited.
4. provider intelligence identifies cmra chains and virtual mailbox
   providers, and documents where local detection cannot see a provider.
5. format intelligence checks market format rules: missing street,
   missing or malformed postal code, required fields.
6. evidence aggregation exposes signals, findings, uncertainty and
   contradictions to the consuming application. it does not accept or
   reject anything.

external intelligence providers are optional adapters, not the definition
of the component. adapter output maps to a provider-independent contract,
and provenance plus coverage travel with every signal.

## result properties

- independent signals for po box equivalents, locker/pickup points, cmra
  and virtual mailboxes, carrier-confirmed street delivery points and
  format issues.
- signal scope: address, carrier or market.
- evidence source (builtin table row with citation, or adapter), observed
  time and staleness behavior.
- evidence strength with explicit meanings: recognized, suggestive,
  unresolved. not an invented probability.
- coverage semantics per signal: an unevaluated check is "none", never a
  clean verdict.
- shape findings per class: evidence_found, no_evidence_found, unknown.
- aggregate state: signals_present, mixed_evidence, contradictory,
  unknown. unknown is first-class and is never silently converted into
  "no box-shaped evidence" or "street address verified".
- a versioned result schema (schema_version on every result).

## shape-class semantics

- po box equivalents and locker/pickup points are reported, never
  judged. buyers legitimately use both.
- a locker row that is itself a po box shape (canada post flexdelivery is
  a free staffed po box) reports both signals from one linked source;
  that is one finding, not a mix.
- a recognized carrier-confirmed street delivery point contradicted by
  recognized po box evidence is reported as contradictory: both signals
  are reported and neither wins.
- "no evidence found" is a statement about the search, not a verification
  of a street address. the honest limitation is emitted with it.

## address-level restraint

- the address is never edited, normalized or "corrected"; matching runs
  on a folded copy (lowercase, diacritics folded) and the original lines
  are preserved.
- diacritics are matched, not punished: "boîte postale" and "boite
  postale" are the same shape.
- the result never echoes the address lines back.
- the market code scopes every table lookup; a token in the wrong market
  is not evidence of anything.
- absence of a locker token is not evidence of a street address: staffed
  pickup points are ordinary street addresses.

## evaluation before coverage claims

use an authorized corpus of real addresses with known shapes and
contrasting pairs: the same operator's po box next to a genuine street
address; pbsa-style secondary units next to genuine street addresses; a
locker next to a nearby street address. record false positive, false
negative and unknown rates per market and per signal.

never edit an expectation to make a case pass. fixture passes prove
consistency only. see [the corpus guide](authorized-corpus.md).

## address existence (adapter-only)

the component cannot say "no such thing" offline, and it does not pretend
to: a local pattern engine has no delivery-point registry, so
`address_existence` is a distinct finding from `format_validity` and
from every shape class, and the offline core always reports `unknown`
for it.

format validity and existence are different claims, and the apartment-f
case is exactly their separation: someone picks a real building whose
recognized units are a-e and gives unit f. the address is format-valid,
every shape class may honestly report no_evidence_found, and the
existence finding says disconfirmed, all at once.

existence only moves off unknown through a delivery point validation
adapter (usps delivery point validation, google address validation,
equivalents), which reports as the adapter-only signal
`delivery_point_validation` with an `existence` field, the source's own
coverage, and an observation date. the finding is never absolute:

- "disconfirmed" means the validation source did not recognize the
  address or its unit, at that source's coverage and date, not a
  metaphysical claim that the address cannot exist;
- validation sources lag new construction and renovations, and a
  building can gain unit f after the check, so the finding ages through
  the same staleness decay as every other piece of evidence;
- partial coverage sources set the finding but the result carries a
  limitation saying the check was weaker than a full-coverage one;
- with no adapter, the result carries the limitation that existence was
  never externally checked. unknown stays first-class.

consumers must not read `unknown` as "the address exists" or
`confirmed_exists` as a deliverability guarantee, and the component
never decides what a disconfirmed address means for an order.

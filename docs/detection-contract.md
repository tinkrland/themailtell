# theccradar detection contract

this component carries the family discipline to payment instruments.
the rules:

1. one row per instrument: kind, kyc posture, kyc scope, jurisdiction,
   funding anonymity, caps, each cited and dated, recheck cadences
   attached, honest notes verbatim.
2. kyc claims are scoped, never flat. what is verified, by whom, under
   which regulation, is the fact.
3. registration is not kyc, activation is not verification, a zip is
   not an identity. the row says which one applies.
4. regulator-built ladders are recorded as ladders, with their caps
   and their citations. regulation snapshots decay on their own
   cadence: RBI directions move, and rows say so.
5. unknown is first-class and recorded as unknown.
6. a row is never a verdict about the spender. the instrument is
   chosen for reasons that include gifts, privacy, and fraud, and
   the registry's job is to describe the tether, not to guess which
   reason applies.
7. when an engine lands on this branch, fixture passes prove
   consistency only; accuracy claims require the authorized corpus.

## schema 0.2.0: networks, rotation, and where kyc actually sits

card_network records the rails an instrument rides, and the rule is
explicit: a network logo is a rail, never a tether. the same
mastercard mark sits on a bank card and on a light-friction e-money
prepaid account, and the row says which one.

number_rotation records whether the holder can mint fresh numbers at
will. that is the free-trial-recycling axis: the industry names it
trial abuse, a form of first-party fraud, but in practice it is mostly
a terms-of-service violation rather than a crime, and the row records
capability, never an accusation. merchants counter with BIN-level
blocking, so the capability is also merchant-visible.

the scale itself is restated: essentially no instrument in payment
rails is truly no-kyc, because AML reaches card programs, e-money
issuers and on-ramps almost everywhere. what varies is where the
identity sits. the rows record that.

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

## scope, stated plainly

this radar is not crime detection. global AML regimes and the teams
that run them have money laundering handled, and nothing in these
rows implies law-breaking by an issuer or a user. the scope is the
consumer tos-bypass read for turnkey saas: what a signup form
verifies, what a single consumer can swap out at each field without
breaking a law, and what the saas side already does about it. the
rows record capability and counter-capability, never accusation, and
the composite decision layer reads this radar alongside the provider,
voip and tld radars, never in a vacuum.

## the perspective rule

no row is written from the state's posture. law enforcement responds
to crime, and crime is out of scope here by design: financial
authorities reach issuers when real harm is in play, and $8 trial
abuse will never clear that bar, proportionally and correctly. the
perspective is the bootstrapped saas operator's: the harm recorded is
unit-economics scale, the defense has to live in the onboarding form,
and the radar's job is to make that defense describable, cheap and
honest. no legal claims about anyone, no moral judgment about anyone,
and the consumer in the exchange is recorded as a capability, never
as a criminal. the ambition is calibrated to match: self protection
for one solo operator's unit economics, not protecting the world, and
no superhero claims either way.

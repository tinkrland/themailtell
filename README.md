# theccradar

a risk registry of payment instruments. the card behind a payment
tells you what identity stands behind the money, and that runs from
nothing at all to a full bank tether. the radar reads the tether,
never the spender.

the scale, anchored by the rows:

- **no kyc by design**: cash-adjacent instruments, retail gift cards
  bought for cash or as gifts, transferable, no identity for the user
- **registration only**: a billing zip to make online use work, which
  is friction, not an identity
- **limited-kyc ladder**: regulator-capped anonymous-ish tiers with a
  documented ladder above them, like RBI's minimum-detail prepaid
  instruments in india
- **full kyc**: bank-linked instruments whose issuer verified the
  account holder before the first charge

## the india case

RBI's master directions on prepaid payment instruments built the
ladder into regulation: minimum-detail instruments carry small load
caps (ICICI's own Pockets pages: loadable up to rs 10,000 a month
under minimum details), and full-kyc instruments unlock the rest.
the regulator priced anonymity in caps, and the 2018 kyc deadline
forced existing wallet users up the ladder. regulation snapshots
decay: RBI directions move, and rows carry recheck cadences.

## honest limits

- kyc posture is a fact about the instrument, never about the person
  paying with it. gift cards are among the most-gifted objects in the
  world; privacy.com shields ordinary shoppers from merchant data
  leaks; a pockets wallet is someone's first bank. the row records
  the tether, not a verdict about the spender.
- registration is not kyc. a zip code is not an identity, and an
  activation step is not a document check. the rows say which one
  each instrument actually requires.
- paying with the instrument your bank issued says nothing about your
  honesty, and paying with the most anonymous instrument on the scale
  says nothing either. the decision layer combines signals from
  multiple radars, never in a vacuum: a theccradar row joins the
  voip, tld and provider rows as evidence, never as a verdict.

# thephonetell

phone line-type and virtual-number signals: evidence, not verdicts.

given an e.164 number, thephonetell returns signals about its shape: which
line type the evidence indicates (mobile, landline, fixed voip,
non-fixed voip), whether the number is virtual (numbering-plan virtual
ranges, known virtual-number providers, community lists), and whether
the format is valid, with honest reasons when it is not.

it classifies. consumers decide what a signal means for them. a finding
of "no evidence found" is a statement about the search, never a
verification of a number, a line type, or a holder, and unknown is a
first-class result, not a failure.

## why line type matters

phone numbers can be divided into identifying classes, and the signals
above exist to report each one honestly:

- mobile and wireless carriers
- landline providers
- voip and virtual phone services (fixed voip as a landline replacement,
  non-fixed voip usable from anywhere)
- prepaid numbers, where the plan is visible at all (in most numbering
  plans, including the north american one, prepaid is a carrier-adapter
  question, never a range question)
- line type classification, the shape the evidence indicates
- country and regional routing, which market's numbering plan the number
  belongs to
- disposable or high-risk phone infrastructure, only where it is
  observable: known providers of short-use numbers and community lists.
  risk itself is a consumer judgment this component never makes

numbers are commonly categorized into a few line types: mobile or
wireless, landline, voip and virtual services, and prepaid mobile where
visible. the distinction matters because number types behave differently
in authentication, onboarding, and fraud-prevention workflows:

- mobile numbers are commonly used for sms verification and two-factor
  authentication
- landlines may not support sms messaging at all
- voip numbers are often used for virtual communication and automated
  registrations, and voip use is legitimate privacy behavior, not
  evidence of anything by itself
- prepaid numbers may carry elevated risk in certain environments, a
  correlation the consumer weighs, never a fact about the person holding
  the number

carrier lookup and line-type analysis help a business understand how a
number may be used before granting access to a platform. but no single
phone-intelligence signal should be used in isolation: carrier lookup is
most effective combined with ip reputation, device fingerprinting,
behavioral analysis, email reputation, and proxy and vpn detection.
combining those signals is the consumer's job; this component supplies
its own evidence with coverage semantics on every signal, states its
limitations, and never merges the rest.

## install and run

```
npm install
npm test        # unit checks
npm run eval    # fixture corpus: contrast pairs and honest unknowns
```

node 18 or later, no network, no secrets, no external services. the only
runtime dependency is libphonenumber-js (offline parsing).

## signals

- mobile, landline: from the market's numbering-plan ranges and carrier
  adapters
- fixed voip and non-fixed voip: distinct signals, never one voip blob.
  fixed voip is a real landline replacement (cable voice); non-fixed voip
  is a virtual number usable from anywhere
- virtual number: designated virtual ranges (gb 056 per ofcom, de 032 per
  bnetza, nl 085 per acm, and others), known provider shapes, community
  lists. gb 07x is never one mobile blob: 070 is personal numbers and 076
  is radiopaging (with 07624 allocated to isle of man mobile operators per
  ofcom's s7 allocations file), only 071-075 and 077-079 are mobile
  services ranges, all verified against ofcom's numbering data page. an
  input carrying a phone extension is evaluated on the number and reports
  the excluded extension honestly; the extension never influences a
  finding
- format validity: with honest machine reasons for invalid inputs
- declared comparison: if the caller declares a voip flag, a separate
  agree / disagree / unknown comparison signal. verification of the
  declaration is the consumer's job, never this component's

## markets

36 seeded markets (iso 3166-1 alpha-2), each a table file with regulator
citation and verification date per row, or an honest null:

us ca gb ie de at ch fr be nl it pt es au nz cy tr il jo eg ma in pk bd
my id ph mx br ar cl co pe za ng gh

adding a market is additive table rows: a new file plus one line in the
market index, never a change in the stages. "market", never "country",
in strings and data schemas. dk is unseeded by design.

markets whose numbering plans encode no line-type signal say so honestly:
in the north american numbering plan (us, ca), line type is a
carrier-adapter question, never a range question, and a us number
without adapter evidence stays unknown rather than guessed.

## adapters (optional, provider-independent)

the core never calls a carrier. external intelligence is an adapter
implementing the contract in `src/adapters.ts` with coverage semantics on
every signal. candidate adapters: twilio lookup line type intelligence
(returns mobile, landline, fixed voip, non-fixed voip, unknown) and other
commercial phone validators; the free tiers of numverify or numlookup are
research aids, not production adapters. an
unevaluated check is coverage "none" and never a clean verdict.

## staleness

numbering ranges change: ireland's 076 voip range was withdrawn by comreg
in january 2022, so both stale range claims and the withdrawal itself are
handled by decay rather than assertion. every table row carries a
verification date and ages against a configurable window; a withdrawn row
is permanently unresolved and reports its withdrawal date.

## limits, stated honestly

- a number's market says nothing about the person holding it: ported
  numbers, diaspora, roaming
- one number is not one human: shared family landlines exist, and a
  virtual number is not automatically suspicious
- voip use is legitimate privacy behavior, not evidence of anything; this
  component reports line types, not judgments
- carrier data can be stale, wrong or absent; unknown routes to human
  review, never to a hard verdict
- most consumer voip apps (google voice, textnow, burner, hushed, mysudo)
  draw numbers from ordinary national blocks: local detection cannot see
  them and says so
- no completeness claim per market: unverified seed rows stay suggestive
  and emit their own limitations

## corpus and accuracy

no accuracy claim is made without the authorized corpus: numbers you or
your family control, with ground truth written before running anything,
including contrast pairs (real mobile vs google voice in the same
national range; fixed voip vs landline; a ported number). see
docs/authorized-corpus.md. the fixture suite proves consistency only.

## license

unlicensed, private. see the repository's own terms.

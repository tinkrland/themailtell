# binding

the design layer of the radar family: how the signals the four
registries and the composer produce are bound together into the
glue a bootstrapped saas actually installs. thecomposer is the
reference engine; binding is the contract for using it. no code
ships here by design: every claim about a provider or a tld lives
in its registry with its citation, and this branch only describes
how bound facts compose.

## the signal inventory, honestly

per signup field, four shelves: what binds, what ages, what is
adapter-gated, and what is never knowable. the question "what can
we even get signals from" answers itself differently per field, and
the glue is built on the differences, not on a uniform pipeline.

### email

- binds: the domain part resolves to a theproviderradar row: kind,
  content access, transparency, abuse posture. a gmail address is a
  mainstream row, a protonmail address is a privacy row, a
  mailinator address is public inboxes by design.
- ages: era bounds only, carried verbatim by the composer and never
  parsed: @proton.me addresses cannot predate the 2022 domain
  introduction, a live free proton account was active within the
  last twelve months or it would have been deleted. bounds, never
  dates.
- adapter-gated: breach-corpus first appearance (hibp's per-address
  search is a paid api behind their dashboard, so it stays an open
  option, not a dependency): an address in a 2015 dump existed by
  2015. and the operator's own first-sighting log: the first time
  the address hit your system. the cheapest age signal you own.
- never: the creation timestamp. it exists, but only the provider
  and the account owner can see it (google takeout's registration
  data, for the owner). and even a perfect date would be weak: aged
  gmail accounts are a sold commodity, bought precisely to defeat
  age checks. age is the most gameable signal in the family, which
  is why every registry records bounds, never trust.

### domain

- binds: the tld resolves to a thetldradar row (abuse band,
  registration barrier, price economics) and the registrar to a
  boutique row (consumer_boutique, at_cost, privacy_buffer, and
  the rest).
- ages: rdap serves real creation timestamps with full precision:
  njalla.com reads created 1999-09-27t15:04:14z, verified live.
  with coverage semantics: example.xyz reads honestly unknown
  through the bootstrap, and no date served is never evidence of a
  young domain. crt.sh's first certificate and the wayback machine's
  first sighting are independent "active use by" lower bounds.
- adapter-gated: the rdap adapter already ships in thecomposer
  (scripts/rdap-lookup.mjs; it identifies itself with a user-agent
  because rdap.org serves 403 to headerless clients, verified live
  both ways).
- never: registration intent. and some registries will simply not
  serve a date, which stays an unknown, never a suspicion.

### phone

- binds: the number resolves to a thevoipradar row when it is a
  known voip shop's block or an operator-classified hint: tier,
  client model, kyc posture, us sms capability. veriphone gives
  line type and carrier for the rest.
- ages: nothing direct. bounds: shared public receivers have visible
  receive histories with dates; the operator's own first-sighting
  log again. a sip_credentials number from a byod storefront tells
  you the user configured their own client (linphone, an ata,
  asterisk), which is a capability fact and a technical
  self-selection signal, not an age.
- adapter-gated: hlr for line status (key still open);
  us_sms_capability tells you whether a voice otp fallback can even
  complete before you send one.
- never: the number's issue date, and the account's age at the
  provider. both are behind the storefront, forever.

### payment

- binds: the bin resolves to a theccradar row: kind, network,
  number rotation, kyc tether, issuance scope, funding anonymity.
- ages: nothing. static cards are issuer-tethered by nature; the
  tether is the signal, not any date.
- never: cardholder identity. the registries record the tether, and
  the glue never asks for the holder.

## the binding rules

how the bound signals combine, which is the part no single radar
can say on its own:

1. **the tether stack.** the minimum tether across the attempt's
   instruments: how much durable identity stands behind the whole
   attempt. one full-kyc card in an otherwise thin stack is the
   fact a gate can key on; the issuer did the identity work the
   operator never could.
2. **the re-mint cost.** the cheapest instrument to rotate, priced
   by rotation capability and renewal economics: a first-year .xyz
   sale is cheaper than a .com renewal, an on-demand virtual card
   mints faster than a bank-linked one that waits on a deposit.
   the price_observations in thetldradar are re-mint economics, not
   shopping trivia.
3. **coherence (thecomposer v0.3.0, a named designed absence until
   then).** same-provider reuse across attempts, mixed-tether
   stacks, the velocity of re-mints. premature coherence is how
   verdicts sneak in, so the family builds it last and says so.
4. **coverage honesty.** unknown stays first-class: every unknown
   names the adapter that would resolve it (hlr, a bin database, a
   breach corpus), and absence of evidence is never evidence of
   absence, in either direction.
5. **the counter map.** each instrument's counters come from its
   radar's own readme, never invented here: trial gating on the
   payment tether rather than an email blocklist, voice otp only
   when us_sms_capability says the number can receive it,
   bin-blocking classes, re-mint velocity windows.

## the glue, as a signup middleware

the install a bootstrapped saas actually bolts on, five stages:

1. **capture.** the attempt's fields, plus the operator's own
   first_seen per identity string. the first-sighting log is the
   flywheel: every attempt, converted or abandoned, enriches the
   only age signal you own. for payment, store the bin and a
   hashed token, and nothing more than the counters need.
2. **adapters.** rdap for domain age, veriphone for line type, a
   bin lookup for the payment hint, hlr when a key exists. each
   with coverage semantics: a 404 or a missing scope is an
   unknown, never a fact.
3. **the reading.** thecomposer's readOnboarding over the vendored
   snapshots: per-field instrument, tether, rotation, evidence
   freshness with decay, age, explicit unknowns with the adapter
   each one needs, the substitutable surface, per-instrument
   counters, and a provenance commit on every binding.
4. **policy.** the operator's thresholds, in the operator's code.
   the reading never emits a decision: it describes the attempt's
   substitution capacity so a human can price the risk of the
   trial. no fraud score, no verdict, no branding.
5. **loop back.** feed the attempt's outcome into the first-sighting
   log, which makes tomorrow's bounds better than today's.

## a worked example

a signup with a fresh gmail, a fanytel number, a privacy.com card,
and a .xyz domain from a first-year sale. the reading:

- email: mainstream row, tether none, era bound unknown, first
  sighting today
- phone: retail_front, turnkey_web, no_kyc_observed, sms_supported,
  tether none
- payment: bank_linked_virtual_card, on_demand rotation, full_kyc
  tether at the issuer, issuance global
- domain: abuse band high, barrier open, rdap unknown through the
  bootstrap, registrar consumer_boutique on a first-year sale

the binding reads: every field is substitutable, the re-mint cost
is a few dollars and minutes, and the only kyc in the stack is at
the card issuer. counters: gate the trial on the payment tether
(the one place identity work happened), not on an email blocklist;
voice otp is receivable, so it is an option, but the number cost
pennies to mint, so price it accordingly; watch re-mint velocity
across attempts, not identity within one.

and the reading still carries the banner: this is also exactly
what a privacy-conscious solo dev's signup looks like. the glue
prices the attempt; it never judges the person.

## what binding never does

- it never claims intent, crime, or fraud
- it never invents a signal the registries do not carry
- it never parses an era bound into a date
- it never treats an unknown as a fact, in either direction
- it never moves a policy decision into the reading

## the family

- thelocaletell, thephonetell: the address and phone tells
- scamvspam: the two-axis threat quadrant
- theproviderradar, thevoipradar, theccradar, thetldradar: the
  registries, cited and dated, one branch per component
- thecomposer: the pure staged core that binds them, vendored
  snapshots with provenance, fixture-tested
- binding: this document, the contract for the glue

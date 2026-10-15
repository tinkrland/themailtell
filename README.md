# thecomposer

the composition engine of the radar family. the radars are lego
blocks: per-field instrument registries with citations, verification
dates and decay cadences. this component is the glue layer the
composition rule reserves for the integrator, built once, honestly,
as a reference: it reads an onboarding attempt's observable surface,
binds each field to the radar evidence, and composes a reading.

it never emits a verdict. the output is a structured description of
which instruments occupy the form's fields, how fresh the evidence
is, what is unknown, and what the saas side can cheaply do about the
instrument classes it saw. the person behind the form is out of
scope by design, and the composition rule
(docs/composition.md) binds this engine the same way it binds every
integrator: even this engine is a block someone else will plug in.

## the factors, ideated and named

1. **tether depth per field.** what identity stands behind the
   instrument occupying each field: none, a registration, a ladder,
   or a full kyc. the kyc_posture axes of the cc and voip radars map
   here directly.
2. **rotation cost.** how cheaply a fresh instance of the instrument
   mints: on-demand card numbers, consumer-app numbers, public
   receivers. the number_rotation and tier axes.
3. **issuance scope.** who can hold the instrument at all: the
   global-us-card axis, a non-us person holding a us-issued card.
   recorded in v0.1.0 as evidence context, not yet a composed factor.
4. **evidence freshness.** every bound row carries verified_on and a
   recheck cadence. confidence is 1.0 inside the cadence window, then
   decays linearly to zero across one more window, and unverified
   seeds are confidence 0 with the row still legible. staleness is
   priced, not hidden.
5. **coverage honesty.** unknown is first-class: a field with no
   bound instrument is unknown, never disconfirmed, and the engine
   says which adapter would be needed (carrier lookup, bin database)
   to resolve it. absence of evidence is never evidence of absence.
6. **substitutable surface.** the composite: which fields of the form
   are occupied by low-tether instruments, i.e. how much of the
   verification a consumer could re-mint cheaply. it is a capacity
   description of the surface, never an accusation about an
   account: the author of this family is a lawful resident of most
   of these buckets.
7. **counter-capability.** per instrument class, the cheap form-side
   counters documented in the radar readmes: disposable-domain
   blocklists, voip rejection and sms-capability checks, prepaid and
   virtual-card bin blocking, tld reputation lists. counters are
   suggested for the classes actually observed, and every counter
   notes that its instrument has lawful holders.
8. **base-rate sanity.** most people using privacy tools use them in
   good faith. any reading that ignores this is a salem witch trial,
   and the engine is built so it cannot produce one: there is no
   fraud score, no account verdict, no branding. instruments and
   freshness only.
9. **age and era bounds (v0.2.0).** domain age composes from rdap
   adapter findings: structured registration dates with coverage
   semantics, verified live (njalla.com reads 1999-09-27; example.xyz
   reads honestly unknown because the bootstrap served no date, and
   no date served is never evidence of a young domain). email inbox
   age has no public timestamp anywhere: the provider rows' era
   bounds ("@proton.me cannot predate the 2022 domain launch") are
   carried verbatim in the reading, advisory text, never parsed into
   numbers the source does not give. the adapter lives outside the
   pure core (scripts/rdap-lookup.mjs), the parser is pure and
   fixture-tested, and rdap.org serves 403 to headerless clients,
   which the adapter handles by identifying itself.

## cross-field coherence, deliberately absent

v0.2.0 does not correlate fields (same-instrument reuse, mixed-tether
stacks, velocity). coherence needs account-history evidence this
component does not have, and premature coherence is how verdicts
sneak in. it is named here as the v0.3.0 factor so it is a designed
absence, not a forgotten one.

## pipeline

- stage 1, normalize: pure parsing. email to domain and tld,
  payment to bin with a prefix heuristic (a prefix map is not a bin
  database, and the engine says so), phone to digits with the carrier
  explicitly unknown without an adapter.
- stage 2, bind: match the normalized field against the vendored
  snapshots of the four radars, with provenance (commit, schema
  version, export date) carried into the reading.
- stage 3, compose: tether, rotation, freshness, unknowns,
  substitutable surface, counters, non-verdict banner.

snapshots are regenerated with `npm run snapshots` from the radar
branches and are committed with their provenance, so the engine's
evidence is always inspectable and always dated.

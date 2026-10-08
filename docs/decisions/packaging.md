# decision draft: packaging and licensing

status: proposal for the owner. nothing here is decided; this lays out the
tradeoffs and one recommendation so the choice can be made with the costs
visible.

## what is being packaged

the classification core (a pure function over evidence), the evidence
gatherer (dns/doh/https lookups), the provider tables, the generated
disposable snapshot, and the eval harness. the contract requires the
component stay independently runnable and testable, with no imports from any
consuming product.

## options

### a. library (npm package) plus the existing thin cli

the core is already a pure function with zero runtime dependencies; node
dns and fetch are injected. publishing as an esm package fits that shape
exactly. the cli (already built) doubles as the smoke test and demo.

pros:
- the consumer's runtime, scale and data handling stay theirs; no addresses
  ever reach the author's infrastructure.
- versioning travels with the consumer's release cadence; the provider table
  and its as-of date become an upgrade question, which is exactly where
  staleness is already modeled.
- zero marginal infrastructure cost; the honest "no accuracy claim"
  posture matches a library (a hosted service implies an sla the seed
  cannot yet honor).

cons:
- every consumer must wire their own dns (or doh) and decide caching.
- table maintenance shows up as a release chore in each consumer.

### b. hosted api

pros: one place to keep the tables fresh; consumers need no dns.
cons: raw addresses cross an boundary the privacy draft wants to avoid;
scale and rate limits become the author's problem; a service implies
uptime, which contradicts the "no accuracy claim" honesty until the
authorized corpus exists; the per-address privacy story gets materially
worse.

a hosted api is worth revisiting only after real-world verification and
the privacy design are settled, and even then it should front the same
library, never fork it.

### c. vendored copy

consumers copy the core in. pros: no dependency. cons: staleness modeling
breaks (a stale copy still claims), and updates silently diverge. only
reasonable as a stopgap.

## recommendation

publish as an npm library (a) with the cli included, keep the repo as the
source of truth, and revisit hosting later if there is demand. this is the
only option that does not create an implicit accuracy or uptime promise
the current state of the corpus cannot back, and it keeps addresses in the
consumer's hands, which the privacy draft prefers.

## licensing

- the core, scripts and docs: mit (permissive, standard for
  infrastructure libraries; the design brief has no copyleft intent).
- the generated disposable snapshot: upstream is cc0; regenerating it under
  the repo's mit license is compatible, but keeping the generated file's
  header stating its cc0 source and snapshot date (already done) preserves
  provenance honestly.
- the provider tables: they are factual dns observations; facts are not
  copyrightable, and mit on the repo covers the expression.

the license choice is the owner's call; mit is the default assumption used
for the package.json placeholder until changed.

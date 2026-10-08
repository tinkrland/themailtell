# decision draft: privacy for caching, hashing and retention

status: proposal for the owner. the contract already requires that results
carry the domain only, never the local part. this draft extends that to the
operational side: what gets cached, what gets hashed, what gets kept.

## principle

the local part is the sensitive part (it is often a person's name) and the
part the component needs least. everything downstream of input handling
can work from the domain alone: mx/txt/srv lookups, the mta-sts fetch, the
disposable and relay lists, and almost all of the provider table matching.
the only local-part consumers are address analysis (syntax facts and
declared provider semantics), which run locally in the core and never need
to leave the caller's process.

## caching

recommended shape:
- cache key: the punycode domain, not the address. the cache then holds
  routing intelligence only, which is public dns data anyway.
- cache value: the gathered evidence (mx, txt, dkim probes, mta-sts,
  autodiscover) plus its observed_at, not just the final result, so a
  caller can re-run analyze with fresh staleness settings without
  re-resolving.
- ttl: short. dns records change; a forwarding setup moves in minutes.
  recommended default: 300 seconds, configurable. the caller may cache
  longer at the cost of staleness, which the result format already makes
  visible (observed_at and the table as-of dates).
- the cache must be optional and in-memory by default: a no-persistence
  mode (no cache at all) should be a constructor option, not a config
  dance, so privacy-sensitive consumers can get zero-state behavior
  trivially.

## hashing

- hash the domain for cache keys if a shared or logged cache is required
  (e.g. a multi-tenant service). domains are low-entropy (dictionary words,
  brand names), so hashing is obfuscation, not anonymization; say so in
  the docs rather than implying privacy from a hash.
- never hash and keep the local part. a hashed local part in a log is still
  a traceable identifier (dictionary attack against common names is
  trivial), so the honest options are "do not log it" or "log the whole
  address and own that decision". the recommendation is do not log it.

## retention

- raw addresses: never persisted by the library. the gatherer takes an
  address, immediately reduces it to a domain for every network lookup,
  and keeps the local part only in the in-memory evidence object handed to
  analyze. if a consumer wants logging, that is their decision to make and
  their disclosure to write.
- gathered evidence: safe to retain (public dns), and useful for the eval
  corpus; that is exactly what the authorized-corpus workflow does, with
  explicit consent per address.
- nothing else accumulates: no telemetry, no "anonymous" counts, no
  sampled addresses for quality monitoring. a component whose selling point
  is "we do not need to see the local part" must not build the habit of
  collecting it quietly.

## open questions for the owner

- is the default no-cache or 300-second in-memory cache? (recommendation:
  300-second in-memory, zero persistence.)
- should the hosted option (if ever taken) publish a retention statement
  of "no storage of addresses, period"? (recommendation: yes, and mean it.)

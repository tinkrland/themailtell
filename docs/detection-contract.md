# detection contract: evidence before verdicts

this is a design contract, not an implemented api schema or tested service.

## independent responsibilities

1. input handling preserves the address and validates its syntax without
   product-specific acceptance rules or provider-agnostic identity rewriting.
2. domain intelligence identifies known disposable and relay services.
3. routing intelligence examines mx records and maps recognized services to
   mailbox-capable, forwarding, gateway or other infrastructure categories.
4. address analysis reports supported alias evidence and its scope.
5. evidence aggregation exposes signals, uncertainty and contradictions to
   the consuming application. it does not make signup decisions.

external intelligence providers are optional adapters, not the definition of
the component. keep adapter output mapped to a provider-independent contract,
and retain provenance so a caller can understand the basis of each signal.

## proposed result properties

- independent signals for disposable-service evidence, masking/relay-service
  evidence, forwarding infrastructure and alias syntax.
- signal scope: address, domain or provider infrastructure.
- evidence source, observation time and applicable freshness information.
- confidence or evidence strength with explicit meanings; not an invented
  probability or an unvalidated numerical accuracy score.
- unresolved, mixed-routing and contradictory-evidence states.
- a versioned result format once the implementable schema is selected.

these are required concepts, not finalized field names. unknown must remain a
first-class result rather than being silently converted into "dedicated inbox"
or "fraudulent address".

## custom domains and registrar-provided forwarding

a custom domain pointing to a recognized forwarding service can expose its
forwarding arrangement without its domain name appearing on a disposable list.

registration with porkbun, spaceship or any other registrar is not sufficient
evidence. distinguish a registrar's forwarding product from its hosted-mailbox
product and from a customer choosing an unrelated mail host.

if forwarding and mailbox products share infrastructure, routing evidence alone
may not distinguish an individual alias from an inbox. report that limitation.
if mx records point to a security gateway, do not classify the gateway as
forwarding-only merely because it relays messages to another server.

## address-level restraint

- receiving a verification message demonstrates access to delivery, not that
  the entered address has its own mailbox.
- smtp acceptance does not settle whether the destination is an alias,
  catch-all, forwarder or separately stored mailbox.
- a plus sign can be a tagging convention or a literal local-part character;
  report syntax and known provider semantics separately.
- do not globally remove plus suffixes or dots, or rewrite local-part casing
  to infer a common account. provider semantics differ.
- mailbox-capable mx identifies a service's capability, not each address's
  storage arrangement.
- do not attempt to discover the private destination of a forwarded address.

## evaluation before coverage claims

use a labeled corpus of authorized test addresses with known arrangements.
the same domain/provider should include contrasting arrangements wherever
possible, so success cannot be explained by domain-brand shortcuts.

required cases include:

- ordinary dedicated mailboxes at free and paid providers.
- a custom domain using registrar-provided forwarding without its own mailbox.
- a custom domain registered at the same registrar but using hosted mailboxes.
- a custom domain pointed at a known forwarding-only service.
- known masked-relay addresses, including custom-domain relay configurations.
- dedicated mailbox providers with address aliases and plus-tag conventions.
- known temporary/disposable services and long-lived forwarding addresses.
- mixed mail infrastructure, security gateways and self-hosted or unknown hosts.
- missing mx, dns timeouts, stale intelligence, provider outages and conflicting
  adapter answers, with explicit unknown/error results rather than false proof.

record false positives, false negatives and unknown rates by arrangement and
signal scope. detecting a known relay domain does not demonstrate address-level
coverage of aliases at a mailbox provider. do not claim universal dedicated-inbox
detection from a domain-only benchmark.

## privacy and distribution

prefer domain-only lookups when the signal does not need the local part.
external adapters must declare what data they receive. caching and logs should
avoid raw addresses where they are unnecessary; retention, hashing and storage
choices require an explicit design before implementation.

packaging, implementation language, intelligence sources, dataset maintenance,
licensing and hosted-versus-local deployment remain open. consumers must be able
to apply their own policies without modifying the classification core.

back to [the project overview](../README.md).

# themailtell

a standalone email-detection component for applications that need to understand
whether an address appears to use a dedicated mailbox, an alias, a forwarding
service, a masked relay, or a disposable service.

this repository currently contains the design brief only. no detector, hosted
api, provider integration or accuracy claim is implemented here.

## the problem

an address can look like an ordinary business email without having a mailbox
of its own. domain registrars and other services offer custom-domain forwarding:
mail sent to `hello@example.com` is delivered to an existing mailbox elsewhere.

custom domains are often treated as more credible than free mailbox addresses,
but buying a domain does not establish that each address has its own inbox.
conversely, using a free mailbox provider does not establish that an address is
disposable or abusive.

a domain's name, registrar, extension or professional appearance is not the
verdict. the relevant evidence concerns the mail service and routing behind it.

## what themailtell does

- detects known disposable-mail services and known masking/relay services.
- examines public mail-routing evidence, including mx records and recognized
  provider infrastructure, to identify custom-domain forwarding where possible.
- identifies address-syntax features that may indicate aliases, without silently
  rewriting the address or assuming all providers use the same alias semantics.
- distinguishes provider-level evidence from address-level evidence.
- returns uncertainty when the available evidence does not establish an address's
  arrangement. a successful email delivery is not proof of a dedicated inbox.

forwarding, masking, disposable lifetime and mailbox capability are separate
properties. a long-lived forwarding address is not necessarily disposable;
an alias can deliver into a durable mailbox. do not flatten those distinctions
into an unexplained "fake email" flag.

## decoupled by design

themailtell provides classification signals and supporting evidence. consuming
applications decide which arrangements they accept and what to do next.

it does not implement signup eligibility, account creation, authentication,
oauth, messaging integrations, user verification flows, or product-specific
exceptions. its answer must not depend on a user's login method or on the
consuming application's admission policy.

the component must remain independently runnable and testable, with no imports
from any consuming product. reusable core logic and optional provider adapters
are separate; the exact packaging, runtime, licensing and delivery model remain
to be selected.

## limits that matter

recognized forwarding infrastructure can expose routing behind an ordinary
custom domain. this does not imply universal visibility into every individual
address: mailbox providers can host both inboxes and aliases, forwarding can
happen after delivery, and gateways can conceal the final mailbox provider.

unknown infrastructure is not proof of forwarding. mailbox-capable
infrastructure is not proof that a particular address has a separate inbox.
privacy-preserving email use is not by itself evidence of fraud or automation.

the component does not identify the hidden destination mailbox and does not
prove that one address corresponds to one unique human.

## next specification

see [the detection contract](docs/detection-contract.md) for evidence boundaries,
the proposed separation of responsibilities, and the required evaluation cases.

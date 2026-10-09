# email channel: scam vs spam

two axes, never collapsed into one:

- **spam evidence** (bulk, unsolicited): list-acquired addresses,
  bulk-mail infrastructure (esp mass senders), volume-identical
  templates, missing or abused consent trail (list-unsubscribe
  headers, prior-sender relationships)
- **scam evidence** (deception): credential-harvest patterns (login
  urgency, homoglyph domains, lookalike from headers), invoice and
  payment redirection, impersonation of known brands or executives,
  reply-to mismatching the displayed sender

what this channel inherits from the base engine at the repo root:

- relay/forwarding intel (porkbun, improvmx, forward email, firefox
  relay, duck, simplelogin, apple relay, icloud relay) and the mx
  pattern tables
- secondary routing evidence (spf, dkim, mta-sts, autodiscover)
- provider semantics signals and churn hygiene

honest limits stated up front:

- disposable-email and blocklist adapters are future external
  coverage; the offline core cannot see them and will say so
- relay/forwarding infrastructure is infrastructure, not intent: a
  privacy relay is legitimate cover, and a scammer using one is a
  scammer. infrastructure signals get shape findings, never intent
  findings
- the base engine classifies the *email's* infrastructure. whether a
  human was deceived is not observable from headers

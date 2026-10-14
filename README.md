# theproviderradar

a risk registry of email providers. themailtell classifies a single
email; the radar classifies the provider landscape: one row per
provider, every attribute cited, every row dated, decay built in.

the radar rows are bands of cited facts, never verdicts about the
people using a provider. proton and tuta sit at the privacy end of the
radar because their published architecture is zero-access encryption,
not because their users are angels; disposables sit at the abuse end
because their inboxes are public or short-lived, not because every
sender on them is a scammer. infrastructure is not intent.

## what each row carries

- content access posture: whether mail is zero-access or end-to-end
  encrypted by default, e2e available optionally, or accessible to
  the provider by default
- transparency posture: whether the provider publishes a transparency
  report with legal-order statistics
- abuse posture: disposable by design vs a mainstream provider with
  an abuse desk
- jurisdiction, as the provider publishes it
- citations, verification dates, recheck cadences, honest notes

verified rows were read from the cited pages on the date recorded.
unverified seeds are marked verified_on: null and say so, and no
consumer of this registry should rely on one before verifying it
against its citation.

## honest limits

- a privacy-focused provider protects its users from surveillance;
  it does not make them trustworthy. a disposable provider makes abuse
  cheap; it does not prove any particular sender abusive. the row is
  about the provider, never the person.
- relay and forwarding infrastructure (improvmx, porkbun, forward
  email, simplelogin and peers) is classified by mx pattern in
  themailtell itself; the radar cross-references it instead of
  duplicating it.
- tiers are relative bands under each citation's coverage, not
  timeless ranks. providers change architecture, jurisdictions, and
  policies on their own schedule.

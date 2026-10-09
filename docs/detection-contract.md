# scamvspam detection contract

this component extends the themailtell discipline to a cross-channel
question: is this artifact spam (unsolicited bulk), scam (deceptive
intent), both, or unknown?

## the two axes

spam and scam are independent axes, each with its own findings
vocabulary. a single artifact gets a finding on each axis, and the
axes never imply each other. "scam and not spam" (a targeted spearphish)
and "spam and not scam" (an honest bulk newsletter) are both first-class
outcomes, as is "neither" and, always, "unknown".

## shared rules

1. **intent is never asserted.** findings describe evidence shapes and
   their strength, coverage, and observation date. verdicts belong to
   people reading the result.
2. **unknown is first-class.** absence of evidence is a statement
   about the search, never about the artifact.
3. **infrastructure is not intent.** relays, mailboxes, voip ranges,
   and forwarders get shape findings. what someone does with
   infrastructure is separate evidence or none.
4. **evidence decays.** every signal ages through staleness decay; a
   two-year-old blocklist hit is downgraded, not trusted.
5. **adapters carry coverage.** external checks (blocklists, hlr,
   validation) report full or partial coverage; the offline core
   reports none and says so.
6. **fixtures prove consistency only.** accuracy claims require the
   authorized corpus: confirmed-controlled or operator-published
   ground truth, never edited to make a case pass.

## channel scopes

see `email/README.md`, `address/README.md`, `phone/README.md`. each
channel states its inherited evidence base and its honest limits.

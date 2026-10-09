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

## schema 0.1.0: the engine and the quadrant map

the engine lives in scamvspam/ (its own package: the base email engine
at the repo root stays untouched). per axis the vocabulary is the
house vocabulary: unknown (nothing was evaluated), no_evidence_found
(the axis was searched at real coverage and nothing was found; it is
reached only through a nothing_found signal, never by silence), and
evidence_found.

the quadrant is mechanical, never a judgment: scam_and_spam,
scam_not_spam, spam_not_scam, neither, and unplaced whenever either
axis is unknown. 'neither' always carries the neither_is_about_this_search
limitation: it is a statement about this search under this coverage,
never a safety guarantee.

the map (scamvspam/scripts/quadrant-html.mjs) is a rendering of
analyze(), never a second analysis: evidence_found places at 0.78,
no_evidence_found at 0.22, unknown refuses to place.

## schema 0.2.0: the quadrant model

per owner direction, 0.1.0's two-independent-axes model is replaced:
spam and scam become the two ends of one intent axis, and a second
operation axis (automated <-> human-operated, where automated covers
bots and adversarial ai) crosses it. the poles keep the house
vocabulary: unknown, no_evidence_found (only via an explicit
nothing_found signal, never by silence), evidence_found.

placement is mechanical and refuses to guess: an axis places only when
both its poles are known. both-found lands mid-axis (spam_and_scam,
hybrid), both-searched-empty lands at neither. the quadrant is the
four corners (scam_human, scam_automated, spam_human, spam_automated)
plus mixed for any center placement, and unplaced whenever either axis
is unknown. centers carry the mixed_placement and
neither_is_about_this_search limitations: they are statements about
this evidence under this coverage, never safety verdicts.

the map (scamvspam/scripts/quadrant-html.mjs) renders this: x spam to
scam, y automated to human, poles at 0.22/0.78, centers at 0.5.

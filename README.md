# scamvspam

scam vs spam intelligence, across three channels: email, address, phone.

the quadrant this component exists to place things on:

- **the intent axis: spam <-> scam.** spam is unsolicited bulk (a
  volume and consent claim); scam is deceptive intent (a fraud claim).
  they are the two ends of one axis, and the middle is real: a
  phishing blast is both, and lands mid-axis honestly.
- **the operation axis: automated <-> human-operated.** automated
  covers bots and adversarial ai; human-operated covers live
  operators, from boiler rooms to solo fraudsters. hybrid is real too:
  scripted openers adapted by a human land mid-axis.
- **the four corners:** human fraud (scam x human: bec, spearphishing,
  romance), bot fraud (scam x automated: ai phish blasts, voice-clone
  calls), human hustle (spam x human: hand-sent unsolicited outreach),
  bot spam (spam x automated: robocalls, bulk mail).

the channels share one discipline:

- intent is never asserted as fact. a finding is always "the evidence
  pattern matches known fraud shapes, at this strength, under this
  coverage, observed on this date", never "this is a scam". people
  make the verdict; the component organizes the evidence.
- **unknown is first-class.** absence of evidence is never evidence of
  absence, and a clean-looking message/address/number is a statement
  about the search, not a safety guarantee.
- evidence carries strength, coverage, and observed date, and decays
  through staleness like every other fact.
- anything unknown on either axis refuses to place: unplaced is
  first-class, and centers are honest placements, not hedges.
- fixture corpora prove consistency only; accuracy claims require the
  authorized corpus.

## layout

- `email/` — phishing and fraud signals vs bulk-mail signals, built on
  the base engine in this repo's root (relay/forwarding intel, mx
  patterns, secondary routing evidence)
- `address/` — freight-forwarder abuse, mule and money-drop patterns,
  fabricated addresses; built on the shape intelligence maintained on
  the `thelocaletell` branch
- `phone/` — wangiri, spoofed-number fraud, robocall bulk vs fraud
  scripts; built on the numbering-plan and carrier intelligence on the
  `thephonetell` branch

each channel folder states its own scope and its honest limits.

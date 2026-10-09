# scamvspam

scam vs spam intelligence, across three channels: email, address, phone.

the distinction this component exists to make:

- **spam** is unsolicited bulk. the harm is volume and consent: mass
  marketing, newsletter blasts, list-acquired addresses. it is a claim
  about *how many people got the same thing without asking*.
- **scam** is deceptive intent. the harm is fraud: credential
  harvesting, invoice fraud, impersonation, goods never shipped. it is
  a claim about *what the sender is trying to take from you*.
- the same artifact can be both, one, or neither, and the two labels
  never imply each other. a phishing email sent to ten people is a
  scam and not spam by volume; a newsletter you never signed up for is
  spam and not a scam.

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

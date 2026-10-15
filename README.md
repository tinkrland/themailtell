# thevoipradar

a risk registry of voip providers. thephonetell reports a number's line
type as voip, flatly, and that is correct and blind: it says nothing
about which shop sold the number or what that shop verified about the
buyer. this radar differentiates inside the voip class, the way
theproviderradar differentiates inside email providers.

the axes:

- **tier**: upstream carrier (twilio, bandwidth: the pipes others
  resell), retail front (fanytel and peers: consumer storefronts that
  sell numbers, often riding those same pipes), consumer app (textnow,
  google voice, burner: end-user products with an app in front)
- **kyc posture**: what the shop actually verifies about the buyer
  before handing over a number: full kyc, identity-light (an account
  and a payment method, no documents), or no kyc observed
- **kyc scope**: kyc claims are tiered and jurisdictional. twilio's
  verification is real but product-tiered: toll-free verification
  before messaging, country-specific regulatory bundles, australia's
  scam prevention framework kyc, while a bare us local number purchase
  is lighter. reading "twilio" as uniformly kyced would overstate, and
  the registry carries the scope, not just the label

## the resale reality

retail fronts often resell the same upstream carriers without adding
any verification of their own. the same underlying carrier network can
sit behind a kyced front and an anonymous one, so the upstream's
compliance posture and the front's are two different facts, and this
registry records both.

## honest limits

- a kyc posture is a fact about the shop, never about any caller. a
  verified twilio buyer can be nefarious; an anonymous fanytel caller
  can be someone's grandmother wanting a second line. infrastructure
  is not intent.
- "no kyc observed" means no verification was found in the pass that
  read the provider's own pages. it is observed absence, recorded with
  its date, not proof that no check exists anywhere in their flow.
- anonymous numbers are also a privacy tool: dissidents, whistleblowers
  and domestic-abuse survivors use them for the same architecture that
  abusers do. the row records the architecture, never the user.

## the us sms wall and the voice otp fallback

an owner-reported capability wall, carried with its verified
anchors: many voip stacks sell us numbers for calls but cannot
deliver sms to them at all, a2p compliance being the wall (livekit's
own docs describe its us numbers as for voice applications; no sms
product surfaced in the pass that looked). platforms that offer
voice-call otp as a fallback let a voice-only number complete
verification anyway: voice otp is a standard channel, delivered by
automated call (secureauth documents delivery via twilio, vonage and
teleseign; otp.dev calls it the most universally accessible
verification channel, no smartphone needed), and voip numbers
commonly cannot receive otp sms in the first place (zuper warns its
own voip users about it). the axis records capability per provider,
never accusation: people call the otp to themselves for reasons as
ordinary as a broken sim slot.

## the posture, stated plainly

this radar reads adversarially, not morally. the rows were named by an
owner who is a paying user of this exact class of services, proton on
the mail side and a no-kyc voip number on the phone side, for ordinary
privacy: that is the point. the same architecture that serves a
legitimate privacy user is what an adversary would choose too, and a
radar that cannot describe the architecture without judging the user
would be worthless. handing all your data to tech giants to look
trustworthy would be the foolish posture, not the privacy-conscious
one. infrastructure is not intent, in every row, by construction, and
no radar is read alone: a decision combines signals from multiple
radars, never in a vacuum.

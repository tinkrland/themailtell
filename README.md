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

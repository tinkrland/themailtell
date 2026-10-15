# thevoipradar detection contract

this component extends the family discipline from line-type
classification (thephonetell) to a voip provider registry. the rules
carry over:

1. one row per provider: tier, kyc posture, kyc scope, market, each
   cited and dated, recheck cadences attached, honest notes verbatim.
2. kyc posture is scoped, never a flat label. what is verified, for
   which product, in which jurisdiction, is the fact; "kyc_required"
   without scope would overstate.
3. "no kyc observed" is observed absence with a date, never proof of
   absence everywhere in the provider's flow.
4. unknown is first-class and recorded as unknown.
5. a provider row is never a verdict about a caller: infrastructure
   is not intent. the same anonymity that shields an abuser shields a
   whistleblower.
6. resale structure is recorded: a retail front riding an upstream
   carrier is a different fact from the upstream's own posture, and
   both are carried.
7. when an engine lands on this branch, fixture passes prove
   consistency only; accuracy claims require the authorized corpus.

# theproviderradar detection contract

this component extends the themailtell discipline from per-artifact
classification to a provider-level registry. the rules carry over:

1. every row is a set of cited facts with a verification date and a
   recheck cadence. verified_on: null marks an unverified seed, and an
   unverified seed is never relied on, only flagged for verification.
2. the registry organizes what a provider IS: architecture, published
   transparency, abuse posture, jurisdiction. it never asserts what a
   sender using that provider is doing. infrastructure is not intent.
3. bands are relative and dated. "privacy end of the radar" is a
   statement about published architecture under a citation, not a
   moral rank, and it decays through the same staleness rules as every
   table in this family.
4. unknown is first-class. a missing attribute is recorded as unknown
   with its reason, never guessed.
5. when an engine lands on this branch, fixture passes prove
   consistency only; accuracy claims require the authorized corpus.

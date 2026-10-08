# detection contract

what thephonetell does and, deliberately, does not do.

## does

- takes an e.164 string (or a close variant; the input is never rewritten)
- parses and validates offline through an injected parser (libphonenumber-js)
- reports line-type signals: mobile, landline, fixed voip, non-fixed voip
- reports virtual-number signals from numbering-plan ranges, known
  provider shapes, and community lists
- reports format validity with honest invalid reasons
- accepts an optional declared voip flag and returns a comparison signal:
  agree, disagree, unknown. it never trusts the declaration

## does not

- never verifies ownership or anything else: verification (otp, callback)
  is the consumer's job, not this component's
- never treats a number's market as evidence about the person holding it
- never merges fixed voip and non-fixed voip into one voip blob: they are
  distinct signals with distinct meanings
- never turns unevaluated checks into clean verdicts: coverage "none"
  keeps findings unknown
- never edits a withdrawn range out of history: withdrawn rows report
  their withdrawal and decay instead of asserting

## evidence model

every signal carries:

- scope: number, range, provider, or adapter
- strength: recognized (verified row, adapter with coverage), suggestive
  (unverified seed, community list, partial coverage), unresolved (stale
  or withdrawn evidence, kept visible, never silently trusted)
- coverage: for adapter signals, what the adapter actually evaluated
- observed_at and, where applicable, a citation and withdrawal date

## states

- signals_present: at least one recognized signal
- mixed_evidence: only suggestive signals
- contradictory: honest disagreement between stages, for example a ported
  number whose numbering-plan range still maps to its old line type
- unknown: nothing found. unknown is first-class and routes to human
  review, never to a verdict

"no evidence found" is always a statement about the search, never a
verification of the number, its line type, or its holder.

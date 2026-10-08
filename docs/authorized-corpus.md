# the authorized corpus

the fixture corpus proves consistency only: its cases and the
intelligence tables share an author, so they agree by construction. the
errors that matter, a carrier format that changed, a po box vocabulary
entry that misses a real address, a pattern that fires on a real
customer's street address, are only observable on real addresses.

## what belongs in the corpus

authorized real addresses only: your own, family addresses you have
permission to use, or addresses explicitly published by operators for
this purpose. one address, one case, with:

- the shape ground truth written before running anything,
- the contrast pair next to it: the same operator's po box vs a genuine
  street address; a pbsa-style secondary unit vs a genuine street
  address; a locker vs a nearby street address,
- expectations on signals, state, shape findings and limitations,
  never edited to make a case pass.

## how to add cases

1. copy data/corpus-input.example.json to data/corpus-input.json
   (gitignored).
2. add labeled entries: the address as given, the market, the known
   shape and the expected outcome.
3. run `npm run corpus`. the script writes data/authorized-corpus.json
   (gitignored) in the eval case format, deriving expectations from the
   labels you wrote.
4. run `npm run eval`. the runner merges the authorized corpus
   automatically and reports per-shape rates and separate failure kinds:
   false positives, false negatives, wrong states, wrong findings and
   missed limitations, with unknown-state results counted separately.
5. never edit an expectation to make a case pass. if a case fails, the
   case is right and the code or table row is wrong, or the ground truth
   was wrong all along; fix the source of the disagreement.

## what the corpus is not

- it is not a license to claim accuracy. rates from a handful of
  addresses are not "99 percent detection"; report the counts, the
  pairs and the unknowns as they are.
- it is not a place to put other people's addresses without permission.
- it is not a policy artifact: nothing in it says what a signal means
  for any consuming application.

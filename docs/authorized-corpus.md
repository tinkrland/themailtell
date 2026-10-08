# authorized corpus

the component makes no accuracy claim without the authorized corpus. the
fixture suite proves consistency only.

## what may enter the corpus

- numbers you own or explicitly control: your handset, a virtual number
  you bought, a family landline with the holder's consent
- operator-published example numbers, marked as such in ground truth; the
  builder requires authorization "operator-published" and the operator's
  own page url inside the ground truth notes (the url is the authorization)
- attempted sources on 2026-10-08, all blocked, so no operator-published
  case is seeded yet: ofcom's drama-numbers page (ofcom.org.uk 403s to
  automated reads; the parent numbering page, already cited in the gb
  table, confirms drama ranges exist but does not enumerate them), the
  nanpa 555-01xx fictional-range page (url moved), and twilio's magic
  test-number docs (urls moved). seeding awaits readable first-party
  sources; unverified ranges stay out of the corpus rather than entering
  as guessed ground truth
- nothing else: scraped lists, purchased lists, or any number whose holder
  has not authorized the use are out of bounds

## ground truth discipline

- ground truth is written before running anything: the line type as you
  actually know it, in your own words, never in the component's vocabulary
  (no "evidence", "signal", "finding" in ground truth notes)
- contrast pairs are required: a real mobile and a virtual number in the
  same national range; a fixed voip line and a genuine landline; a ported
  number whose range still maps to its old carrier
- never edit an expectation to make a case pass. if the component is wrong,
  the component is wrong, and the case is the proof

## what is measured

per market and per signal:

- false positives: a line-type or virtual-number claim that is not true
- false negatives: a missed line-type or virtual-number shape
- unknowns: cases where the component honestly reported unknown; unknowns
  are not failures, they are the component telling the truth about what
  its tables and adapters could not see

## recording adapter evidence

carrier adapter results (for example a twilio lookup response) may be
recorded as fixture evidence in corpus-input.json with their observation
date, so the corpus measures against recorded evidence instead of a live
api. recorded evidence ages like every other row.

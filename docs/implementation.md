# implementation notes

## architecture

pure staged core, mirroring the themailtell shape:

1. input handling (`src/input/parser.ts`): an injected parser built on
   libphonenumber-js. validates offline, produces honest machine reasons
   for invalid inputs, never rewrites the number
2. numbering-plan intelligence (`src/stages/numbering-plan.ts`):
   deterministic per-market range matching against regulator tables.
   longest prefix wins. withdrawn ranges decay rather than assert
3. carrier / line-type stage (`src/stages/carrier-intelligence.ts`):
   consumes adapter evidence gathered outside the core. fixed voip and
   non-fixed voip are distinct. coverage "none" keeps findings unknown
4. provider intelligence (`src/stages/provider-intelligence.ts`): known
   virtual-number providers and community list snapshots. most consumer
   voip apps are invisible to range detection and their rows say so
5. aggregation (`src/stages/aggregation.ts`): shape findings, state,
   declared comparison, limitations

the core is pure: no network, no clock. `now` is always an explicit
option. the evidence boundary (`src/evidence.ts`) runs the injected
parser and adapters and hands evidence to the core.

## tables

`src/markets/` holds one file per market; `src/markets/index.ts` registers
them. adding a market is a new file plus one line in the index: additive
table rows, never code changes in the stages. dk is unseeded by design; do
not add it.

every numbering-plan row carries its regulator citation and a
verification date, or an honest null for unverified seeds. rows age
against `max_age_days` and downgrade from recognized to unresolved when
stale. withdrawn rows are permanently unresolved and report their
withdrawal date (ireland's 076 voip range, withdrawn by comreg in january
2022, is the canonical case).

prefixes are national significant number prefixes: no trunk zero, no
country code.

markets where the numbering plan encodes no line-type signal (us, ca) or
where mobile and landline share area codes (mx, br, co) carry honest
notes instead of invented ranges, and line type there is an adapter
question, never a range question.

## providers and community lists

`src/providers.ts` seeds the known virtual-number providers. most rows
have `prefixes: null` on purpose: their numbers are drawn from ordinary
national blocks and local detection cannot see them. the table documents
the detection gap honestly. twilio's line type intelligence documentation
names google voice and enflick (textnow's parent) as non-fixed voip
examples, which verifies those rows' service class.

community lists (numbers observed on public sms-receive websites) are
snapshots: each carries its date and ages on its own schedule. the seed
is empty; populating it requires a recorded snapshot with its source.

## evaluation

- `npm test`: unit checks for schema, stages, decay, coverage semantics,
  distinct voip signals, declared comparisons
- `npm run eval`: fixture corpus in `src/eval/corpus.ts`, contrast pairs
  and honest unknowns, failures classified by kind. fixture passes prove
  consistency only
- `npm run corpus`: builds `data/authorized-corpus.json` from authorized
  `data/corpus-input.json` (see docs/authorized-corpus.md); accuracy
  claims require this corpus and nothing else

## portability

`npm install && npm test` on any host with node 18+. the only dependency
is libphonenumber-js, pure javascript, offline. no secrets, no network
calls in tests or eval.

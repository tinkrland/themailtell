# building the authorized corpus

the fixture corpus proves the tables agree with themselves. this corpus is
the only thing that can show they agree with reality, because the expected
answer comes from an arrangement you know, not from the tool.

## workflow

1. copy `data/corpus-input.example.json` to `data/corpus-input.json` and
   replace the placeholder rows (drop the `_example` flag as you go).
   add `data/corpus-input.json` to `.gitignore`: it holds real addresses.
2. for each row, set `arrangement` from what you *know* is true, and say in
   `ground_truth_source` how you know it. write this before running anything.
3. run `node scripts/build-corpus.mjs` (or `npm run corpus`). it records live
   MX records and writes `data/authorized-corpus.json` with expectations
   derived from your label. mx lookup falls back to dns-over-https when
   udp/53 is blocked, so the builder works on restricted networks too.
4. run `npm run eval`. real cases are merged, reported by arrangement,
   and the runner says how many ran.

## rules that keep it honest

- only addresses and domains you own or are authorized to test.
- never edit an expectation to make a case pass. a failure is data:
  - false negative on a *recognized* provider: the table is missing or wrong.
  - false positive on a contrast case: the table claims more than it knows.
  - a failure on a provider you know is not in the table (e.g. spaceship
    forwarding) is a coverage gap, not a bug. record it, then research it.
- keep pairs. the contract's main risk is brand shortcuts, so every registrar
  you test should have a forwarding case *and* a hosted-mailbox case.
- re-run the builder periodically; MX records and products change, and
  `observed_at` is the date you looked.

## cases worth collecting first

| pair | why it matters |
| --- | --- |
| porkbun forwarding vs porkbun hosted inbox | tests whether `fwd1/fwd2.porkbun.com` are forwarding-only or shared |
| porkbun domain on google workspace | same registrar, third arrangement |
| spaceship forwarding vs spacemail | spaceship forwarding hosts are not in the table yet |
| cloudflare email routing | forwarding service with no mailbox |
| gmail address vs `name+tag@gmail.com` | syntax fact and provider semantics stay separate |
| a masked relay address (apple, firefox, duckduckgo) | domain-list path |
| a domain behind a security gateway | gateway never classed as forwarding-only |
| a self-hosted domain | the honest answer is unknown |

## to check a domain by hand

```sh
dig +short MX yourdomain.com
```

the hostnames in that output are exactly what the tool matches. if a
forwarding case and a hosted-mailbox case at the same registrar return the
same hostnames, that provider belongs in `SHARED_INFRASTRUCTURE_ENTRIES`.

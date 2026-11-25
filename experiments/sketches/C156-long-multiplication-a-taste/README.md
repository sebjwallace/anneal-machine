# C156 · Long multiplication, a taste

A short run for an early indication. On long-multiplication pages (a two-digit multiplier written as on paper), C155's
step gets the first row wrong from the second column. It carries the multiplier by writing it to the left, but that
place holds the multiplier's next digit, so it multiplies by the wrong one. Over two seeds, the search found nothing that
settles; only coincidences fit (a multiplier ending in 1, or two equal digits, about 10% at test), and single-digit
multiplication stayed 100%. The indication is that long multiplication needs the multiplier held in the circuit while
a row runs, not written on the page: the first time a procedure itself has called for held context.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js`, `circuit.js`, `lanes.js` (C155's) · `learn.js` (C155's learner on the long pages, with the proposer
  constraint) · `rows-*.json` (both seeds).
- Run: `SEEDS=2 SHARD=0/2 node learn.js` and `SHARD=1/2` side by side (about twenty minutes), then
  `SEEDS=2 REPORT=1 node learn.js > out.txt`.

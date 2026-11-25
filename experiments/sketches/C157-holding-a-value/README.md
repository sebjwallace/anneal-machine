# C157 · Holding a value

A hold offered as a part a step can have: a read picked up once at the start and kept on while the step runs. The long
pages picked it (by varied replay: the learned step with the multiplier held) in every seed, and no hold ever fitted an
addition or subtraction. But the store never gave the hold step back. With the multiplier held, the step's pass-on
does nothing, so every long row bound the hold step with all its pass-ons alike, and those equal variants tie for ever.
The store ended with the read step in 5 seeds and nothing in 5; no seed was right on all four kinds. The first
obstacle is that a step must have every part, even unused ones. Behind it is the expected rivalry between two steps
that can't replace each other.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C156's) · `circuit.js` and `lanes.js` (holds: pick-up, held value, gates into the slot; holds in the
  store) · `learn.js` (varied replay; twelve examples; the test on four kinds) · `smoke.js` (a build check) ·
  `rows-*.json` (every seed).
- Run: `SEEDS=10 SHARD=0/2 node learn.js` and `SHARD=1/2` side by side (about an hour and a half on two cores), then
  `SEEDS=10 REPORT=1 node learn.js > out.txt`.

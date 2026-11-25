# C155 · Times one digit

Multiplication by a single digit on the same circuit and in the same store as addition and subtraction: a third fact
family (a × b + k, carries up to 8), a third sign, the multiplier written once like the sign, and a pass-on write in
the step. Every seed learned one step for all three kinds, the C154 step plus passing the bottom digit on to its left
(nothing happens in additions and subtractions, but it carries the multiplier in a multiplication), and it was 100%
right on all three at 4 to 8 digits. The multiplication was found by replaying the steps the store already held, not
by search. The hypothesis's first stage A design failed a build check and was revised before the main run.

- [hypothesis.md](hypothesis.md) (with its revision) · [findings.md](findings.md) · [out.txt](out.txt) ·
  [build-check.txt](build-check.txt) · [build-check-2.txt](build-check-2.txt)
- `engine.js` (C154's copy) · `circuit.js` (Π facts, "×", the pass-on write) · `lanes.js` (pass-on into a lane's own
  copies; reading the store's steps for replay) · `learn.js` (replay, stages A, B1, B2, the test; shards) ·
  `smoke.js` (a build check) · `rows-*.json` (every seed).
- Run: `SEEDS=10 SHARD=0/2 node learn.js` and `SHARD=1/2` side by side (about fifty minutes on two cores), then
  `SEEDS=10 REPORT=1 node learn.js > out.txt`.

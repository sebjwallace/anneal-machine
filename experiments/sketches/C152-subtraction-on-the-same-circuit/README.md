# C152 · Subtraction on the same circuit

C151's circuit given worked subtractions with borrowing alongside worked additions, with subtraction facts beside the
addition facts and the family as a learned part of the step. The lanes found and settled the right subtraction step in
every example (120 of 120), with addition's shape, and on its own it subtracts 4 to 8 digit numbers 100% right. But the
two procedures share four of their seven parts, and wherever they share parts the memory loses track of which one is
running: in the store, recall after a shared part goes to whichever has been bound more (a hybrid, or nothing on a
tie), and in the circuit the other step's state completes from the shared parts and both run at once (0%). The sign
starts a procedure but doesn't stay with it.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt) · [circuit-check.txt](circuit-check.txt) · [probe.txt](probe.txt)
- `engine.js` (C151's copy) · `circuit.js` (two fact families keyed by family cells; any number of signed steps bound
  in) · `lanes.js` (a family cell per lane; binding under the example's sign) · `learn.js` (alternating worked examples,
  candidates with family and "from", the arms, the test; shards) · `circuit-check.js` (the two steps bound in by hand)
  · `probe.js` (the store alone) · `rows-*.json` (every seed).
- Run: `SEEDS=10 SHARD=0/2 node learn.js` and `SEEDS=10 SHARD=1/2 node learn.js` side by side (about fifty minutes on
  two cores), then `SEEDS=10 REPORT=1 node learn.js > out.txt`.

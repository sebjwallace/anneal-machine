# C142 · Column addition

The first test of an algorithm. From six worked examples of 2- and 3-digit sums laid out in a grid (carries above,
answer below), the memory learns the per-column step (what to read, where to write the units and the carry, which way
to move), stores it, and recalls it from "+" alone. Run with the engine's own moves (C141's gates) on sums of 4 to 8
digits at a new position: 4,000 of 4,000 exactly right, every run stopping by itself after exactly the answer's digits.
Repetition comes from the step fitting again after each move, not from a counter. Trained on sums without carries, it
almost always fails. The facts, the search and the loop that re-applies the step are given; the ledger says exactly
what.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C141's copy, unchanged) · `columns.js` (the world, the step, the arms; GIVEN and ENGINE marked). Run:
  `node columns.js > out.txt`.

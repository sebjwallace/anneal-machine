# C141 · A gate for each step

Follows C140, where the engine could not turn "column 5, move right" into column 6 because arriving at a column and
leaving it tied. Here each step of a walk is stored as a gate: key {where the walker was, the move}, target where it
arrived (one new shape in the engine copy). Single steps: 30 of 30 exact (0 of 30 with the old shapes). Chains of
moves: exact at every moment. C140's subtraction test rerun with places reached by the engine's own moves: 100% right
at unseen positions when the walk covers the row, and no answer at all where the engine has never learned to move. The
columns are still a location code under the moves; keying steps on what is seen is the next step.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C140's copy plus the gate shape) · `gate.js` (the walk, the probes, the rerun; GIVEN and ENGINE marked).
  Run: `node gate.js > out.txt`.

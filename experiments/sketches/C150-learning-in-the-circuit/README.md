# C150 · Learning in the circuit

The step is learned by the circuit that runs it. Worked examples are written into the space in full; candidate steps run
in lanes of C149's circuit over them; every write meets the working already written (same digit: cooled; different or
empty: a misfit). The candidate that makes no misfit and cools all the working is kept. All 20 seeds learned the right
step by the first or second example, and bound into C149's circuit it added 4 to 8 digit numbers 100% right, stopping by
itself. There is no separate checker: running the step is the test. Still the experiment's: proposing candidates,
reading off "no heat left", choosing among ties and binding the winner.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C149's copy) · `circuit.js` (C149's circuit) · `lanes.js` (lanes of the circuit over a worked example) ·
  `learn.js` (stages A and B, the arms, the test). Run: `node learn.js > out.txt` (about ten minutes).

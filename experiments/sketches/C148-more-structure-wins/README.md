# C148 · More structure wins

The jam behind failures in C139, C140, C143 and C147: once a wrong step is bound, binding the right one later never
wins. Two changes together fix it: every binding uses the same cells (so the same step learned again is the same
structure again), and in competition the structure that exists more times wins among rivals at the same support (one
rule added to the engine). Probe: wrong once, right twice now recalls the right step (before: no answer). C147's rule B
rerun: 100% (was 95%). Neither change works alone. Being wrong is more structure, and it is outcompeted; nothing breaks.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C147's copy plus copies counting, `poolCopies`) · `more.js` (C147's column addition with the two switches,
  the probe). Run: `node more.js > out.txt` (about 35 seconds).

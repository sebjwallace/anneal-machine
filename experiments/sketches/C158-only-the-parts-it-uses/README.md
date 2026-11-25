# C158 · Only the parts it uses

Steps may leave out their sign write or pass-on, with no rule preferring the smaller. The hold step from C157 came back
as one structure without its useless pass-on, and when recalled it got long-multiplication first rows 100% right, the
first time. But the read step lost its pass-on too, even where single-digit multiplication needed it: a probe shows the
store recalls the leaner of two overlapping frames whatever the counts (what both share wins where they part). The
store now flips between the read step and the hold step, and no seed was right on all four kinds. Next: what picks
between two frames that can't replace each other.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt) · [probe.txt](probe.txt)
- `engine.js` (C157's) · `circuit.js` and `lanes.js` (steps of different lengths) · `learn.js` (every step tried with
  and without its last two writes) · `smoke.js` (a build check) · `probe.js` (the store alone) · `rows-*.json`.
- Run: `SEEDS=4 SHARD=0/2 node learn.js` and `SHARD=1/2` side by side (about fifty minutes on two cores), then
  `SEEDS=4 REPORT=1 node learn.js > out.txt`.

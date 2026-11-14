# C76 · Composition by binding a sample

The owner's idea: compose parts by binding a small sample of their active cells (each sampled cell grows one segment over
the other sampled cells), so that any one part brings back the rest. A simulation of cells, columns and segments.
Hypothesis, predictions, findings: [hypothesis.md](hypothesis.md), [PREREG.txt](PREREG.txt), [findings.md](findings.md).

**Run:** `node run.js` (under a minute; `SEEDS=1` is the development seed).

**In short:** with segments firing at two active links, binding two cells per part is the smallest binding that
completes, and also the cleanest: 30 links per composition against 132 for wiring everything, the whole composition back
every time, far fewer intrusions, about a fiftieth of the work. One cell per part never works. As memory fills,
recall starts spreading into other compositions; competition within columns doesn't stop it.

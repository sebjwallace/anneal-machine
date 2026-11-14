# C74 · Answers without K

C73 with the cap of K = 8 columns removed: the answer is the column winners at the top level of support, one shared level
of inhibition. Everything else is C73's (C71's world, storage, probes and scoring). Hypothesis, predictions and findings:
[hypothesis.md](hypothesis.md), [PREREG.txt](PREREG.txt), [findings.md](findings.md).

**Run:** `./runall.sh` (about 20 minutes, two runs at a time, each about 1.5 GB). A single run:
`CPC=8 MODE=seg SEGN=all ANNEAL=3 node sketch.js`. `ANNEAL=4` is the comparison (within half of the top).

**In short:** answers size themselves (7.6 cells, an assembly is 8), whole memories compete with no list, and half a cue
completes as well as a whole one (71-87%), matching summed links at 8-16 cells per column and far better where cells
are scarce, with almost no blends. A few points of recall are lost to refusals.

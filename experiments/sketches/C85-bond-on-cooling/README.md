# C85 · Bond on cooling

The owner's [flow and heat](../../../docs/theories/flow-and-heat.md) premise as rules: a memory explains an input only if it
explains at least as much as it claims that isn't there (RM-9's prices); one-offs stay loose and are cleared when cells
run short; bonds freeze by returning. On C84's world. Hypothesis, predictions, findings: [hypothesis.md](hypothesis.md),
[PREREG.txt](PREREG.txt), [findings.md](findings.md).

**Run:** `node run.js` (about four minutes a seed; `SEEDS=1` for the development seed, output `dev.txt`). The test
seeds were run one per process (`seed-101.txt` to `seed-105.txt`) and pooled with `node pool.js` into `out.txt`. The
core's tests on each arm: `ARM=core|pays|pays-squeeze|cooling node --test test/volume.test.js`.

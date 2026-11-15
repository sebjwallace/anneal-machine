# C82 · Rebinding a variable

A copy of the core (`engine/`, from `src/engine/` on 15 November 2026) with one change: a joint that brings back what
the input has replaced loosens by one segment per cell. Two variables, ten values, a thousand rebindings. Hypothesis,
predictions, findings: [hypothesis.md](hypothesis.md), [PREREG.txt](PREREG.txt), [findings.md](findings.md).

**Run:** `node run.js` (a few seconds; `SEEDS=1` is the development seed). `node house-and-shed.mjs` for the side check.
The core's tests on this copy: `LOOSEN=1 node --test test/volume.test.js` (and `LOOSEN=0` for the copy as the core).

**In short:** with the change, "x" alone brings back exactly its current value after any number of rebindings (100%),
and structure stays flat. The core brings back all ten values. But the rule is symmetric: binding "y" to the value "x"
holds breaks "x"'s bond (91% exact when values are shared). And it forgets a whole built once from known parts
("ABCD" after "AB" and "CD") as soon as "ABEF" arrives.

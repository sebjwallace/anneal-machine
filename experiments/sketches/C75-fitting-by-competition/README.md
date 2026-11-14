# C75 · Fitting by competition alone

The engine's fitting reruns its competition (the biggest saver takes its cells, rivals recount) once from every possible
opening placement. Here it runs once, optionally re-settling only where a winner left cells claimed but not lit. A copy of
`src/engine/see.js` ([engine-see.js](engine-see.js)); the core is untouched. Hypothesis, predictions, findings:
[hypothesis.md](hypothesis.md), [PREREG.txt](PREREG.txt), [findings.md](findings.md).

**Run:** `node run.js` (about 5 minutes; `SEEDS=1` is the development seed; `ARMS=search,settle` to choose arms).

**In short:** competition alone matched today's fit on 1,495 of 1,500 scenes and learnt exactly the same, with about a
fortieth of the work. Re-settling where heat was left matched all 1,500, and the engine's test suite, except completion
with hidden parts (better when not told where, a hair worse on one figure). The search over openings was almost pure
overhead. Whether to bring it into the core is the owner's decision.

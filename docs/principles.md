# Principles

The rules every change to the engine is held to. `docs/state.md` explains why each one matters.

1. **One rule.** Keep whatever makes the whole description cheapest. Energy = structure + flow (+ change, when pictures come in sequence). A change is kept only if measured energy falls.
2. **One currency, from the world.** A loose or wrong pixel costs 1, a stored pixel 1, and a placement 1 plus the cost of naming which part. No hand-set weights.
3. **Compare, don't average.** Parts come from comparing things with each other: what two things share becomes a part. They don't come from statistics over many examples.
4. **Build only what pays.** No structure "just in case": layers, parts, kinds and memories exist only while they lower energy.
5. **No crutches.** No numbers tuned to pass a test, no filters, no task-specific rules. Fixed architecture (columns, cells, the energy rule) is fine.
6. **Declare every remaining choice.** Anything that doesn't follow from the rule gets a note in `docs/decisions/`, with what would replace it.
7. **When the evidence can't decide, don't decide.**
8. **Measure against a baseline before believing a result.** Rerun the tests; an explanation is not evidence.
9. **Nothing goes into `src/` without evidence that it helps.** Experiments live in `experiments/` until then.

# Findings C09: update only where the heat was (staged growth, children from parents)

*Runs: C08 runner, arm SC, `OPT={"update":...}`; 40,000 flashes, seeds 1 and 2, 5% noise, shuffled (hot also 100,000). Results: `sketches/C08-staged-growth/results-<update>.json`. Model: `models/staged.js`.*

| update rule | heat (wrong) | error 15% | missing | new shapes |
|---|---|---|---|---|
| every pixel by its difference (C08) | 0.16 (0.09) | 3.22 | 2.75 | 0.47 |
| **scaled by the flash's heat** | **0.15 (0.06)** | 3.38 | 2.77 | 0.49 |
| by its surprise squared | 0.20 (0.11) | 3.21 | 2.82 | 0.48 |
| only pixels it got wrong | 0.99 (0.56) | 7.39 | 6.82 | 0.83 |
| wrong ones fast, right ones at a tenth | 0.88 (0.52) | 7.32 | 5.89 | 0.82 |

Hot at 100,000 flashes: heat 0.17 (wrong 0.07), all five layers settled.

## What it showed
1. **C08's rule was already "where the heat was", softly:** each pixel moves in proportion to its own difference, so pixels already right barely move.
2. **Scaling the step by the flash's heat helps a little:** fewer wrong pixels (0.06 against 0.09); a flash that fits changes nothing.
3. **"Only where it was wrong" fails badly.** A pixel that is right is never firmed up, so it sits just over the line and noise flips it back.
4. **Adding slow firming for right pixels doesn't rescue it** (0.88). A class is an average: a pixel on in 60% of a class's flashes is pushed down hard when off and up hard when on, so it parks on the line and flips. Moving in proportion to the difference lets it settle at the true average instead.

## Conclusions
- "Change where the heat was" works when it is graded (how much each pixel was off, how hot the flash was), not when it is all-or-nothing.
- For classes that average many things, a sharp "wrong or right" signal makes every mixed pixel unstable. A graded signal keeps the average, which is what a generic class should hold.
- This matches the core's principle in a new way: heat changes things in proportion to misfit, and the amount of change is the signal, not just whether there was any.

## Rising heat
None new (the update rule is an experimental variable).

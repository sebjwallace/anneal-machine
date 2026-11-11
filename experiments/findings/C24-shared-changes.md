# Findings C24: shared changes (decomposing transitions)

*Code: `models/shared.js`, on C23's exact transition memory (`transitions.js`, unchanged). Runner: `sketches/C24-shared-changes/run.js`. Page (C23 and C24 together): `sketches/C24-shared-changes/viewer.html`, built by `build.js`.*

## The idea (the owner's): decompose, don't average
- **At rest:** remembered transitions are compared in pairs, at every shift, as parts are. When the whole change of one lines up with the whole change of the other, what they share before and after is kept as a shared change, without its position. That is the change itself plus whatever stayed put around it. Where it happened is dropped.
- **Awake:**
  - If the exact memory knows the step, it is used alone; the specific beats the general.
  - Otherwise, shared changes whose "before" fits somewhere are applied there. The one with the most surrounding detail wins, then a cue, then the most common.
  - Each shared change is applied once per step, since it is one change.

## Results (tested in a place never seen; next state right, no cue / with cue)
| world | C23 exact | C24 shared changes |
|---|---|---|
| roof slides left or right and back | 0% / 0% | **75% / 100%** (75% is the most possible without a cue: a coin flip at the normal house) |
| one stick moving right (trained on 1 run, 1 row) | 0% / 0% | **100% / 100%** |
| two sticks moving together | 0% / 0% | **100% / 100%** |
| one moving, one staying | 0% / 0% | 100% / 100% (but see notes) |
| bouncing stick, no context | 0% / 0% | 47% / 100% |
| bouncing stick, direction as context | 0% / 0% | **93% / 93%** |
| same, trained on 2 rows | 0% / 0% | 93% / 100% |

- In the trained places, C24 is as good as C23.
- **A single run on a single row is enough.** Steps within one run are already the same change at different places, so comparing them finds it.

## Fixes found along the way
- **Whole change required.** At first, comparing "roof slides left" with "roof slides right" lined up only the roof leaving, and produced half a change ("the roof vanishes"). A shared change now has to be the whole change of both transitions; otherwise they aren't the same change.
- **Applied once.** "A stick moves one right" fitted the still stick too, so both moved. A shared change is now applied once per step.

## Notes and limits
- **One moving, one staying, in a new place:** with nothing to tell the two sticks apart, which one moves is a tie. It scored 100% only because the moving stick happens to come first in the list. Treat that as luck; it really needs a cue or a context (a history of which one was moving).
- **Walls:** the bouncing stick's reversal happens at fixed places (the walls). A shared change has no position, so in a new row it can't know where the walls are, and it misses the turn-arounds (93%). Comparing the wall-turns from two rows does line them up at "same x, different y", so the position along x could be kept as part of the shared change. That's worth trying when we need it: some changes depend on where, some don't.
- **Context:** works exactly as in C23 and is never shifted, because a context has no position.

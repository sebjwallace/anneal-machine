# Findings C23: transition memory

*Code: `models/transitions.js`, on a learnt C20 model and C21's cells (neither is changed). Runner: `sketches/C23-transitions/run.js`. 30 training runs and 4 test runs per world.*

## Definitions (the owner's)
- **State:** a settled scene, as its "where" cells. A context, when held, is one extra cell, held from elsewhere and not predicted.
- **Transition:** a link from a state to the state that settles next. Order matters; duration doesn't.
- **Cue:** cells of the next state, from the input. Context steers the same way.

## Two versions
- **Whole:** state to state. The current cells are matched to a stored state, its links prime the states that followed it, and the next state replaces the current one whole.
- **Changes:** only what changed. Each cell that went off is linked to the cell that came on in the same column, pairing nearest first; unchanged cells stay put.

## Results
| world | no cue | with cue | moving thing seen as two |
|---|---|---|---|
| roof slides left or right and back (branch at the normal house) | 80% | **100%** | 0 |
| one stick moving right | 100% | 100% | 0 |
| two sticks moving together | 100% | 100% | 0 |
| one moving, one staying | 100% | 100% | 0 |
| bouncing stick, no context | 59% | **100%** | 0 |
| bouncing stick, direction held as context | **100%** | 100% | 0 |

- The two versions give identical results on every world.
- **The roof slide** is literally the roof's cell moving one step in the roof column's grid, with every other cell unchanged.
- **Branches:**
  - With no cue, the normal house goes to its most-travelled next state, so it is right about half the time at the branch.
  - One cue cell always picks the right branch, as long as that branch was seen in training.
- **Context:** a bouncing stick is ambiguous mid-way, since the same picture can go either way. Holding the direction as a context makes it 100% with no cue. The cue and the context do the same job.
- **No moving thing was ever seen as two:** the old cell goes off as the new one comes on.
- **No generalisation:** a stick moving right on a row never seen moving was predicted wrong every time (0 of 10), in both versions. Transitions are tied to exact cells, so "moving right" learnt on rows 1 and 4 means nothing on row 7.

## Bugs found and fixed
- The context cell was being treated as a changing thing in the "changes" version. It is now held, not predicted, and not scored.
- One test run used a house position whose right branch was never trained. More training runs fixed it; a cue can't pick an unlearnt branch.

## Next (the owner's point)
- Generalising should come from **decomposing transitions at rest, not from averaging over many examples.**
- On the cell grid, a transition is a set of cell moves, for example stick cell (3,0) → (4,0). Compare two transitions as parts are compared, at every shift:
  - what they share is the change itself ("this column's cell moves +1 in x");
  - what's left over is where it happened.
- The shared part becomes a transition that applies anywhere, which starts to look like an action.

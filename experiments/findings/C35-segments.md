# C35 · Dendritic segments: findings

## 1. Same as today's completion
Segments with competition (the stronger segment wins; on a dead heat, neither) gave **identical** results to the engine's completion in 100% of scenes, on the learnt 12×12 world, at 25, 50 and 75% cues. Completion already is the segments idea: evidence is counted per assembly, never pooled into the cell.

## 2. Capacity: more and more things over the same 6 columns (`capacity.js`)
Each thing has 4 pieces in a 5×5 frame and is recalled from 2 of its cells. The 100 and 200 rows test a sample of 40 recalls.

| Things stored | Pooled (OR cells) | Segments alone | Segments with competition |
|---|---|---|---|
| 5 | 20% exact, 80% wrong | 100% exact | 100% exact |
| 20 | 0% exact, 100% wrong | 70% exact, 30% wrong | 85% exact, **0% wrong**, 15% nothing |
| 50 | 0% exact, 100% wrong | 26% exact, 74% wrong | 76% exact, **0% wrong**, 24% nothing |
| 100 | 0% exact | 5% exact | 58% exact, **0% wrong**, 43% nothing |
| 200 | 0% exact | 0% exact | 33% exact, **0% wrong**, 68% nothing |

- **Pooled cells collapse at once.** With 6 columns, any two cells reach almost everything.
- **Segments keep things apart at first,** confirming the owner's finding, but as more things share the same pairs of cells, more segments fire together.
- **With competition, it never recalls the wrong thing.** When a cue fits several things equally, it recalls nothing. Capacity then shows as how often a 2-cell cue is still distinctive. A 3-cell cue would reach further. That's the "flicker" settling into "undecided".

## 3. Out of place by one step
Tolerating a member one step out of place, priced on the bill, barely helped (slightly fewer wrong pixels, no more things wholly back). Displacement opens nine possible centres per cell, which creates many more equal fits, and completion refuses those. Partial matches need graded positions (nearby places sharing something), not just a looser match.

## What it means
The engine already has what segments give: exact, separate, AND-like recall that falls straight into a settled state. Its rule for ambiguity, recall nothing rather than the wrong thing, is what keeps memory clean as it fills. Segments are a good **picture** of the mechanism (for the sandbox) and a route to a parallel, brain-like version, but they add no new capability on their own.

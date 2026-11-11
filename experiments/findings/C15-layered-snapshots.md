# Findings C15: layers of snapshots, specific surface to general depths

*Model: `models/snapstack.js`. Runner: `sketches/C15-layered-snapshots/run.js` (98 patterns x 20 passes, seeds 1 and 2). Viewer in the same folder. Thresholds 90, 80, 70, 60, 50%. The overall picture comes from the most specific layer that recognised the flash (cleared its threshold); if none did, the deepest layer's best match. Doing nothing: missing 30% error 2.15, 15% noise error 3.80.*

## Results (no noise unless stated; "deeper average" = surface stays as captured, deeper columns average what they win)
| similarity · look | columns per layer | each layer's heat | missing 30% | 15% noise | new shapes |
|---|---|---|---|---|---|
| all-pixel · every layer sees the flash | 85 42 21 8 3 | 0.07 0.38 0.58 0.77 0.94 | 1.70 | 3.36 | 0.25 |
| overlap · every layer sees the flash | 98 96 92 74 52 | 0.00 0.00 0.01 0.11 0.24 | 1.33 | 2.59 | 0.25 |
| **overlap · each sees the winner above** | 98 96 92 74 48 | 0.00 0.00 0.01 0.11 0.31 | **0.86** | **2.05** | 0.23 |
| overlap · winner above · 5% noise | 1,232 867 524 278 139 | 0.02 0.09 0.13 0.24 0.39 | 1.78 | 3.23 | 0.23 |

Which layer answered (overlap, every layer sees the flash): 30% missing 20/19/18/15/28%; 15% noise 3/12/16/17/52%. With "each sees the winner above": layer 2 answers 80% (missing) and 97% (noise).

## What it showed
1. **The funnel shape emerges by itself:** fewer columns and more heat with depth (all-pixel: 85 → 3 columns, heat 0.07 → 0.94), as the owner predicted. The surface's heat is near zero.
2. **For the first time on this track, filling in missing pieces beats doing nothing** (0.86 to 1.70 against 2.15), and seeing through heavy noise is the best yet (2.05 against C07's 3.09).
3. **The spectrum does real work on damaged input:** when the surface doesn't recognise a damaged pattern, deeper, more tolerant layers answer. With heavy noise, the deepest layer answers about half the time.
4. **Much of the filling-in is recall of the nearest stored snapshot:** when each layer sees the winner above, the second layer answers almost everything, because it simply passes on the surface's closest snapshot (usually right, even below 90%). This is classic associative memory (the owner's starting point).
5. **Clean, known patterns are always answered by the surface,** so deeper layers never contribute there.
6. **New shapes (combinations of known parts) are still not handled** (0.23 to 0.31): one snapshot per layer, no composition.
7. **Noise still makes the surface explode** (1,232 columns), and every layer below grows with it.

## Conclusions
- Layered snapshots give the best recall and noise tolerance so far, with heat rising with depth as designed.
- The open problems are the same two: composition (more than one column per flash), and keeping snapshots under noise (recurrence before keeping).

## Settings
Thresholds and measure are experimental variables; deeper layers' averaging rate 0.02 (ETA_M).

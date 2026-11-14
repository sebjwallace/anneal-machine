# C77 · Binding with competition: findings

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after development seed 1. Output: `out.txt`.

## Results (full / clean, %; two sampled cells per part unless said)

| | M = 10 | 50 | 200 | 500 |
|---|---|---|---|---|
| 16 cells per column, no competition | 100 / 100 | 100 / 92 | 100 / 74 | 100 / 45 |
| 16 cells per column, top-level competition | 100 / 100 | 100 / 92 | 100 / 74 | 100 / 45 |
| **64 cells per column, no competition** | **100 / 100** | **100 / 100** | **100 / 98** | **100 / 96** |
| 64 cells per column, every cell wired | 100 / 100 | 100 / 100 | 100 / 95 | 100 / 94 |

Segment checks per recall, two per part, no competition: at 64 cells per column 144 / 154 / 199 / 278 as M goes from
10 to 500. At 16 cells per column, M = 500: 2,386, and 58,530 with top-level competition.

## Predictions

| | prediction | result |
|---|---|---|
| P1 | (the owner's claim) 64 cells per column: clean ≥ 90% at M = 500 | **Holds:** 96%. |
| P2 | top-level competition adds ≤ 5 points at 16 cells per column | **Holds:** it added nothing (45 and 45). |
| P3 | top-level competition does ≥ 5 times the work at 16 cells, M = 500 | **Holds:** about 25 times. |
| P4 | two per part at least as clean as every cell wired at 64 cells per column | **Holds** at every M. |

## What it means

- **The owner was right: more cells per column is the fix.** With 64 cells per column, binding two cells per part stayed
  96% clean with 500 compositions stored (1,500 parts in 6,400 cells), against 45% at 16.
- **Competition can't fix crowding.** The intrusions come from cells reused by chance: an intruding part that happens to
  share active cells with the target gets exactly the same support as a true part, so no level of support can tell them
  apart. The fault is in the code (too few cells), not in the reading. Top-level competition only spent more work.
- **The work follows what's active, not what's stored.** At 64 cells per column, storing 50 times more compositions (10 to
  500) raised the work per recall from 144 to 278 segment checks: less than double. That is the scaling the contract asks
  for (CTR-1 CON-18, OPZ-5): cost grows with what is happening, not with memory. At 16 cells it blew up only because
  intrusions spread.
- **Two cells per part stays the best binding** at the larger size too (as clean as wiring everything, with under a
  quarter of the links).

## Given by hand (declared)
As C76: the world; which cells were sampled; the number of rounds.

serves: CTR-1 CON-18, OPZ-5, CAP-2, CAP-3, CAP-4.

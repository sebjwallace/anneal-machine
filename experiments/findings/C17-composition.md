# Findings C17: composition at rest (parts first, then layers of composites)

*Model: `models/compose.js` (C16 unchanged). Runner: `sketches/C17-composition/run.js`. Viewer in the same folder. Rest: decompose (C16) until settled, then compose until settled. Compose: when the same group of units is listed in several holders (memories or composites), the group becomes a composite one layer up if that lowers energy (a group of 2 needs at least 3 holders; a group of 3, at least 2). Energy = pixels stored + 1 per unit listed (no new settings).*

## Results (98 patterns)
| stage | units per layer | energy | units per training pattern | heat | new overlaid pairs |
|---|---|---|---|---|---|
| awake only | 85 | 658 | 1.17 | 0.01 | 0.07 (1.96 units) |
| decomposed | 65 / 1 | 375 | 1.98 | 0.02 | 0.03 (2.79 units) |
| composed | 65 / 3 | 373 | 1.92 | 0.02 | 0.05 (2.75 units) |

With 5% noise: composed into 120 / 11 units, energy 818 → 803, layer-2 composites explain 19% of what's used.

## Composites found (no noise)
- "big L tl" = col 0 + row 0 (used 4 times)
- big L br = col 4 + row 4 (3 times); corner tl = top of col 0 + left of row 0 (3 times)
- memories: "frame" = big L tl + big L br (two composites); "U" = col 0 + big L br; "F" = big L tl + middle row piece.

## What it showed
1. **Composition by the same heat, one level up, works:** groups listed repeatedly become composites, and composites combine (the frame is two Ls).
2. **But this catalogue has little to compose:** after decomposition most patterns are just two parts, and few groups recur three or more times. Only 3 composites, no third layer, tiny energy saving (375 → 373).
3. Rest is fast: composing took 2 to 10 steps, under 50 ms.
4. Decomposition still leaves some messy pieces in letters ("C" is three odd fragments).

## Next
- A world with more to compose: flashes that are scenes made of several known shapes (for example a larger canvas with shapes in slots, or recurring groups of shapes), so that groups recur and higher layers have a reason to form.

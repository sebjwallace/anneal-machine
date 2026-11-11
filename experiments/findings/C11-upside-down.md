# Findings C11: staged growth upside down (start big, then smaller layers)

*Runs: C08 runner, arms RM, RA, RF (and SC for comparison), update "hot"; 40,000 flashes, seeds 1 and 2, 5% noise, shuffled. Results: `sketches/C11-upside-down/results-rate0.2.json`. Model: `models/staged.js` (UP_ARMS). Layers 96, 48, 24, 12, 6. Heat, errors and new shapes are read from the most specific (largest) layer.*

## Results, learning speed 0.2
| arm | heat (wrong) | error 15% | missing | new shapes | work | each layer's own heat (seed 1) |
|---|---|---|---|---|---|---|
| RM merged parents, read upwards | 0.32 (0.13) | 3.35 | 3.35 | 0.49 | 100 | 0.68 0.68 0.96 1.26 1.48 |
| RA merged parents, compare all | 0.32 (0.13) | 3.35 | 3.35 | 0.49 | 186 | 0.68 0.68 0.83 1.02 1.20 |
| RF fresh smaller layers | 0.32 (0.13) | 3.35 | 3.35 | 0.49 | 186 | 0.68 0.74 0.84 1.02 1.21 |
| **SC small first (C08), same speed** | **0.23 (0.10)** | 3.33 | **2.88** | 0.46 | **14** | 1.20 1.06 0.91 0.77 0.71 |

At speed 0.02 the 96-column layer had not settled after 40,000 flashes (its settling window is about 9,600 flashes), so no second layer appeared.

## What it showed
1. **Small first beats big first at the specific level:** a 96-column layer grown from a settled generic foundation (children of the layers below) fits better (0.23 against 0.32) than a 96-column layer formed from haze, and fills in missing pieces better (2.88 against 3.35).
2. **Big first: building the smaller layers by merging similar columns is no better than starting them fresh** (generic layers' heat 0.83 to 1.20 against 0.84 to 1.21). The foundation matters when going from generic to specific, not the other way.
3. **Reading upwards is cheaper but picks worse generic classes** (1.48 against 1.20 for the 6-column layer): the parent of the best specific match is not the best generic match.
4. **Once the big layer settles, the smaller ones settle fast** (about 1,000 flashes each at speed 0.2), because they start from merged columns that already fit.
5. All three big-first arms score the same on the specific layer: they differ only in the generic layers above it.

## Conclusions
- The direction matters: generic first, then specific (C08) gives better specific columns and far cheaper recognition. Starting big gives a worse specific layer and no gain in the generic ones.

## Changes
Learning speed now offers 0.2; layers can shrink (x0.25, x0.5, x0.67). No new settings in the machine.

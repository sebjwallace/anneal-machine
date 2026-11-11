# Findings C08: staged growth (exploration, two rounds)

*Sketch: `sketches/C08-staged-growth/` (run.js, results*.json, viewer). Model: `models/staged.js`. 5% noise, shuffled. Layers 6, 12, 24, 48, 96 columns, each appearing only when the one below has settled. Slow learners (rate 0.02); columns start as faint haze.*

## Round 1 (soft columns competing to explain parts): failed
- Every layer was declared settled at the earliest moment, with heat still ~0.9: slow learning looked like "heat has stopped falling".
- Hazy columns never cleared the cost of claiming, so almost nothing was explained.

## Round 2 changes
- A layer is judged over a window long enough for each column to learn (2 x columns / rate flashes, at least 500).
- Each layer classifies: its closest column wins the flash and moves a little towards it.

## Results (round 2)
40,000 flashes, seed 1 (C07 detail-first reference: heat 0.02, error at 15% noise 3.09, missing 3.05, new shapes 0.04, work 297; doing nothing: 3.80 and 2.15):

| arm | layers settled | heat (wrong) | error 15% noise | error, 30% missing | new shapes | work |
|---|---|---|---|---|---|---|
| SC children, down the family tree | 4 of 5 | 0.18 (0.11) | 3.36 | 2.85 | 0.45 | **14** |
| SR fresh, sees the leftover | 4 of 5 | 0.77 (0.77) | 8.14 | 4.89 | 0.67 | 186 |
| SF fresh, sees everything | 3 of 4 | 0.57 (0.25) | 4.67 | 4.13 | 0.65 | 90 |

SC at 100,000 flashes (2 seeds), all five layers settled (the last at flash ~50,000): heat 0.21 (wrong 0.11), error 15% 3.47, missing **2.80**, new shapes 0.46, work **14**.

## What it showed
1. **Building on the layer below matters a lot:** new columns that start as children of settled ones (SC) do far better than fresh layers (SF) or leftover-only layers (SR).
2. **Walking down the family tree is very cheap:** 14 columns checked per flash, about 20 times less than C07's best. A generic match narrows what the next layer needs to consider.
3. **It develops in stages as designed:** each layer settles before the next appears; heat falls stage by stage (seed 1: 1.19, 1.07, 0.92, 0.75, 0.58 for each layer's own fit).
4. **Best at filling in missing pieces so far** (2.80; C07 3.05), though still worse than doing nothing (2.15).
5. **But it can't compose:** one class per layer per flash, so a new combination of known parts has no class (new shapes heat 0.46 against 0.04 for part-based designs). Detail stays blurry (wrong pixels 0.11), since a class is an average.
6. **Leftover-only layers fail** when the layer below is hazy: they learn from noise-like remainders (SR wrong 0.77).
7. **Slow:** reaching the fifth layer takes ~30,000 to 50,000 flashes at rate 0.02.

## Conclusions
- Staged growth with a family tree gives stable, cheap, generic-to-specific recognition: a strong backbone.
- It needs composition back: let each layer pick more than one winner (parts), or attach the part-based machinery (C03/C07) to the tree's leaves. That's the natural next step.

## Rising heat
HAZE 0.05, JITTER 0.1, the settling window and SETTLE_DROP, EMA; layer sizes, growth and rate are experimental variables.

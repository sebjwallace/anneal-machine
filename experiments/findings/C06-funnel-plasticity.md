# Findings C06: the funnel combined with plasticity

*Sketch: `sketches/C06-funnel-plasticity/` (run.js, results.json, viewer with presets). Model: `models/funnel.js`. 6,000 flashes, 5% noise, 3 seeds; streams: changing focus (every 300 flashes, 80% from 10 patterns) and shuffled. Heat = left over + wrong, as a share of ink; "together" = all layers explaining at once.*

## Results (together, at the end)
| setup | columns | focus stream: all 98 / current focus | shuffled: all 98 |
|---|---|---|---|
| funnel 100→6, **fast → slow** | 191 | **0.04 / 0.00** | **0.02** |
| funnel 100→6, slow → fast | 194 | 0.16 / 0.04 | 0.11 |
| funnel 100→6, one speed 0.2 | 193 | 0.06 / 0.02 | 0.04 |
| stacked funnel, fast → slow | 191 | 0.04 / 0.00 | 0.02 |
| **10 layers keep 70%, fast → slow** | 320 | **0.02 / 0.00** | 0.02 |
| upside down (6→96), narrow fast on top | 186 | 0.17 / 0.06 | 0.13 |
| plasticity only, 5 x 50 (C05) | 249 | 0.07 / 0.02 | 0.04 |

Each layer alone (focus stream), fast → slow funnel: 0.07, 0.17, 0.44, 0.67, 0.82.

## What it showed
1. **Plasticity belongs where the detail is.** A wide, plastic top over small, stiff layers is the coolest combination, and it beats the same funnel at one speed (0.04 against 0.06) and plasticity alone (0.04 against 0.07, with fewer columns: 191 against 249).
2. **Putting stiffness where the detail is fails badly:** the reverse (wide and stiff on top) and the upside-down funnel (wide and stiff at the bottom) both sit at 0.16 to 0.17. A big stiff layer locks in its early accidents (as C05 found), and a big layer has more of them to lock in.
3. **More, gentler layers help a little more** (10 layers: 0.02), at the cost of more columns.
4. **Stacked and parallel are the same again.**
5. The narrow, stiff layers are poor on their own (0.44 to 0.82); their contribution is in the combination.

## Conclusions
- The owner's picture holds up in this form: **specific and fast at the top, generic and slow at the bottom** is the coolest arrangement of the ones tried.
- Stiffness that comes with being proven (rather than fixed by layer) remains the natural next step, and may let large stiff layers work too.

## Rising heat
None new: the shapes and plasticities are experimental variables; presets are viewer conveniences.

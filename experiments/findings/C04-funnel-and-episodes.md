# Findings C04: the funnel, and columns plus episodes (exploration, round 1)

*Sketch: `sketches/C04-funnel-and-episodes/` (run.js, results.json, gallery.txt, two viewers). Models: `models/funnel.js`, `models/episodes.js` (on `models/compress.js`). 98 patterns x 30 passes, bar triples held out, 5 seeds. Heat = (left over + wrong) / ink. Completion: a pattern with ~30% of its pixels removed; error = wrong pixels against the full pattern (the cue itself is 2.1 wrong).*

## Results (means)
| | columns | episodes | cells | heat | heat, 5% noise | held-out heat | completion error | cells same under noise |
|---|---|---|---|---|---|---|---|---|
| GEP columns only (C03) | 66 | | 969 | 0.14 | 0.29 | 0.04 | 3.45 | 0.45 |
| **X1 columns + episodes** | 66 | 337 | 1909 | **0.00** | 0.08 | 0.04 | 2.42 | 0.37 |
| **X1, no noise** | **23** | 59 | 1107 | **0.01** | 0.22 | 0.08 | 2.42 | 0.52 |
| FP funnel, parallel | 193 | | 5366 | 0.03 | 0.20 | 0.02 | 3.29 (layer 1), 3.29 after | 0.18 |
| FS funnel, stacked | 193 | | 5604 | 0.03 | 0.20 | 0.03 | 3.32 after | 0.18 |
| FP, no noise | 159 | | 4596 | 0.02 | 0.21 | 0.01 | 3.51 after | 0.24 |

Funnel, each layer alone (FP, 5% noise): 100 columns 0.04 · 50 columns 0.14 · 25 columns 0.31 · 12 columns 0.51 · 6 columns 0.73.

## What it showed
1. **X1 without noise: 23 columns plus 59 episodes, heat 0.01.** C03 needed about 60 columns for the same coolness; the all-seeing yardstick needed 40. Episodes take the specifics, so columns only hold what's common across patterns. **The clearest win so far.**
2. **Under noise X1 loses that:** 66 columns and 337 episodes. Noisy snapshots split into near-copies (as doc 16 warns), and noise leftovers still become columns. Its noisy heat (0.08) is below the noise floor (~0.17), meaning episodes are "explaining" noise.
3. **The funnel's middle layers learnt generic parts by themselves:** the 25- and 12-column layers are essentially all the full bars, plus diagonals and corners. The 6-column layer is a mix. Detail at the top, generic further down, as designed.
4. **But the spectrum together is no cooler than its widest layer** (0.03 against 0.04). The narrow layers don't lower the total heat, because the wide layer already explains nearly everything.
5. **Cross-layer assemblies didn't complete anything:** on average 0.1 extra columns were switched on, and the most specific layer's picture didn't improve. The cause is the cells: 5,000+ cells and only 18% of assemblies the same under noise. Assemblies keep re-forming instead of being recognised.
6. **Parallel against stacked made almost no difference.**
7. **Nothing completes well yet:** every model's completion is worse than the cue itself (2.1), because rebuilt pictures add wrong pixels.

## Conclusions
- **"Episodes for the specific, columns for the common" works** when episodes are clean. The noise problem is now the episode problem: snapshots need to tolerate noise (store what settled, not the raw flash), or merge near-identical siblings.
- **The funnel is right about what each layer learns, but in this form the layers don't help each other.** For the spectrum to pay, something must flow between layers: a generic layer that predicts and a specific layer that only carries what the generic layer couldn't (residual), or assemblies that actually complete.
- **Cells are now the bottleneck** for anything that relies on assemblies (completion, identity). They need to be stable before cross-layer assemblies can do their job.

## Rising heat
Layer sizes (the owner's design), FLOOR 0.55 (the core's stand-in), the completion rule's "half the assembly" (reuses CUT).

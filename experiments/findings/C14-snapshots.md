# Findings C14: snapshot columns (a new column when nothing matches well enough)

*Model: `models/snapshot.js`. Runner: `sketches/C14-snapshots/run.js` (98 training patterns x 20 passes, seeds 1 and 2). Viewer: `sketches/C14-snapshots/viewer.html`.*

**Hypothesis (the owner's):** starting with no columns, and making a snapshot whenever no column is at least 90% similar, settles just under the number of patterns (98), by itself.

## Results (columns at the end; heat on the clean patterns)
| similarity | noise | 50% | 70% | 80% | 85% | **90%** | 95% |
|---|---|---|---|---|---|---|---|
| overlap of on-pixels | 0% | 41 | 92 | 96 | 97 | **98** | 98 |
| all 25 pixels agree | 0% | 3 | 20 | 29 | 71 | **85** | 97 |
| overlap of on-pixels | 5% | 127 | 532 | 818 | 1,126 | **1,232** | 1,408 |
| all 25 pixels agree | 5% | 5 | 37 | 99 | 289 | **498** | 958 |

Averaging after the snapshot made almost no difference under noise (1,277 and 498 at 90%).

## What it showed
1. **Without noise it settles immediately** (all columns made in the first pass, none after), and **the count depends on what "similar" means:**
   - overlap of on-pixels at 90%: exactly 98, one per pattern (no two catalogue patterns are that alike by overlap); just under 98 at 70% to 85%;
   - agreement across all 25 pixels at 90%: **85, just under 98, as hypothesised**, with sensible merges ("row 0" + "row 0 right" + "corner tr"; "col 0" + its two halves; "row 0 left" + "corner tl"). Heat 0.07.
2. **With 5% noise it never settles:** about 1,200 (overlap) or 500 (all pixels) columns at 90% after 20 passes, still growing roughly in a straight line. A noisy flash is rarely 90% like any earlier snapshot, so it becomes a new one: the same splitting as episodes under noise (C04).
3. **Averaging doesn't rescue it:** the closest column is usually another noisy snapshot.

## Conclusions
- The hypothesis holds without noise, for the all-pixel measure (85 of 98); with the overlap measure the same happens a little lower (70% to 85%).
- Under noise, a snapshot needs a reason to be kept: for example, only keep it if a similar flash comes again (recurrence), or let unconfirmed snapshots fade.

## New settings
The threshold and the measure are the experiment's own variables; averaging rate 0.02 (ETA_M).

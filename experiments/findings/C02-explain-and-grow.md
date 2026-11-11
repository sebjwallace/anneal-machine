# Findings C02: explain and grow (exploration, round 1 and 2)

*Sketch: `sketches/C02-explain-and-grow/` (run.js, results.json, gallery.txt, probe-join.js, viewer). Model: `models/explain.js`. 98 patterns x 20 passes, 6 bar triples held out, 5 seeds. Exploration: no pass marks were set.*

## Results (means over 5 seeds)

| experiment | columns | pixels per column | cells | patterns with own code | parts per pattern | code kept under 5% noise | held-out left over |
|---|---|---|---|---|---|---|---|
| A grow only | 132 | 2.6 | 3753 | 98 | 3.1 | 0.62 | 0.00 |
| B grow + split | 122 | 2.3 | 4158 | 98 | 3.3 | 0.62 | 0.00 |
| C + confirm | 88 | 2.2 | 3596 | 98 | 3.4 | 0.67 | 0.00 |
| D + join | 88 | 2.2 | 3596 | 98 | 3.4 | 0.67 | 0.00 |
| B, no noise | 48 | 2.7 | 1380 | 97 | 2.9 | 0.75 | 0.02 |
| D, no noise | 45 | 2.6 | 1606 | 97 | 2.8 | 0.76 | 0.01 |
| B, 15% noise | 138 | 2.3 | 5165 | 98 | 3.4 | 0.59 | 0.00 |
| B parts first / wholes first | 116 / 115 | 2.4 | 3791 / 3164 | 98 | 3.2 | 0.63 | 0.00 |

Code overlap tracks shape overlap moderately (correlation 0.58 to 0.72). Cost: 0.15 to 0.8 s per run.

## What it showed
1. **It explains everything, but with crumbs.** Every pattern gets its own code, and the held-out triples are explained on first sight with nothing left over. But columns average only 2 to 3 pixels, so that success is cheap: crumbs can make anything, the way letters can spell any word. **Explaining the most with the least left over, on its own, rewards small pieces.** Nothing in the mechanism pushes for fewer, bigger parts.
2. **Without noise it's much better:** 45 to 48 columns for 98 patterns, with some real parts (half bars, whole columns 0 and 4, the middle of row 2). Many of the rest are the catalogue's overlap crumbs: where half bars, rows and corners overlap, the leftover is whatever small remainder no other part covers.
3. **Noise is the biggest damage** (45 to about 120 columns). A leftover is decided from one flash, so noise pixels ride along into new columns, and missing noise pixels make columns shed. Requiring a leftover to recur (C) helps (122 to 88), but doesn't solve it.
4. **Joining things that are always together barely fires** (3 joins without noise, none at 5%). The crumbs really aren't "always together"; they're genuinely shared differently across patterns. So fragmentation isn't a missing join; it's the grain the leftover rule produces.
5. **Splitting with no split rule works as a mechanism** (B sheds misfit pixels), but on this catalogue it makes things smaller, not better.
6. **Order barely matters** (parts first and wholes first land within a few columns of each other).
7. **Cells churn:** thousands of cells for 98 wholes. Every time the columns under a whole change, it looks like a new whole and gets fresh cells. Cells can only be as stable as the columns beneath them.

## Conclusions
- **A part decided from a single leftover is an accident of that moment.** Real parts are what recur across many sightings. The next step should let a part's extent come from many flashes (what reliably comes together), not from one remainder.
- **There must be a pressure toward economy:** fewer, larger parts per pattern. Explaining-away alone has none.
- Stop rule: two rounds on this mechanism. A third should be a step back (a different way to decide what a part is), not more tuning.

## Rising heat (settings and rules added)
A claim threshold of 0.8 (arm A), a new link's start strength of 0.6, "a part binds at least 2 pixels", and TOGETHER 0.8 (arm D).

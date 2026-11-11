# Findings C03: fewest parts (exploration)

*Sketch: `sketches/C03-fewest-parts/` (run.js, yardstick.js, results*.json, gallery*.txt, viewer). Model: `models/compress.js`. 98 patterns, 6 bar triples held out, 5 seeds. Goal (the owner's): the fewest columns that leave every pattern cool. Heat = (pixels left over + pixels wrong) / ink.*

## The yardstick (offline, sees everything at once; not allowed for the machine)
- **40 parts rebuild all 98 patterns exactly** (14 of them single pixels), about 6 parts per pattern; the held-out triples are rebuilt too.
- Its frontier: 10 parts heat 0.54, 20 parts 0.27, 30 parts 0.09, 40 parts 0.01.
- **This catalogue isn't very compressible:** its overlaps force crumbs if you want zero heat. Best case is about 2.5 times fewer parts than patterns.

## The machine (online, local), 30 passes
| arm | columns | heat | patterns cool (≤15%) | parts per pattern | heat under 5% noise | held-out heat |
|---|---|---|---|---|---|---|
| R cut once, shrink (C02) | 90 | 0.04 | 83 | 3.6 | 0.07 | 0.00 |
| G grow towards | 89 | 0.03 | 87 | 3.3 | 0.07 | 0.00 |
| GP + pay its way | 78 | 0.03 | 88 | 3.5 | 0.08 | 0.00 |
| GEP + economy | 66 | 0.14 | 61 | 1.9 | 0.29 | 0.04 |
| GEP, no noise | 65 | 0.02 | 94 | 2.1 | 0.21 | 0.05 |
| GEP caps 30 / 20 / 10 | 30 / 19 / 10 | 0.37 / 0.53 / 0.68 | | | | |
| GEP price 2, no noise | 59 | 0.02 | 93 | 2.0 | 0.22 | 0.04 |
| GEP price 4, no noise | 22 (12–29) | 0.41 | 32 | 1.5 | | |

80 passes: GEP no noise settles at 63 columns, heat 0.02; with 5% noise at 56 columns, heat 0.17 (seeds 42 to 67).

## What it showed
1. **Economy is the step that matters.** Charging a little heat for each part used cut parts per pattern from 3.6 to about 2, and the most-used columns became real parts: whole rows 0, 2 and 4, whole columns 0 and 4, centre and diagonal pieces. A tail of crumbs remains.
2. **Online, the machine needs about 60 columns where the all-seeing yardstick needs 40** for the same coolness. At a given budget it runs about 0.15 hotter than the yardstick.
3. **Growing towards (G) alone barely helped** (90 to 89 columns). Paying its way trimmed a little (78).
4. **Caps by taking over the least recently used column churn:** useful parts get overwritten by junk leftovers. Heat at 20 columns is 0.53, against the yardstick's 0.27.
5. **Raising the price of structure gives a cliff, and it's unstable** (price 4: 12 to 29 columns across seeds). Cause: a column must prove its worth within one rest window, and windows shrink as heat rises, so removing columns raises heat, which removes more columns. A runaway.
6. **Honest noise reading:** R and G read heat under 5% noise at 0.07, below the ~0.17 noise alone adds: junk columns "explain" noise. GEP sits at the noise floor, which is correct.
7. **Held-out triples stay cool** in the uncapped arms (heat 0.00 to 0.05): new compositions of known parts, explained on first sight.

## Conclusions
- **The goal has a trade, not one answer:** fewer columns always costs some heat. What decides the balance is the exchange rate between structure and heat (how much heat a column must save to be worth storing). That rate is a fundamental setting of the machine, not a detail.
- **Next:** judge "pays its way" as a rate (heat saved per flash, over a steady horizon) rather than per rest window, to remove the runaway and get a smooth trade; and replace least-recently-used take-over with "take over only if the newcomer would save more than the weakest column".
- The catalogue limits compression; a catalogue with more shared structure (or a world with real repetition) would show compression more clearly.

## Rising heat
PART_COST 1, the price of structure (swept), caps (swept as an experimental variable).

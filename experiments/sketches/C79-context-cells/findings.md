# C79 · Which cell: Numenta's scheme in a text world: findings

> **How not to do time ([decision 009](../../../docs/decisions/009-no-context-in-cells.md)).** This experiment carries
> context in which cell fires (HTM-style temporal memory), or builds on something that does. The owner has ruled that
> out: it is brittle, and these results are kept as the evidence. Read the numbers as measurements, not as a direction.

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after development seed 1 (two fixes declared there).
Output: `out.txt`.

## Results (predicting the last word of "the S V the O")

| world (subjects / verbs / objects), readings | arm | right | sharp (only it) | words predicted | newcomer: any valid / only valid | cells used |
|---|---|---|---|---|---|---|
| 8 / 4 / 10, once | one cell per word | 100% | 0% | 5.6 | 100 / 100 | 24 |
| | **Numenta, least used** | **100%** | **100%** | **1.0** | **100 / 100** | 104 |
| | Numenta, random | 100% | 99% | 1.0 | 100 / 100 | 95 |
| 20 / 6 / 30, once | one cell per word | 100% | 0% | 14.9 | 100 / 100 | 58 |
| | **Numenta, least used** | **100%** | **100%** | **1.0** | **100 / 100** | 323 |
| | Numenta, random | 100% | 96% | 1.0 | 100 / 100 | 277 |
| 8 / 4 / 10, three times | Numenta, least used | 100% | 100% | 1.0 | 100 / 100 | 170 |
| 20 / 6 / 30, three times | Numenta, least used | 100% | 100% | 1.0 | 100 / 100 | 525 |

## Predictions

| | prediction | result |
|---|---|---|
| P1 | one cell per word: right ≥ 95%, sharp ≤ 5% | **Holds:** 100%, 0% (it predicts every object of the verb: 5.6 and 14.9 words). |
| P2 | least used: right and sharp ≥ 95% after one reading | **Holds:** 100% and 100% in both worlds. |
| P3 | the newcomer predicts a valid object, and only valid ones, ≥ 95% | **Holds:** 100% / 100%. |
| P4 | random within 5 points of least used | **Holds:** sharp 96-99%. |
| P5 | three readings use ≥ 40% more cells | **Holds:** 170 against 104 (+63%). |

## What it means

- **The column is identity, the cell is context, and together they settle what picks the cell.** With one cell per word,
  "eats the" predicts every object any subject ever ate. With Numenta's choice, the cell for "eats" after "the cat" is a
  different cell from "eats" after "the dog", and the next word is predicted sharply, after one reading, in both worlds.
- **It generalises through the column.** A subject never seen in a frame lights its whole column (nothing predicts one
  cell), which wakes what followed the verb in every context, and only real objects of that verb were predicted.
- **Learn from winners.** A cell predicted only through cells lit by a burst must still learn the new context. Without
  that, a new pair was lost in the union the burst woke (66% on the development seed); with it, 100%.
- **The least-used cell beats a random one,** slightly: random picks collide on cells already in use (96-99% sharp
  against 100%).
- **A creep to watch.** The word after "the" has only one cell of context, so with the bar of two it can never be
  predicted, and it learns a fresh cell every time it is read: three readings used 63% more cells. The cells-first
  answer is probably decomposition: "the" and other common words become a shared constant (RM-8). Or the context should
  be held longer than two words. Open.

## Given by hand (declared)
- Words are given as items (one column per word): the same violation as all text sketches (D-01 V1).
- The first word of a sentence always uses cell 0.
- The context is the previous two words.
- The learning cell is the least-used one.
- Two fixes were made on the development seed (PREREG.txt).

serves: CTR-1 CAP-2, CAP-3, CAP-12 (history in the state), CON-19. Reference model: RM-1 (what picks the cell).

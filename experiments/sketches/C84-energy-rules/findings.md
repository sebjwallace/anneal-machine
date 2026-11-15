# C84 · Energy rules at the level of cells, first candidates: findings

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after development seed 1 (`dev.txt`; two changes declared
there). Output: `out.txt`. Serves: CTR-1 CON-1 (one rule: keep a change only if energy falls), CON-14 (memory is
finite), CON-9; CTR-2 CON-2, CON-7.

## Results (pooled means, quarter 1 → quarter 4)

**Noise on its own columns:**

| arm | segments | objects from half, exact | "x" exact | heat per moment: unheld / unthere / twice |
|---|---|---|---|---|
| core | 394 → 549 | 100% → 100% | 0% | 0.24 → 0.00 / 25.7 → 26.6 / 0.05 |
| squeeze | 372 → 526 | 100% | 100% | 0.24 → 0.00 / 24.0 → 24.8 / 0.05 |
| used | 376 → 496 | 100% | 100% | 0.24 → 0.00 / 24.0 → 24.7 / 0.05 |
| yardstick | 372 → 526 | 100% | 100% | as squeeze |
| fade | 443 → 1,217 | 100% | 100% | 0.54 → 0.10 / 15.8 → 14.7 / 0.18 → 0.24 |

**Noise on the objects' columns:**

| arm | segments | objects from half: complete, exact, extra columns | heat: unheld / unthere / twice |
|---|---|---|---|
| core | 417 → 591 | 100%, 0%, 60 of 60 | 0.01 → 0.00 / 50.5 → 51.3 / 0.13 |
| squeeze, yardstick | 391 → 555 | 100%, 0%, 60 | 0.01 → 0.00 / 48.7 → 49.4 / 0.12 |
| used | 355 → 486 | 100%, 0%, 60 | 0.01 → 0.00 / 48.7 → 49.3 / 0.00 |
| fade | 434 → 1,473 | 23% → 43%, 10% → 3%, 6 → 19 | 0.41 → 0.01 / 24.0 → 47.5 / 0.32 → 0.30 |

No arm cleared a single cell, in either world.

**The core's tests on each copy:** core, squeeze and yardstick 16 of 16; used 15 (test 12, wholes competing for a shared
part); fade 13 (tests 9, 12, 14).

## Predictions

| | prediction | result |
|---|---|---|
| P1 | no arm clears a cell | **Holds:** 0 everywhere. |
| P2 | unheld heat ≤ 0.05 in quarter 4, all but fade | **Holds:** 0.00. |
| P3 | core segments grow ≥ 1.2 times | **Holds:** 1.39 (own), 1.42 (shared). |
| P4 | shared: ≥ 50 extra columns per half-probe, all but fade; fade ≤ 30 | **Holds:** 60; fade 19. |
| P5 | own: objects exact ≥ 95%, every arm | **Holds:** 100%. |
| P6 | fade has the most segments | **Holds:** 1,217 and 1,473. |
| P7 | "x" exact 0% in core, 100% elsewhere | **Holds.** |

## What it means

- **The candidates were aimed at the wrong place.** Squeezing and the yardstick only act when a column runs out of
  cells, and none ever did. The machine never stores a new pattern as new. Any two of its columns wake some old memory
  (the bar of two), and the cut and tie rebuild it from fragments of the past. So "unheld" heat goes to zero within the
  first quarter, not because things are understood but because everything is explained as pieces of what came before.
- **The growth comes from cutting and tying.** Structure grows by about 40% over the stream in the core, all of it from
  cuts and ties of fragments, and none of the rules here touches that.
- **The machine isn't cooling.** By the three-shape meter, "unthere" heat (things held that aren't there) is as high in
  the last quarter as in the first: about 25 cells brought back per moment with noise on its own columns, about 50 with
  shared columns. Each one-off is kept, recalled by the next, and never confirmed.
- **Shared columns chain everything.** With noise built from the objects' columns, half of any object brings back the
  whole volume (60 extra columns) in every arm but fade. One-off compositions join every object to every other.
- **Fading helps and hurts.** Losing a link for every claim not met cuts the chaining from 60 extra columns to about 19.
  But it frays the objects too (complete recall 43%), and it causes churn: faded memories are cut and tied again, so
  structure grows three times as fast.
- **Densifying from use is harmless but does little here.** It ended ties between rivals in the shared world ("twice" 0)
  and fully linked the objects, but changed nothing about growth or chaining.
- **So the energy rule is needed at the cut and the tie.** The question is not which memory to drop when space runs
  out. It is whether a cut or tie is worth making: whether explaining a one-off as fragments of the past costs less than
  the structure it adds. That is the old bill's question (RM-9), and nothing at the level of cells asks it yet.

## Violations (CTR-2 CON-7)

- **Given by hand (CON-2):** the world, its proportions and its order; a blank before every input; which columns are
  objects, noise and a variable.
- **The yardstick's count** breaks CON-9 on purpose, and is declared. It made no difference, because it never acted.
- **All four rules are proposed and unconditional,** on a copy of the core. Two changes were made after the
  development seed: the fade arm and the second world (PREREG).
- **Measured by our code:** heat and recall are read from the moments' reports. The volume never reads them.

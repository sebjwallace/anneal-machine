# C46 · Findings (out-*.txt; under 2 s a run)

| days lived | days kept | real new routes let through | real routes wrongly doubted | made-up routes caught |
|---|---|---|---|---|
| 300 | all / 100 / 30 | 2 / 2 / 2 | 0 / 0 / 0 | 4 of 4 / 4 of 4 / 4 of 4 |
| 1000 | all / 100 / 30 | 2 / 2 / 1 | 0 / 0 / 1 | 8 of 8 / 8 of 8 / 8 of 8 |

**Every made-up road was caught, and no real route was doubted** while enough days were kept. The made-up roads
(Z → G, X → E, K → Y …) each contain a step no remembered day ever took. The real new routes contain only steps that
some day did take: only the combination is new.

**Keeping too few days starts to doubt real routes** (30 days out of 1000: one real route doubted, because the day
that walked one of its steps had been forgotten). Still no made-up road got through. Doubting is the safe way to fail.

**Small numbers.** This park only gives 2 real new routes to check, so the "let through" side needs a bigger test.

**The rule, in plain words.** A new combination of lived steps is fine. A new step is suspicious until tried. The
check uses the same recall rule as everything else, so nothing was bolted on. Engine unchanged.

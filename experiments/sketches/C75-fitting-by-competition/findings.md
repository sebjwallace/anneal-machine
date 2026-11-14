# C75 · Fitting by competition alone: findings

Test seeds 4242 (the engine test's), 101-104; settings fixed in [PREREG.txt](PREREG.txt) after development seed 1. The
engine copy is [engine-see.js](engine-see.js); only `explain` (and, for two arms, `greedy`) changed. Output: `out.txt`;
the engine's full test suite run each way on a throwaway copy of `src/`: `suite-search.txt`, `suite-compete.txt`,
`suite-settle.txt`. The core was not touched.

## Arms
- **search:** today.
- **compete:** one competition pass, no search over openings.
- **refuse:** one pass; a dead heat between different rivals for the same cells is refused, not broken by order.
- **settle** (*added after the test results; not pre-registered*): one pass, then re-settle only where heat is left. A
  winner that claimed cells that aren't lit is taken back and the rivals compete again without it, repeated while winners
  still leave such heat (up to 6 times, a compute limit), keeping the cheapest result. Cells with no heat are never
  re-contested.

## Results

**Part A: one model learnt with search; the same 300 fresh scenes fitted each way (1,500 fits over five seeds)**

| | same cost as search | dearer | total extra cost | competition passes per scene | tally work per scene | time |
|---|---|---|---|---|---|---|
| search | 1500 | 0 | 0 | 27.9 | 38,844 | 4,910 ms |
| compete | 1495 | 5 | 0.1% | 1 | 954 | 118 ms |
| refuse | 1495 | 5 | 0.1% | 1 | 954 | 194 ms |
| **settle** | **1500** | **0** | **0** | 1 (and a few re-settles) | 957 | **144 ms** |

**Part B: each arm learns from scratch (600 scenes, rest every 98), judged by the engine test's yardstick**

| | units (mean) | yardstick (mean) | shapes recovered | learning time (mean) |
|---|---|---|---|---|
| search | 11.4 | 1163 | 11/11 on every seed | 14.1 s |
| compete | 11.4 | 1163 | 11/11 | 12.8 s |
| refuse | 12 | 1170 | 11/11 | 12.5 s |
| **settle** | **11.4** | **1163** | **11/11** | **12.6 s** |

compete and settle learnt *exactly* what search learnt on every seed: the same units, memories and yardstick.

**The engine's test suite** (all pass in every arm):
- **Change and kinds tests:** identical in every arm.
- **compete** differs in three places:
  - the seeing yardstick, 1173 against 1172;
  - the cells test's case B, where two sticks side by side are explained as one box. The box covers all six cells but
    claims two that aren't there, costing 3.5 against 3.0. It saves most on its own, so it wins first;
  - completion with hidden parts: better when not told where (98% against 94% at 0-25% hidden), but a few more pixels
    drawn that were never there.
- **settle** matches search everywhere, including case B, except completion with hidden parts:
  - better when not told where (97% against 94% at 0-25% hidden);
  - about the same elsewhere;
  - slightly more pixels drawn that were never there at 40% removed (54 against 49, 0.14% against 0.13% of empty
    pixels).

## Predictions

| | prediction | result |
|---|---|---|
| P1 | compete matches search exactly on ≥ 95% of scenes, extra cost ≤ 1% | **Holds:** 1495/1500, 0.1%. |
| P2 | ≥ 10 times less fitting work | **Holds:** 1 pass against 27.9, about 40 times less tally work and time. |
| P3 | learning the same: shapes equal, units within 1, yardstick within 2% | **Holds, exactly:** identical on every seed. |
| P4 | refuse within the same bounds | **Holds:** one more unit on three seeds, yardstick +0.6%, all shapes. |
| P5 | learning time falls by less than 20% | **Holds:** 9-11%. Rest, not awake fitting, is most of the time. |

## What it means

- **The search in fitting was almost pure overhead.** Competition alone gave the same fit on 1,495 of 1,500 scenes and
  learnt exactly the same assemblies, with about a fortieth of the work. The five it missed are one kind of case: one
  big assembly that covers everything but claims cells that aren't there, against two smaller ones that fit exactly.
- **Re-settling where heat is left closes that gap, in the engine's own terms.** The misfit a winner leaves (cells it
  claimed that didn't light) is exactly where the competition is reopened, and nowhere else (CTR-1 CAP-7, PRN-3). That
  is annealing in small: shake only what is still hot. With it, every fit matched search, and learning was identical.
- **Refusing dead heats costs a little structure here.** Breaking ties by order never hurt in these worlds; refusing them
  kept one extra unit on three seeds. Ties in fitting are rare at the end (none in part A), but common during learning
  (2,000-4,000 per run).
- **What is still a search, or a list:**
  - **The candidates come from a tally of every unit against every lit pixel.** That is association in bookkeeping
    form: counting each placement's active pixels, like a segment counting its active links. But at the pixel level
    nothing can be skipped, because every lit pixel fits every point of every unit. Sparse association needs input
    cells with identity, as one level up, where columns are parts.
  - **Rest is now most of the cost, and it searches too:** comparing every pair of parts at every shift.
  - **Re-settling is capped at 6 rounds,** a compute limit.

## Given by hand (declared)
The world and its pictures (the engine test's). The cap of 6 re-settling rounds. Nothing else.

serves: CTR-1 CON-18, OPZ-2, OPZ-3, PRN-2, PRN-3, CAP-7; CTR-2 OPZ-4.
Violations removed (in the copy): the search over openings in fitting.

## Decided
**Brought into the core** with the owner's approval (14 November 2026): `explain` in `src/engine/see.js` is now competition with re-settling (`settle`), and the search over openings (`openings`, and greedy's "take this first") is removed. The full test suite run after the change matches `suite-settle.txt` line for line. Before that, the question was whether `explain` in the core should become competition with re-settling (`settle`). By CTR-2 CON-1 that needs the owner's
approval and tests identical or better. Every test is identical except completion with hidden parts: better on the main
measure (not told where), and very slightly worse on one figure (pixels drawn that were never there, 54 against 49 at
40% removed).

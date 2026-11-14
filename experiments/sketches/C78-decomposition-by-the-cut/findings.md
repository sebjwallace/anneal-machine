# C78 · Decomposition by the cut: findings

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after development seed 1. Output: `out.txt`. A simulation
of cells, columns and segments only.

## Results (the top-level cut)

| cells per column | families | cut right (wall / roof / new roof) | links per family | from a roof, plain: the other roof too | from a roof, whole: right whole / clean / other roof too |
|---|---|---|---|---|---|
| 16 | 10 | 100 / 100 / 100 | 114 (both wholes: 264) | 100% | 100 / 94-96 / 0 |
| 16 | 50 | 100 / 100 / 100 | 114 | 100% | 100 / 88-89 / 0 |
| 16 | 200 | 100 / 100 / 100 | 114 | 100% | 100 / 63 / 3-4 |
| 64 | 10 | 100 / 100 / 100 | 114 | 100% | 100 / 100 / 0 |
| 64 | 50 | 100 / 100 / 100 | 114 | 100% | 100 / 99 / 0 |
| 64 | 200 | 100 / 100 / 100 | 114 | 100% | 100 / 96-97 / 0 |

From the wall alone, both roofs came back every time, in every arm.

**The comparison cut** (every cell with support ≥ 2, not just the top level) was right in 38% of families at M = 10 and
9% at M = 50 (64 cells per column). Chance predictions from other memories joined the parts, which grew to thousands
of links.

## Predictions

| | prediction | result |
|---|---|---|
| P1 | the top-level cut right in ≥ 95% of families | **Holds:** 100% everywhere. |
| P2 | 114 links against 264 | **Holds.** |
| P3 | plain reading: the other roof comes back too, ≥ 95% | **Holds:** 100%. |
| P4 | whole reading: the other roof ≤ 5%, the right whole ≥ 95% | **Holds:** 0-4%, 100%. |
| P5 | whole reading, 64 cells, M = 200: clean ≥ 90% | **Holds:** 96-97%. |
| P6 | the comparison cut right ≤ 50% at M = 50 | **Holds:** 9%. |
| P7 | from the wall alone, both roofs ≥ 90% | **Holds:** 100%. |

## What it means

- **Decomposition can be done by cells.** No pair of parts was compared, and nothing searched over shifts. The shed woke
  the memory it resembled, and the cells' own states drew the line between what fits and what doesn't. Cutting there
  found the right wall, roof and new roof in every family. That is Sagan's intercomparing done by the memory itself: the
  overlap the comparison finds is the abstraction, and it ends up shared on the same cells.
- **It pays.** The decomposed and rebound pair costs 114 links against 264 for both wholes: the energy rule's reason to
  decompose, now counted in links.
- **The top level of support is what makes the cut clean.** Read without it, chance predictions from other memories
  join the parts and the cut is right in under half the families. The same shared level of inhibition as C74.
- **A shared part needs competition between whole memories.** Read plainly, the shared wall always wakes both
  compositions. With the bindings competing (the one with more of its binding active wins), each roof brought back its
  own whole and the other almost never (0-4%). This is where that competition is needed, unlike the chance crowding of
  C77, which only more cells fixed. And from the wall alone, both roofs came back: genuinely ambiguous, and nothing
  refused it. Whether it should be refused (CTR-1 CON-7) or held as two possibilities is open.
- **Crowding again sets the limit.** At 16 cells per column, clean recall fell to 63% at 200 families; at 64 it stayed
  at 96-97%.

## Simplified and given by hand (declared)
- The world is random sets of columns.
- The house is stored exactly and the shed arrives once.
- The wall's columns are exactly the same in both.
- The cut is made at once, with the old segments replaced in one step.
- Which cells are sampled for a binding: the first two and the last two of each part.
- Bookkeeping: binding segments know they were grown to bind (`kind`), and the whole reading compares them with each
  other. A segment's kind is local to it, not a list of assemblies, but it is a choice; whether binding segments can
  compete without it is open.
- The shared level of inhibition is one number over the candidates: global, as in C74.

serves: CTR-1 CAP-1, CAP-3, CAP-4, CON-19, OPZ-3; CTR-2 CON-8 (the cut uses no list of assemblies).

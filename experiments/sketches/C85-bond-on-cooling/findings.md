# C85 · Bond on cooling: findings

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after development seed 1 (`dev.txt`). Output: `out.txt`
(pooled from `seed-101.txt` to `seed-105.txt` by `pool.js`). Serves: CTR-1 CON-1 (one rule), CON-14 (memory is finite),
OPZ-3; CTR-2 CON-2, CON-7. Theory: [flow and heat](../../../docs/theories/flow-and-heat.md).

## Results (pooled means; quarter 1 → quarter 4)

**Noise on its own columns:**

| arm | segments | objects from half, exact | "x" exact | heat per moment: unheld / unthere |
|---|---|---|---|---|
| core | 394 → 549 | 100% | 0% | 0.24 → 0.00 / 25.7 → 26.6 |
| pays | 1,549 → 5,324 | 100% | 20% | 4.7 → 4.2 / 1.3 → 2.5 |
| pays-squeeze | 510 → 521 | 100% | 100% | 4.0 → 3.7 / 1.1 → 1.2 |
| **cooling** | **509 → 529** | **100%** | **100%** | **4.0 → 3.7 / 1.1 → 1.2** |

**Noise on the objects' columns:**

| arm | segments | objects from half: complete, exact, extra columns | heat: unheld / unthere |
|---|---|---|---|
| core | 417 → 591 | 100%, 0%, 60 of 60 | 0.01 → 0.00 / 50.5 → 51.3 |
| pays | 2,349 → 7,875 | 36% → 13%, 36% → 13%, 0 | 6.8 → 5.5 / 5.7 → 10.0 |
| pays-squeeze | 492 → 579 | 27% → 37%, 13% → 27%, 0.4-0.6 | 4.7 → 4.5 / 2.1 → 2.5 |
| cooling | 480 → 542 | 47% → 27%, 30% → 20%, 0.2-0.3 | 4.2 → 4.1 / 1.7 → 2.1 |

In the pays-squeeze and cooling arms, about 4,000-5,000 cells were cleared over the stream, and 3,800-6,600 woken
memories were refused for claiming more than they explained.

**The core's tests on the pays arms:** 11 of 16. Tests 9, 12, 13, 14 and 16 fail. Each needs a small part to bring back
a much larger whole (a quarter of the square, one part of the Z), which the bill forbids.

## Predictions

| | prediction | result |
|---|---|---|
| P1 | own: pays-squeeze and cooling flat (within 15%); core grows ≥ 1.2 times | **Holds:** +2% and +4%; core 1.39 times. |
| P2 | own: unthere ≤ 3 in pays-squeeze and cooling; ≥ 20 in core | **Holds:** 1.2 against 26.6. |
| P3 | own: objects exact ≥ 95% in every arm | **Holds:** 100%. |
| P4 | pays alone ≥ 5 times the core's segments | **Holds:** 9.7 and 13 times. |
| P5 | shared: cooling exact above pays-squeeze; extra columns ≤ 1 in pays arms, ≥ 50 in core | **Fails in part:** cooling 20% against pays-squeeze 27%. Extra columns 0-0.6 against 60: holds. |
| P6 | unheld ≥ 3 in every pays arm | **Holds:** 3.7-5.5. |
| P7 | "x" exact 100% in pays-squeeze and cooling | **Holds.** |

## What it means

- **Where one-offs have room of their own, the premise works.** With the bill at the fit, a one-off is no longer
  explained as fragments of the past: it is left unexplained ("unheld", about 4 cells per moment), stored loose, and
  cleared when cells run short. Structure is flat (about 520 segments, against the core's 394 rising to 549).
  "Something held that isn't there" falls from about 26 cells per moment to about 1: twenty times less heat held in
  structure. The objects keep exact recall, and "x" holds its current value. This is the flow-and-heat picture
  measured: the heat of the imperfect world passes through instead of being baked in as patches.
- **Refusing to patch needs somewhere for the heat to go.** The bill alone, without clearing, makes it far worse: every
  one-off is stored new and kept, and structure grows nine to thirteen times the core's. Leaving heat unexplained
  only works if loose structure can flow out again.
- **Where one-offs share the objects' cells, capacity becomes the fault.** The chaining is gone (half an object brings
  back at most one stray column, against the core's whole volume). But one-offs now take cells in the objects' own
  columns, and the squeeze clears object cells as readily as noise cells. Exact recall is 20-27%. The core gets 100% of
  the right columns, but only because it brings back all 60 others with them.
- **Freezing by return did not protect the objects here** (P5 fails). A whole fills in its links only when it is seen
  with nothing in it new. Once an object has lost a cell to the squeeze, it never is, so it never freezes, and it is
  cleared as easily as a one-off. In the own world it made no difference either way.
- **The bill forbids recall from a small cue.** A quarter of the square can't bring back the whole: it explains 4 and
  claims 12. In a stream the machine can't tell "not there" from "not seen yet". The old core marked hidden parts as
  known-unknown, which priced them at nothing. Nothing in the cells does that yet. This is the clearest open question
  the experiment leaves: when is completing a memory from a small part worth what it claims?

## Violations (CTR-2 CON-7)

- **Given by hand (CON-2):** the world, its proportions and order; a blank before every input; which columns are which.
- **The pays rule reads memories by grouping the woken cells** (as the cut does), one pass after settling, with no
  re-settling once a memory is refused. The prices (1 and 1) are RM-9's, not tuned.
- **All rules are proposed and unconditional** on a copy of the core, with C82's loosening and C84's squeeze and densify.
- **Measured by our code:** heat and recall are read from the moments' reports.

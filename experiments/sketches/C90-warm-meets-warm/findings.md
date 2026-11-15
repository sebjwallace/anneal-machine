# C90 · Warm meets warm: findings

Seeds 201-210, predictions fixed in [PREREG.txt](PREREG.txt) before any run but a smoke check (`smoke.txt`). Output:
`out.txt`. The engine is C89's, unchanged. Serves: CTR-1 CAP-10, CAP-1; CTR-2 CON-7 (PRN-2: measured against a
baseline before believing).

## Results (ten seeds; cells shared when the fronts meet, mean)

| link | no context | walking | swimming | flying |
|---|---|---|---|---|
| "cat mammal" | 4.0 | **9.0** | 4.0 | 4.0 |
| "cow mammal" | 4.2 | **9.0** | 4.2 | 4.2 |
| "fish mammal" | 2.8 (step 2.6) | 3.6 | **4.0 (step 2.0)** | 2.8 |
| "shark mammal" | 2.6 (step 2.4) | 3.0 | **4.0 (step 2.0)** | 2.6 |

Seed by seed against no context, more cells or sooner: walkers after walking 10 of 10 each; fish after swimming 8 of 10,
shark 9 of 10; swimmers after walking 4 and 2 of 10; walkers after swimming 0; everything after flying 0. "Cat flies"
and "bird walks" never met. Every connected link met in every seed and context.

## Predictions

| | prediction | result |
|---|---|---|
| P1 | walkers after walking: more cells, ≥ 8 of 10 each | **Holds:** 10 and 10. |
| P2 | swimmers after swimming: more cells or sooner, ≥ 8 of 10 each | **Holds:** 8 and 9. |
| P3 | mismatched and flying contexts: never more or sooner, ≥ 9 of 10 | **Fails in part:** walkers after swimming 0 and every link after flying 0 (holds), but swimmers after walking 4 and 2 of 10. |
| P4 | unconnected links never meet | **Holds.** |

## What it means

- **Confirmed: warm meets warm.** On fresh seeds and two new animals, a context that warms the right patch of the deep
  makes a fitting piece take hold more widely when it lands: the walkers met on all of "walks" (9 cells, a whole thing)
  in every seed after a walking context, against about 4 cells without. The swimmers, which had room to, met sooner
  as well as bigger.
- **The "mismatch" wasn't one.** The walking context is about dogs, humans and horses, and all three are mammals. So it
  warms the "mammal" end of "fish mammal" and "shark mammal", and helped them a little. The prediction treated the
  context as matching or not; the deep treated it, rightly, as touching one end. The flying context, which touches
  neither end, changed nothing anywhere.
- **Still never inventing.** Priming made no unconnected link meet, in any context.
- **The size of the aha now depends on something.** How much of the deep lights up at the moment the dots connect
  depends on how warm the ground was, and where. That is the first graded fit in this line of work.

## Violations (CTR-2 CON-7)

As C89 (its engine and test, unchanged): the world, teaching and contexts given; a blank before every input; the deep
gated during the context; warmth lasting the whole context; the test run by the experiment; measured by our code.

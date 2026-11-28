# C185 · Breadth from the trouble: findings

Run: one seed at a time, `ARM='breadth from the trouble (seed N' node heat.js > out-seedN.txt` (about four minutes a
seed). Diagnostic, added after seeds 1 and 2: `DIAG=1 ...` ([diag-seed2.txt](diag-seed2.txt)). Read [the
hypothesis](hypothesis.md) first, written before the run.

## In short

**Anchored, widening breadth-first learned the second row in 1 of 3 seeds** (seed 1, 471 runs, 200 of 200, on the fourth
worked example). Seeds 2 and 3 learned nothing (0 of 200). Times one digit was easy in every seed (11 runs). It didn't
churn (C181), stick one step short (C182, C183) or drift (C184). It found a new trap: **the anchor walked into the wrong
basin.**

**What happened** (the diagnostic, seed 2, first second-row example). Single changes moved the best so far forward, each
cooling every place it had cooled and more. But one of those steps was a coincidence: holding a digit of the first row's
carries, which happened to give right answers in the columns tried so far. From that anchor, the right way of working
was four changes away (the hold, the answer write, the carry write and the carry read). Pairs can't reach four changes,
and everything within a single change or a pair of the anchor was used up within about a hundred attempts. So it was
"nothing left within reach". **Inclusion wasn't the problem:** the right way of working would have covered the best
(it cools 10 places, including all 7 of the best's).

**What it shows.** Anchoring at the best so far is only as good as the path that led there. A step that looked like
progress, because it was a coincidence, can lead into a basin whose way out is further than the widening reaches. The
owner's picture already has the answer: **when a basin fills with heat, you're pushed out of it, back along the way
you came.** Here the basin was exhausted, every nearby change tried and residue everywhere, but the learner had nowhere
to go back to. Its earlier, less-far states, where the wrong step was taken, were forgotten as anchors. Breadth-first
over the path itself (back off to the previous best and widen there) is the natural next step.

## Results

| seed | times one digit (runs) | second row (runs) | second row test (200 new, from the start) |
|---|---|---|---|
| 1 | 11 | 471 (stuck on three examples, settled on the fourth) | 200 of 200 |
| 2 | 11 | 468 (stuck on all four) | 0 of 200 |
| 3 | 11 | 412 (stuck on all four) | 0 of 200 |
| C183 (worse undone) | 11 to 12 | 154, 196, 307 | 200, 200, 0 |
| C184 (nothing undone) | 12 to 79 | 2,291 to 3,275 | 0, 0, 0 |

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | times one digit within about 5 attempts, every seed | **Holds** (11 runs in every seed). |
| 2 | the second row learned in all 3 seeds, 200 to 1,500 runs | **Fails:** 1 of 3. |
| 3 | risks: inclusion too strict; pairs too many; a coincidence | **Inclusion wasn't too strict, and pairs weren't too many.** A coincidence took the anchor into the wrong basin, close to the third risk but worse than predicted: it wasn't corrected later, it trapped. |

## The ledger

As the hypothesis. **Still the code's:**
- the candidates' ordering and the widening;
- practising, blame, and the inclusion test.

**Disclosed:** the diagnostic was added after seeds 1 and 2, and changes nothing in the runs.

## What it shows

Of the ways tried so far, the anchored, widening search is the most controlled. It neither churns nor drifts, and its
failures are readable. Its weak point is that the best so far is a single point, so a coincidental step can carry it
into a basin it can't widen out of. The next step: keep the path as anchors too, and when the current basin is full,
back off one step and widen from there.

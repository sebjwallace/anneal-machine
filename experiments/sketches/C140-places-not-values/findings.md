# C140 · Places, not values: findings

Run: `node space.js > out.txt` (a second or two; every arm's first seed is shown example by example in
[out.txt](out.txt)). Read [the hypothesis](hypothesis.md) first, especially its ledger. Engine: C139's copy, unchanged.

## In short

**Variables as places work when the places are relative to the frame, and fail when they are absolute.** With relative
places, the procedure "read the place one to the left of the '−', then the place one to the right" was learned in every
seed from one or two worked examples, among a space full of distracting digits. The engine recalled it from "−" alone,
and it answered all 2,000 test problems correctly, at positions no training problem had used, with numbers never seen.
With absolute places, the memory bound particular cells. Where it bound one, it confidently read the wrong cells at
test (93% wrong). Where it bound several, they jammed and it gave no answer.

**The engine can't yet build relative places itself.** In the side probe, after walking every column both ways, the
engine got the next column exactly right from 0 of 30 starts. It can't tell "I arrived at column 5 by moving right"
from "I'm leaving column 5 by moving right", so the step before and the step after tie, and nothing comes on.

**Honestly, about what did what:** in the relative arm, carrying to new positions and numbers comes from the declared
relative coordinates (adding the offset to where the "−" is), not from anything learned. What was learned is *which*
relative places, by the experiment's heat rule; the engine stored and ran it.

## Results

| arm | right | wrong | no answer | seeds at 100% | learnt at example (min / median / max) | procedures bound (mean) |
|---|---|---|---|---|---|---|
| **relative** | **100%** | 0% | 0% | **20 of 20** | 1 / 2 / 2 | 1.0 |
| absolute, held open | 0.7% | 9.3% | 90% | 0 of 20 | 1 / 2 / 6 (never in 1) | 2.5 |
| absolute, first fit | 0.7% | 9.3% | 90% | 0 of 20 | 1 / 2 / 6 (never in 1) | 2.5 |

The absolute arms, split by how many procedures a seed bound:

| procedures bound | seeds | right | wrong | no answer |
|---|---|---|---|---|
| 0 | 1 | 0% | 0% | 100% |
| 1 | 2 | 7% | **93%** | 0% |
| 2 to 4 | 17 | 0% | 0% | 100% |

The two absolute arms gave identical results seed by seed (below, 2).

**Side probe:** exactly the right column the moment after a move, from 0 of 30 starts. In the middle of the row,
nothing comes on. At the two ends, the right column comes on but the start column stays on with it.

## What it shows

### 1. Relative places carry; absolute places don't

In the relative arm, the first worked example usually left two candidates open (some other pair of nearby digits
happened to give the same answer), and the second settled it: −1 then +1. From then on every example was cooled by
recall, with no search. At test, from "−" alone, the engine brought on −1 then +1, and the numbers read from those
places gave the right answer every time, at "−" positions 10 to 12, which training never used.

This is the frame-and-variable shape from the conversation, working: **fixed content ("−") at a place, variables as
places relative to it, values carried by whatever sits there.** It is the same indirection C139 got from registers, now
from space.

### 2. Absolute places either mislead or jam

An absolute cell fits one example at most, so the held-open rule and the first-fit rule behave the same here: they bind
whenever a single example has a unique fit, and positions never repeat, so the "unchanged by a whole example" case
never arises. Hence the identical results. This was a wrong prediction (below): I expected the held-open rule never to
settle, and missed that it settles at once on a first unique fit.

What happens next is the important part. Seeds that bound **one** absolute procedure read those same cells at test,
where unrelated digits now sit, and answered confidently and wrongly (93% wrong). Seeds that bound **several** jammed,
because the engine brings them all on together (C139's finding: repeated bindings sit side by side and don't compete),
and gave no answer. So absolute places fail in the worst way when the memory is confident, and safely only by accident.

### 3. The engine can't combine where it is with which way it moves

The probe, traced at column 5 moving right: the memory holds "column 4, then right, then column 5" and "column 5, then
right, then column 6". Given column 5 and right together, both match equally: each has column 5 and a right move in
it. The engine can't tell whether column 5 is where it is now or where the move arrived, so the two tie, the tie is
held, and nothing comes on. Its states are sets, which don't record which came first, and its chains open a step from
the step before alone, so they can't require "this column **and** this move". At the ends of the row only one of the
two exists, so the right column does come on, but the start column stays on with it.

That's the precise reason the relative coordinates had to be declared. For the engine to build "one to the right"
itself, it needs to combine where it is with which way it moves, and to know which of the two came first.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | relative: learned in every seed within six examples; 100% right, no wrong answers | **Holds:** learned at example 1 or 2; 100%; 20 of 20 seeds. |
| 2 | absolute, held open: never learns; no answer | **Fails as stated:** it binds whenever one example has a unique fit (in 19 of 20 seeds). It still never answers correctly: 0.7% right. |
| 3 | absolute, first fit: mostly wrong (≥ 60%), right < 15% | **Fails as stated:** 9.3% wrong overall, because 17 of 20 seeds bound several procedures and jammed. Where one was bound: 93% wrong, 7% right, as predicted. |
| 4 | side probe: moves don't single out one column | **Holds:** 0 of 30 exact. The reason was predicted in part (a step opening from the step before alone); the tie between arriving and leaving was found in the trace. |

## The ledger, after the run

**Given:** the space and its contents; where the "−" is; reading a cell; the arithmetic facts; the search; the fit
test; the heat rule; and in the relative arm, **turning an offset into a cell (the relative coordinates)**.

**The engine:** stored each procedure and recalled it from "−" alone; jammed when several were stored (as in C139); and,
in the probe, failed to turn a column and a move into the next column.

**So the honest summary:** variables as places relative to a frame do what the theory says they should, **once relative
places exist.** The memory learned which places from one or two examples, among many distracting numbers. But the
relative places were declared, and the engine, as it stands, can't make them from its own walking.

## What it suggests next

1. **Combining where it is with which way it moves.** The smallest missing piece for spatial memory. The engine needs
   something that responds to a column and a move together, and knows the column came first. One honest place to
   start: a gate on the target column that needs both the start column and the move (the engine's own gates, with
   order kept by what was held against what arrived, as in learned computation §2). Tested by this probe: exact next
   column from every start, and then two steps in a row.
2. **Repeated bindings jam (C139, again here).** Still the most important gap in how the engine learns on the job.
3. **Then the full loop:** relative places built from the engine's own moves, with the same procedure test as here.
   Only then is "it carries to new positions" evidence about the memory rather than about the declared coordinates.

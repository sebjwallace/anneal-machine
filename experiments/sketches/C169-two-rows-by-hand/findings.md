# C169 · Two rows, by hand: findings

Run: `node long.js > out.txt`, about fifteen seconds. Read [the hypothesis](hypothesis.md) first. Engine: C168's copy,
unchanged. All by hand.

## In short

**Both rows of a long multiplication, from one cue, entirely inside the memory.** In all 200 multiplications (2- to
5-digit tops by 2-digit multipliers): the first row was worked right, its end handed over to the jump, the jump brought
the focus to one column left of where the procedure started, the second row was worked right and in the right place,
and then the procedure let go and the memory went quiet. **200 of 200 with both rows right.** The restart that C163 did
by hand (the experiment moving the focus to the second row's start and giving the cue again) is gone. The memory now
finds the second row's start itself, from the start latch plus one relation between places.

**The relation matters.** Jumping to the start itself rather than one to the left, the second row began under the
first row's last column, found the multiplier's units digit to hold and nothing to read in the top row, and ran out at
once. That's 0 of 200. So "one to the left of where it started" is doing real work. It's the smallest spatial
composition: a held anchor plus a relation.

## Results

| arm | first row right | jump landed one left of the start | second row right and in place | let go, went quiet | both rows right |
|---|---|---|---|---|---|
| **two rows** | 200 of 200 | 200 of 200 | 200 of 200 | 200 of 200 | **200 of 200** |
| jump to the start itself (control) | 200 of 200 | 0 of 200 | 0 of 200 | 200 of 200 | 0 of 200 |

For example, 40 × 74: the first row came out 160, the second 280, one place to the left, the sign carried along the
row below the first, the second row's carries written above it, then quiet (53 moments in all).

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | two rows: both right and in place, one jump one column left of the start, quiet | **Holds**, 200 of 200. |
| 2 | jump to the start itself: the first row right, the second fails nearly always | **Holds**, 0 of 200 second rows. |

## The ledger

**Given:** the frames, the procedure, the hand-overs, the jump's relation ("one to the left of the start") and Done, by
hand. Architecture: the clock with the arrival from competition, frames held by their own running, holding, the start
latch, the focus kept through hand-overs, letting go by competition. The encoder: the page, **including a 0 carried in
above where each row starts** (the second row's is new here), and the sign once. The facts. **Removed:** C163's restart.
**Disclosed:** one run.

## Where this leaves long multiplication

Every movement now runs from one cue, inside the memory, by hand: two rows, the hand-over between them, finding where
the second row starts, and finishing cleanly. What isn't here yet: **adding the two rows** (the reading frame exists;
the hand-over to it and the place it starts are the same kind of piece as here), and more than two rows (the second
row's frame is specific to the tens digit, so a third row would need either a third frame or a frame that works for
any row). And all of it is still written by hand. Learning these structures, the procedure, its hand-overs and the
relation, is the step after.

# C156 · Long multiplication, a taste: hypothesis

Follows [C155](../C155-times-one-digit/findings.md), where one learned step added, subtracted and multiplied by a
single digit, carrying the sign and the multiplier along by writing them on to the next column. Long multiplication is
the aim. By agreement with the owner, this is a **short run for an early indication**, not a thorough experiment: two
seeds, a few examples, a small test.

## What was seen before writing this

Before this hypothesis, the C155 step was put by hand on long-multiplication pages: the multiplier written as on
paper, two digits in the bottom row, right-aligned. It got **the first row wrong from the second column on**: 47 × 36
gave 162, not 282, and 583 × 24 gave 1172, not 2332. The reason is plain. The step carries the multiplier by writing
it into the place to its left, but on a two-digit multiplier that place already holds the next digit (the 3), and a
place that holds something is never written. So the next column reads the 3 and multiplies by that.

## The question for the run

Can the learner find, from worked long-multiplication pages, a way to do **just the first row** (the top number times
the multiplier's units digit) on the paper layout? This is the first piece of long multiplication. The second row (going
back to the start, one place further left, with the next digit) and adding the rows come after it, and aren't tested
here.

The layout is C155's: carries above, the top number, the multiplier in the bottom row (now two digits), the first row
of the answer below, the sign once below that. The worked examples show the top number times the units digit, with its
carries, as the working. The rows for the second partial product and the sum aren't on the page for this run, because
the first row's step can't reach them and they would only add size.

## Setup

C155's learner, unchanged, with one constraint added to the proposer: **a step can't write its sign and its pass-on
into the same place.** The write rule never lets one place hold two things, but a lane's own copies of places could (a
sign copy and a digit copy of the same place). Without this, a lane could "carry" the multiplier in the sign's place,
which the test circuit could never do. Per seed: C155's first three examples ("+", "−", "×" one digit), which as in
C155 leave the one step in the store, then **three worked long-multiplication first rows** (2-digit top numbers times
2-digit multipliers). Each goes to recall, then replay, then search, as in C155. Two seeds.

Test, per seed: whatever the store gives, on 20 long-multiplication first rows (3 to 5 digit top, 2-digit multiplier),
and on 20 single-digit multiplications (to see whether anything was disturbed).

## The ledger

**Given:** everything given in C155; the long-multiplication page layout; the new proposer constraint. **The engine:**
as C155.

## Predictions (fixed before running)

1. **Recall and replay fail** on the long pages: every step in the store passes the multiplier to the left, and that
   place is full.
2. **Search finds nothing that settles.** To carry the multiplier, the step must write it where the next column will
   read it. The only place the first column can read it from is directly below the top digit, so the write must go
   one place to its left, and that place holds the next multiplier digit. There's no empty place in reach to carry it
   through. So the store keeps C155's step: **0% on long first rows, 100% on single-digit multiplication still.**
3. If that holds, the indication is that **long multiplication on the paper layout needs the multiplier held somewhere
   other than the page**: held on in the circuit while a row runs, the way a person keeps "times 6" in mind. That would
   be the first case where something has to be held rather than written, and it bears directly on the question of
   states.

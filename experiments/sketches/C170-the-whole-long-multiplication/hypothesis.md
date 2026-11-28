# C170 · The whole long multiplication, by hand: hypothesis

Follows [C169](../C169-two-rows-by-hand/findings.md), where both rows of a long multiplication ran from one cue, inside
the memory. Here the rows are added, so **one complete long multiplication runs from a single cue to its final
answer.** All by hand.

## The procedure

One procedure, started by the cue, five pieces in a chain, each hand-over on an arrival and keyed on the procedure, the
arrival and a sparse sample of the frame that just ended (C165, C166):

1. **The first row** (the holding frame): the top number times the multiplier's units digit.
2. **A jump** to one column left of the start latch (C169).
3. **The second row** (the second-row frame): times the tens digit, written one row down and one place left.
4. **A jump** to the start latch itself: back to the column where everything began. Same latch, a different relation.
5. **Adding the rows** (a third frame, written by hand: read the first row and the second row in the same column and the
   carry above the sum, write the units below, the carry up and to the left, move left; its family is addition, fixed
   as one of its parts, since the page has no "+" for this step).
6. **When the adding runs out:** Done, and the procedure lets go (C167).

## What's given (declared)

The frames, the procedure, the hand-overs, both jumps' relations and Done, all by hand. Architecture as C169, with the
page two rows deeper (the sum's carries and the sum), so the reach goes five rows below the working row. The encoder:
the page, with a 0 carried in above where each of the three passes starts, the sign once, and **two layout points that
are also on paper.** First, the top number is padded with two leading zeros instead of one, so the first row is as long
as the second (otherwise adding would run out a column early). Second, a 0 is written in the second row under the first
row's last digit, the placeholder people write. The facts (multiplication and addition).

## Arms

1. **The whole procedure:** 200 long multiplications, 2- to 5-digit tops by 2-digit multipliers.
2. **Adding starts one column left** (control): the second jump goes one column left of the start, as the first does.
   The adding should then miss the first row's last digit and come out wrong.

## Predictions (fixed before running)

1. **The whole procedure:** in every case, both rows right, the final sum equal to the product, and the memory quiet by
   itself at the end, with nothing still on.
2. **Adding starts one column left:** both rows right, but the final sum wrong in nearly every case (right only when
   the first row's last digit is 0).

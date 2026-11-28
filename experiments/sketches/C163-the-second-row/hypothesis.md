# C163 · The second row (a taste): hypothesis

Follows [C162](../C162-abstraction-from-competition/findings.md). Long multiplication is the aim: for 47 × 36, a first
row (times 6), a second row (times 3, one row down and one place left), then adding the rows. The memory has ways of
working for the first row (holding the multiplier for the row) and for adding (reading fresh each column). The second
row is a third way of working. It holds the multiplier's other digit, reads the top number one place to the right of
where it writes, and writes onto a new row. A taste, by agreement with the owner.

## What this taste tests, and what it gives

**Tested:** whether a third way of working can live alongside the other two in one memory, chosen by context, where the
natural context for the second row is that the first row is already written above it; and whether the first and
second rows then run one after the other on one page.

**Given, declared, and this is a change from what was proposed:** the second-row frame is written by hand, not
learned. With the reach the second row needs (three rows up and down from the working row, 21 places instead of 15),
the search for a frame grows roughly tenfold or more, and the multiplier digit it holds is under one column only,
which the search can't judge. That's the cost the proposing crutch was expected to hit, and learning this frame is left
for when that's dealt with. Also given, as in recent tastes: the other two frames as already learned, the signs'
meanings, and binding a frame with what was in view. And **the restart**: after the first row, the focus is put at the
start of the second row, a 0 is written above it as the carry in, and the cue is given again.

**The engine:** settling each worked pass with all three frames tried, binding the frame with what was in view,
recalling from the cue plus what's in view (with C162's rule for ties), and running every test.

## Setup

Worked passes cycling: an addition, a subtraction, a long multiplication's first row, its second row (with the first
row already written on the page). 8 and 24 passes per seed, 4 seeds. Test, 20 of each: additions, subtractions, first
rows, second rows (on a page with the first row written by the encoder), and whole two-row multiplications (the first
row recalled and run, then the restart, then the second row recalled and run on the same page).

## Predictions (fixed before running)

1. **Each worked pass settles with exactly its own frame,** in particular the second-row pages only with the
   second-row frame (the first-row frame can't write where the first row already is).
2. **Recall picks the second-row frame for second rows,** cued by the first row being written above, and never for
   anything else. Wrong frames stay at or near zero, as they have throughout.
3. **"Nothing recalled" stays high,** about where C162 left it (around half at 24 passes), now spread over three frames.
4. **Whole two-row multiplications come out right** whenever both rows recall their frames, so their rate is roughly
   the product of the first-row and second-row rates.

# C175 · Two lessons (a taste): hypothesis

Written before the run, after a build check (the hand-written adding and times-one-digit ways of working settle and
are right on 50 of 50 pages each). Date: 2026-11-27.

## The question

The owner's view: a memory shouldn't be expected to discover long multiplication as the first thing it learns. People
learn the basics first, and each later skill reuses pieces of earlier ones, so learning gets faster as it goes. This
taste checks the first rung. Does a second lesson take far fewer tries when the pieces of the first lesson are offered
first?

## The setup

- **Lesson 1, adding with carrying**, as on paper. Two numbers right-aligned, the answer below, carries above, the sign
  under the first column, the top padded with a leading 0 and the bottom with 0s (the encoder, as since C142).
- **Lesson 2, times one digit**, as on paper. The number on top padded with a leading 0, the digit below its last digit,
  carries above, the answer below.
- **The order** is the usual school order. These are the first two of adding, adding with carrying, subtracting, times
  one digit, then long multiplication, fixed before looking at what any later skill needs. The order is a crutch (the
  syllabus), declared.
- **Doing and checking** (C171): the page shows only the question. The worked answer and carries are a target.
- **From scratch** (the code's search, as C172's three stages, heat first):
  1. the three reads, the sign read and the units write on a place still to be done;
  2. a hold or not, and the carry write, judged on the first column;
  3. the move and the sign write (or none), judged on the whole page.

  There's no reach limit this time, because the pages are small enough. The filter is as C172's.
- **With pieces:** a piece is a relation between two parts of a way of working learned in lesson 1, meaning where one
  sits relative to the other. The units write goes on a place still to be done, as before. Each other part is placed
  only where some learned way of working had it relative to a part already placed (every such relation is offered).
  The first read is held or not, and the move is the learned one. Each candidate is judged on the whole page.
- **Learned** = what settles both worked examples of a lesson. If equals tie, all of them are kept, since each is as
  right as the others, and all of their pieces are offered in lesson 2.
- **Tries** = candidates proposed. A carry write off the working can't cool anything, so it's counted but not run.
- **Test:** 200 new sums of each lesson, run from the cue with the learned way of working.

## Predictions

1. Lesson 1 from scratch learns the adding way of working, twice over: the top and bottom reads can swap (adding treats
   them alike). Both get 200 of 200.
2. Lesson 2 from scratch learns times one digit (hold the digit below, read the top, carry above), 200 of 200, in a
   few thousand tries.
3. Lesson 2 with pieces learns the same way of working in at most a few dozen tries: **at least twenty times fewer than
   from scratch.**
4. The honest caveat, written now: on paper these two lessons are laid out almost the same. Times one digit is adding
   with one read held and a different sign. So a big saving here is expected. It shows the mechanism works, but not
   yet that it would carry over to lessons that look less alike. That's the next rung's job.

## The ledger (planned)

**Given:**
- the order of lessons;
- the layouts and padding (the encoder);
- the target;
- the facts and the signs' meanings;
- the search (the code's);
- reading pieces off a learned way of working (the code's: every pair of parts and their offset);
- the circuit (one way of working run from the cue).

**The engine:** every run from the cue, agreement, settling.

## Added after the first run (written before the added arms ran)

The first run broke prediction 3: with pieces, lesson 2 took 8,220 tries against 1,112 from scratch, and found the same
way of working. Two causes are visible.

1. **The comparison wasn't like for like.** From scratch, the search uses C172's outcome-equivalent filter (no reads of
   empty places, no sign read without a sign, no write to a filled place). The pieces search didn't.
2. **Equals multiply pieces.** Lesson 1 learned six equal ways of working, one for each order of its three reads, since
   adding treats all three alike. Offering every relation from all six gives each part several places.

The added arms:

- **(b) with pieces, plus the same filter.** Prediction: fewer tries than from scratch, but only a few times fewer, not
  twenty, because the six equals still multiply.
- **(c) with pieces from one learned way of working only** (the first of the six), plus the filter. This is the cost of
  equals: a memory that had chosen one, as C173's would after a tie is broken once. Prediction: a few dozen tries,
  **at least twenty times fewer than from scratch**, finding the same way of working.

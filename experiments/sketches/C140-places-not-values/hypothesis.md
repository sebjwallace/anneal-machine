# C140 · Places, not values: hypothesis

From [content and spatial memory](../../../docs/theories/content-and-spatial-memory.md), §13, and the conversation
after it. In that picture, a frame is fixed content laid out at places, and **a variable is a place relative to the
frame**: the place to the left of the "−", the place to its right. Whatever content sits there is the variable's value.
A procedure learned over those places never mentions a number, so it should work for any numbers, and if the places
are relative, at any position in the space. The owner's caution from C139 stands: this is easy to fake, so the ledger
below says exactly what is given.

## The question

**When an arithmetic procedure is learned over places, does it carry to new numbers at positions it has never seen?
And does that depend on the places being relative to the frame rather than absolute?** A side question: can the
engine, as it stands, build relative moves itself from walking?

## The world

A space of 8 rows and 16 columns, every cell holding one piece of content. A problem is written along a row:

```
column   c−1   c    c+1   c+2   c+3
         "7"  "−"   "4"   "="   "3"      (worked example: the answer is there)
         "7"  "−"   "4"   "="   "?"      (test: the answer is open)
```

Every other cell holds a random digit, so the space around the frame is full of numbers that have nothing to do with
it. Training problems have their "−" in columns 3 to 8; test problems in columns 10 to 12, so **no test problem sits
where any training problem sat**. Test operand pairs are never seen in training (as C139). Rows are random. Six worked
examples per seed; 100 test problems; 20 seeds.

## The arms

The heat loop is C139's, with the open question held across examples (C139, after the first run): for each worked
example, first recall from the operator alone and check; if that fails, search every ordered pair of candidate places
and keep the pairs that fit; hold the candidates open across examples; settle when one is left, or when a whole new
example fails to tell them apart; bind the operator and the two places, in order, with the engine's `declareWord`.

- **Relative.** A candidate place is an offset from the "−": −2, −1, +1, +2 or +3. What is bound is the offsets
  ("the place one to the left, then the place one to the right"). At test, the recalled offsets are turned into cells
  by adding them to where the "−" is.
- **Absolute, held open.** The same, but a candidate place is the cell itself (row and column). What is bound is the
  cells.
- **Absolute, first fit.** Absolute places, with C139's first-run rule: bind the first example whose fit is unique.
  This shows what absolute places do when something is bound.

**Side probe, moves by the engine.** No procedure. The engine walks every column once in each direction, binding each
step as it happens (`declareWord`: the column it was in, the move, the column it reached). Then, from each column, the
column and a move are given together, and the probe asks which columns the engine brings on.

## The ledger: what is given, and what is the engine

**Given (crutches, all declared):** the space and its contents (written by the experiment, standing for an encoder);
where the "−" is (finding the frame in the space is not under test); reading the content of a cell; the arithmetic
facts (looked up, as in C139); the search order; the fit test; the heat rule (C139's held-open rule, the experiment's
own). In the relative arm, **turning an offset into a cell is given** (adding it to the position of the "−"): this is
the relative coordinate system, declared, and not learned.

**The engine (C139's copy, unchanged):** storing each procedure (`declareWord`) and recalling it from the operator alone
(`invoke`); in the side probe, storing each step of the walk and bringing on what follows from a column and a move.

**What the result can and can't show.** In the relative arm, carrying to new positions and new numbers is **given by
the declared relative coordinates**, as carrying to new numbers was given by the registers in C139. So 100% there would
show only that the learning finds the right relative places among many distracting ones, and that relative places
(unlike absolute ones) carry. It would not show the memory building relative places. The side probe asks the first step
of that: whether the engine's own structure can make "one to the right" mean the same thing from any column.

## Predictions (fixed before running)

1. **Relative:** the procedure (−1, then +1) is learned in every seed within the six examples, and the test is 100%
   right in every seed, with no wrong answers.
2. **Absolute, held open:** never learns. Each example is at a different position, so no cell fits every example; the
   candidates start again each time and never settle. The test gives no answer.
3. **Absolute, first fit:** learns cells from one example, and at test reads those cells, which now hold unrelated
   digits: mostly wrong answers (at least 60% wrong), right only by coincidence (under 15%).
4. **Side probe:** the engine's moves don't single out one column. A step of a transition opens from the step before
   alone, so from a column, both directions come on, and from a move, every column that move has ever led to. In most
   starts, more than one column, or the wrong column, comes on.

If 1, 2 and 3 hold, **variables as places work only if the places are relative to the frame**; absolute places either
never settle or settle and mislead. If 4 holds, the engine can't yet build relative places itself, because its
transitions can't combine where it is with which way it moves, and that is the piece to work on before spatial memory
can be anything but declared.

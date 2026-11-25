# C141 · A gate for each step: hypothesis

Follows [C140](../C140-places-not-values/findings.md). There, variables as places relative to a frame worked, but only
with relative coordinates declared by the experiment, and a side probe showed why: after walking a row both ways, the
engine could not turn "column 5, move right" into column 6 (0 of 30 starts). Each step had been stored either as a set
("column 4, right, column 5") or as a chain (each part following the one before). As a set, "4, right, 5" and "5,
right, 6" both contain 5 and right, so arriving at 5 and leaving 5 tie. As a chain, "right" alone opens everything that
ever followed a right move.

The owner and the assistant agreed the challenge is narrow: not that the engine can't move (moves were given as input),
but that it can't make a step depend on **where it is and which way it moves, together**, with where it is counting as
the start. The proposed fix is one already in the owner's language: **a gate**, whose key is the start and the move,
pointing at where the move ends: "{5, right} needs both, then 6". The end is not part of the key, so arriving and
leaving can no longer tie.

## The one change to the engine

The engine copy (C140's) gains **a third shape, a gate**: a key of members followed by one target. It opens the
target only when **every member of the key** is counted (threshold: all of the key). Nothing else in the engine
changes. This change is what is under test.

## Part 1 · Moves

A row of 16 columns, each a population of one member (the same cell everywhere), and two moves, "→" and "←", each a
population of one member. **The walk:** the experiment walks the row once each way; at each move, it binds where it
was, the move, and where it arrived, as the experiment's rule for the moment of moving:

- **old shapes:** as C140, `declareWord` (a set and a chain), with C140's move populations;
- **gate:** one gate per step, key {column it was in, move}, target the column it arrived at.

**Probes.** From each column, the column and a move are given together, and the probe reads which columns are on the
next moment. Then chains of moves: the column and the first move at moment 1, and each next move at the following
moments, for paths of 2 to 5 moves, including mixed directions (right, right, left) and paths that run off the row.

## Part 2 · C140 rerun, with places reached by the engine's moves

C140's world, unchanged (subtractions written at random positions in an 8 by 16 space full of random digits; training
"−" in columns 3 to 8, test in 10 to 12; operand pairs never seen; six worked examples; 100 tests; 20 seeds), and
C140's heat rule, unchanged. The difference: in C140, a relative place such as "+1" was turned into a cell by adding 1
to the column of the "−" (declared). Here, "+1" means **one right move from the column of the "−"**, and the column
reached is whatever the engine's gates bring on. Reading the content of that cell (on the row of the "−") is still
given.

- **Walk learned everywhere:** the walk covers the whole row.
- **Walk learned only where training happened:** the walk covers columns 0 to 10 only (every place training reads),
  so the engine has never moved right from column 10 or beyond.

## The ledger

**Given:** the moves themselves (arriving as input, standing for the owner's command line, MOV 1 and MOV −1); the walk
and the rule that binds each step as it happens; the columns as a code for where the walker is (a location code, like
place cells: see below); in Part 2, everything C140 gave except the offset arithmetic, plus **that "+2" means two right
moves** (counting moves out is given; each move is the engine's).

**The engine:** forming each gate; from a column and a move, bringing on the next column; chaining moves; storing and
recalling the procedure from "−" alone (as C139 and C140).

**What this does not yet test.** The columns are a location code underneath the moves. The owner's fuller picture has
no columns at all: gates keyed on **what is seen** and the move ("from '−', moving left, the first number"), with
repeats and separate instances told apart by super-assemblies with relative position. That needs instances first, and
is a later step. Here the question is only whether a gate makes a move relative and exact.

## Predictions (fixed before running)

1. **Old shapes:** 0 of 30 single steps exact, as C140.
2. **Gate:** 30 of 30 single steps exact: exactly the next column comes on, and the start column goes off (nothing
   holds it). A move off the row brings on no column.
3. **Gate, chains of moves:** every path of 2 to 5 moves that stays on the row ends on exactly the right column, with
   exactly one column on at every moment; a path that leaves the row ends with no column on.
4. **Rerun, walk learned everywhere:** identical to C140's relative arm: 100% right, every seed, learned by example 2.
5. **Rerun, walk learned only where training happened:** training is unaffected (learned by example 2), but at test the
   engine can't move right from column 10 or beyond, so "+1" reaches nothing: **0% right, 0% wrong, 100% no answer.**

If 2 and 3 hold, one gate per step, keyed on where it is and the move, is enough to make moves exact and chainable. If 4
and 5 hold, carrying to new positions now comes from the engine's own moves (it works only where the engine has
learned to move), not from coordinates the experiment declared.

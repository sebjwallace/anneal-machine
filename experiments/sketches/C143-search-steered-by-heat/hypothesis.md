# C143 · A search steered by heat: hypothesis

Follows [C142](../C142-column-addition/findings.md), where the memory learned the per-column step of column addition
from six short worked examples and ran it on sums of 4 to 8 digits (4,000 of 4,000 right). The biggest crutch left was
the search: for every worked example, the experiment tried **every possible step** (63,360 of them), replaying each
one on the whole sum. In the owner's picture that is heat's work: open places pull activity to them, and what fits cools
into structure. The full version, with the engine doing it, needs a rule for how energy moves, which is still to be
put up as candidate hypotheses. This sketch is the agreed first step: **the search stays in the experiment's code, but
is steered by heat**, to see how far that shrinks it and what shape the engine's version would need.

## The question

**If the search only looks where the heat is, explains one written cell at a time from what is already cool nearby, and
moves on to where heat remains, does it learn the same step, give the same results, and how much smaller is it?**

## Heat, as this sketch uses it (the rules under test, all the experiment's own)

In a worked example, the written numbers (rows 1 and 2) are **cool**: they are the input. Every cell of the working
(the answer row and the carry row) is **hot**: written, but not yet explained.

1. **Attention goes to the heat.** The focus starts on the last digit (given, as in C142) and that hot answer cell is
   the one to explain. The units digit is therefore written at the focus: the units place is not searched.
2. **Only what is cool can explain.** A candidate set of three read places (from the 12 places around the focus, as in
   C142) may use cool cells and empty cells, never hot ones. It explains the hot cell if its sum's units digit is that
   cell's digit.
3. **A carry is explained by the sum that made it.** Where a candidate's sum is 10 or more, the carry must be one of
   the hot cells nearby holding that carry; where it is less, the carry place isn't constrained by this column.
4. **Explained cells cool.** The focus cell, and every carry cell some remaining candidate explains, become cool, so
   the next column can read them.
5. **The focus moves to where heat remains.** After explaining, the focus moves (through the engine's gates, as C141)
   to the neighbouring column whose answer cell is still hot. That direction is the step's move. When no neighbouring
   answer cell is hot, the example is done.
6. **The same step must explain every column.** Candidates (read places, carry places, move) are kept only if they
   explain each column the focus visits: the cut across columns. Across examples, C139's held-open rule as in C142.

A limit of 40 focus moves per example stops anything that wouldn't halt.

## Arms

- **Steered by heat** (above).
- **Exhaustive (C142's search, counted).** C142 exactly, with its checks counted, as the comparison.
- **Steered by heat, from sums without carries** (the control from C142).

Same seeds, so the same worked examples and the same test sums as C142. Test unchanged: 4 to 8 digits, at a new
position, 40 per length, 20 seeds, run with the recalled step and the engine's moves.

## How the search is measured

A **check** is applying the facts to one candidate at one column: one read set tried at one column, one carry place
tried, or one step of a replay. Both arms are counted the same way.

## The ledger

**Given:** everything C142 gave, except that the exhaustive search is replaced by the heat-steered one, whose rules
(1 to 6) are the experiment's and are what is under test. Rule 1 also means the units place is no longer learned: it
is where the focus is. **The engine:** as C142 (storing and recalling the step; every move of the focus).

## Predictions (fixed before running)

1. **Steered by heat** learns the same step as C142 in every seed (read the carry above, the top and bottom digits;
   units at the focus; carry one column left in the carry row; move left), settling at the first worked example with a
   carry, as C142 did.
2. Its test results are identical to C142's: 100% exactly right at 4 to 8 digits, every run stopping by itself, the
   limit never reached.
3. It needs **at least 50 times fewer checks** than the exhaustive search, over training.
4. **Without carries:** the carry place is never constrained, the step settles on an interchangeable guess, and long
   sums fail as in C142 (at most 10% right at 6 digits and above).

If 1 to 3 hold, steering by heat keeps everything C142 learned with a small fraction of the search, and the shape it
needed (look only near heat, explain from cool cells, cool what is explained, move to remaining heat) is the shape to
give the engine's own version. If 1 fails, the heat rules lose something the exhaustive search found, and that is just
as useful to know before designing the engine's rules.

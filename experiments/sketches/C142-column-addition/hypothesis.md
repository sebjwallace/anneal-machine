# C142 · Column addition: hypothesis

The first test of an **algorithm**, not a lookup. C139 to C141 showed the memory finding its inputs: which places to
read, relative to a frame, carried to new positions by the engine's own moves. Nothing was written, there was one step,
and nothing branched. Column addition needs all of that: **reading, writing, a step that only sometimes happens (the
carry), later steps reading what earlier ones wrote, and repetition.** The owner's framing: the arithmetic facts are
the easy part (plain association, a CPU's mapping); the hard part is procedures, knowing what to read and write, where,
and in what order. If associative memory with space in its assemblies can do that, it is generic in the way a CPU is.

## The question

**From a few worked examples of short sums (two or three digits, with the working shown), does the memory learn the
per-column step of column addition (what to read, what to write where, which way to move), and then run it, column after
column, on sums longer than any it has seen, stopping by itself when there is nothing left?**

The theoretical point under test: in a computer, repetition is a loop with a counter. In the owner's picture there is no
counter: the step is a frame over relative places, and after moving left it simply fits again where there are digits,
and stops fitting where there are none. **Iteration falls out of the space.**

## The world

A grid of 4 rows and 12 columns:

```
row 0   carries         .  .  1  .        (a carry is written above the column it goes into)
row 1   first number    .  .  4  7
row 2   second number   .  +  5  8
row 3   answer          .  1  0  5
```

Numbers are right-aligned. A worked example has the carries (only where they are 1) and the answer written in; a test
has both rows empty. Training sums have 2 or 3 digits per number and their last digit in column 9. Test sums have **4
to 8 digits**, lengths never seen, and their last digit in column 10, a position never used. 6 worked examples per
seed; 40 test sums per length; 20 seeds.

## The step, and what is learned

A step is applied at a **focus**: one column, on the answer row. Its parts are places relative to the focus (a row
offset 0 to −3 and a column offset −1, 0 or +1: 12 places):

- **three places to read** (their numbers are added; an empty place counts as nothing);
- **a place to write the units digit** of that sum;
- **a place to write the carry** (written only when the sum is 10 or more);
- **a move** (one column left or right).

**The loop (given, and declared):** start the focus on the column of the last digit; while the step **fits** here (at
least one of its read places holds a number), apply it and move; stop when it doesn't fit. A **limit of 40 steps** is
there only to stop a loop that never halts. It is not a crutch, and hitting it counts as a failure.

**What is learned:** which step. For each worked example, the step is first recalled from "+" alone (the engine) and
replayed on a copy of the example with the carries and answer blanked. If its writes reproduce the working exactly, the
heat cools by recall. Otherwise every possible step is searched (220 sets of read places × 12 units places × 12 carry
places × 2 moves = 63,360), each replayed the same way, and those that reproduce the working are kept. C139's held-open
rule, unchanged: candidates held across examples, kept only if they fit every one; settled when one is left or a whole
example fails to tell them apart; bound with the engine's `declareWord` ("+", the three read places, the two write
places, the move).

## Arms

- **Learn.** As above, worked examples drawn at random (carries happen when they happen).
- **Learn from sums without carries (a control).** The worked examples are chosen so that no column carries. Nothing in
  training shows where a carry goes or where it is read from. Tested the same way.

## The ledger

**Given:** the grid and its contents; where the focus starts (the last digit; finding the frame is not under test); the
loop that re-applies the step (but not whether it continues: that is the step fitting); what "fits" means (a read place
holds a number); reading and writing a cell; the facts (adding up to three digits, the units digit, whether it carries);
the search and the fit test (replaying a candidate on the blanked example); the heat rule (C139's); the step limit.

**The engine (C141's copy, unchanged):** storing the step and recalling it from "+" alone; and **every move of the
focus**, through C141's gates (each column and move, once, as a table of what the engine brings on).

**What it can and can't show.** It can show that the per-column procedure is learnable from short worked examples and
runs as an algorithm (write, branch, read back what was written, repeat, stop) on longer sums. It can't show the memory
doing the addition facts, or finding the frame, or deciding to start. And repetition here is "apply again while it
fits", run by the experiment's loop; what the experiment does not decide is how many times, or when to stop.

## Predictions (fixed before running)

1. **Learn:** the step is learned in every seed within the six examples: read the carry place above, the first number
   and the second number in the focus column; write the units digit in the focus; write the carry one column to the left
   in the carry row; move left.
2. **Learn:** test sums of 4 to 8 digits, at the new position, are **100% exactly right** in every seed (every digit of
   the answer, including a final carry).
3. **Learn:** every test run stops by itself, after exactly as many steps as the answer has digits; the limit is never
   reached.
4. **Without carries:** a step is learned, but where the carry goes and where it is read from is not pinned down by
   anything in training, so on long test sums (which nearly always carry) the answers are nearly always wrong: at most
   10% exactly right at 6 digits and above.

If 1 to 3 hold, associative memory with relative places learns a procedure that writes, branches, reads back its own
writes and repeats, from short examples, and runs it on lengths it has never seen: an algorithm, with the facts given.
If 4 holds, the carry part was learned from the examples that showed it, not built in.

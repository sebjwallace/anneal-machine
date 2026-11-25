# C142 · Column addition: findings

Run: `node columns.js > out.txt` (under two seconds; [out.txt](out.txt) has the first seed of each arm example by
example, with two 8-digit sums worked). Read [the hypothesis](hypothesis.md) first, especially its ledger. Engine:
C141's copy, unchanged.

## In short

**The memory learned column addition as a procedure from short sums, and ran it on long ones.** From worked examples
of two- and three-digit sums, every seed learned the same per-column step: read the carry above, the first number and
the second number in this column; write the units digit below; write the carry one column to the left, above; move
left. Run on sums of 4 to 8 digits, lengths it had never seen, at a position it had never used, it was **exactly right
on all 4,000 test sums**, including the final carry. Every run **stopped by itself** after exactly as many steps as
the answer had digits. The step limit was never reached.

This is the first experiment that shows **an algorithm** rather than a lookup: the procedure writes, branches (the carry
is written only when a column adds up to ten or more), reads back what it wrote (the next column reads the carry), and
repeats, with nothing counting columns. It repeats because the step fits again after each move left, and it stops
because, past the last digit, there is nothing left for it to fit.

**The control shows the carry part was learned from the examples.** Trained only on sums that never carry, the memory
also settled on a step, but nothing had shown it where a carry goes. It picked a place that happens to be in the
answer row, so on long sums its carry blocked its own next answer digit, and it was almost always wrong (1.3% right at
8 digits).

**Every prediction held.** The arithmetic facts (adding single digits, the units digit, whether it carries) were looked
up, as agreed.

## Results

| arm | 4 digits | 5 | 6 | 7 | 8 | seeds at 100% | stopped after exactly the answer's digits | hit the limit | learnt at example |
|---|---|---|---|---|---|---|---|---|---|
| **learn** | **100%** | **100%** | **100%** | **100%** | **100%** | **20 of 20** | **4,000 of 4,000** | 0 | 1 / 1 / 2 |
| learn from sums without carries | 16.6% | 8.8% | 4.0% | 2.8% | 1.3% | 0 of 20 | 120 of 4,000 | 0 | 2 / 2 / 3 |

The step learned, in all 20 seeds of each arm:

- **learn:** read the bottom number, the top number and the carry row in the focus column; write units in the focus;
  write the carry in the carry row, one column left; move left.
- **without carries:** read the answer cell one column left, the bottom number and the top number in the focus column;
  write units in the focus; write the carry in the answer row, one column left; move left.

Two 8-digit sums from the first seed of the learn arm, as the trace shows them:

```
43081263 + 70006246 → 113087509   carries row ..1.....1...    9 steps, stopped by itself
61761989 + 44089207 → 105851196   carries row ..1..111.1..    9 steps, stopped by itself
```

## What it shows

### 1. An algorithm, learned from short examples, runs on any length

The worked examples had at most three digits per number. The test sums had up to eight, ending one column further
right than any training sum. What carried over was not any sum but **the step**: a frame of relative places (above,
above that, the carry row, one to the left) with a move. Nothing in it mentions a column number or a length, so it
applies wherever it lands. This is the indirection of C139 and C140, now with writing, a branch, and reading back its
own writes.

### 2. Iteration came from the space, not from a counter

The experiment's loop only re-applies the step while it fits; it never counts columns or decides when to finish. The
step fits wherever one of its read places holds a number. After the last column, the carry that was just written is
still there, so it fits once more, writes the leading digit, and moves left again. There, nothing is left, and it
stops. The number of steps was exactly right in all 4,000 runs, and the limit of 40 was never touched. **The length of
the computation was decided by what was written in the space.**

### 3. The carry is a step that only sometimes happens

The carry is written only when a column adds up to ten or more, and the next column reads it from the place it was
written. That is the procedure branching, and its output becoming its own later input. In the control, with no carries
in training, the step still settled, but nothing constrained its carry place (all 60 surviving candidates were
interchangeable on the examples), so the held-open rule took the first one, which lands in the answer row. On long sums
that carry, that write fills the cell the next column needs for its own answer, the step can't write there (nothing is
overwritten), and the run breaks. So the right carry behaviour came from seeing carries, not from anything built in.
It is also a reminder from C139: settling on interchangeable candidates is a guess about whatever the examples didn't
constrain.

### 4. How quickly it was learned

In the learn arm, a first example with no carry leaves 60 candidates (the carry place isn't pinned down). The first
example with a carry settles it to one. After that, every worked example was cooled by recall.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | learn: the step learned in every seed within six examples (read carry, top and bottom; units in the focus; carry one left; move left) | **Holds:** all 20 seeds, by example 1 or 2. |
| 2 | learn: 100% exactly right at 4 to 8 digits, every seed | **Holds:** 4,000 of 4,000. |
| 3 | learn: stops by itself after exactly as many steps as the answer has digits; limit never reached | **Holds:** 4,000 of 4,000; limit reached 0 times. |
| 4 | without carries: at most 10% right at 6 digits and above | **Holds:** 4.0%, 2.8%, 1.3%. |

## The ledger, after the run

**Given:** the grid and its contents; where the focus starts (the last digit); the loop that re-applies the step while
it fits (not how long it runs); what "fits" means; reading and writing a cell (and that nothing is overwritten); the
facts; the search over all 63,360 possible steps and the fit test (replaying a candidate on the blanked example); C139's
held-open rule; the step limit.

**The engine:** storing the step and recalling it from "+" alone; every move of the focus, through C141's gates.

**So, plainly:** associative memory with relative places learned the procedure of column addition from a handful of
short worked examples, and ran it as an algorithm on sums longer than any it had seen, writing, branching, reading back
its own writes and stopping by itself. The facts, the search and the loop that re-applies the step were given. **The
procedure was learned, and its moves were the engine's.**

## What it suggests next

1. **The search is the biggest remaining crutch.** It tried every possible step against each example. The owner's
   picture has heat do that work: an open place in the working pulls activity to it, and what fits cools into
   structure. Moving the search into the engine, one part at a time, is the next step towards it being the memory
   that learns.
2. **The facts in associative memory.** Single-digit sums as memorised associations, recalled by completion, replacing
   the lookup. Expected to be the easy part, as the owner says, but it should be shown.
3. **A procedure with more than one step,** for example subtraction with borrowing, or multiplication by one digit, to
   see whether frames chain (one step's write being another step's cue) as they did here with the carry.

# C149 · The engine does the sum: findings

Run: `node run.js > out.txt` (about seven minutes; [out.txt](out.txt) has two 8-digit sums worked, the summary and the
controls). Read [the hypothesis](hypothesis.md) first. Engine: C148's copy, plus one hook so that fixed binding rules
(here, the write rule) run inside every moment. The circuit is in `circuit.js`.

## In short

**The machine now performs arithmetic from associative memory.** The experiment's code wrote the two numbers into the
space and, at the end, read the answer row back by attending its places. Between the two there was a single call to the
engine. In that run the engine read each column by completion, routed the digits into a fact, completed the fact, wrote
the units digit and the carry into the space as new structure, moved left, and did it again, column after column.
When there was nothing left to read, it stopped by itself. **4,000 of 4,000 sums of 4 to 8 digits were exactly right**,
in all 20 seeds, using the step each seed had learned from six short worked examples. Every run stopped by itself, the
limit was never reached, and every run made exactly two writes per column.

**The controls show the parts are doing the work.** With the write rule switched off, nothing is ever written, the
second column has no carry to read, and the run stops there: nothing on the answer row. With C148's wrong step (the
coincidence), the run stops at the first column, because the place it reads is empty.

**Every prediction held.** One difference from the learning experiments is worth knowing about (below).

## Results

| | 4 digits | 5 | 6 | 7 | 8 | seeds at 100% | stopped by itself | hit the limit | exactly 2 writes per column | moments per sum (mean) |
|---|---|---|---|---|---|---|---|---|---|---|
| **learned step** | **100%** | **100%** | **100%** | **100%** | **100%** | **20 of 20** | **4,000 of 4,000** | 0 | 4,000 of 4,000 | 50 |
| no write rule | 0% | 0% | 0% | 0% | 0% | – | 200 of 200 | 0 | – | 14 |
| the coincidence | 0% | 0% | 0% | 0% | 0% | – | 200 of 200 | 0 | – | 8 |

Every seed learned and bound the same step: read the carry above and the two digits; write units at the focus; write
the carry one column left in the carry row; move left.

From the first seed, two 8-digit sums, as the engine wrote them into the space:

```
78670960 + 87387166 → 166058126    18 writes, 62 moments, stopped by itself
48988847 + 60411720 → 109400567    18 writes, 62 moments, stopped by itself
```

## What it shows

### 1. Arithmetic, done by associative memory

Every operation in the run is association. Reading is completion: attend a place, and what was bound to it comes on.
Routing a digit into a fact is a gate: the read part, the focus and the content together open the digit in its slot.
The fact is three digits opening their sum. Writing is binding: a place and a value on together become a new
association. Moving is a gate keyed on where it is and the move. The only thing that isn't learned association is the
fixed architecture: the six-phase clock, the shape of the gates, and the one write rule. That is fixed in the way a
CPU's wiring is fixed, which the owner's principle allows.

### 2. It writes, reads back what it wrote, and stops by itself

Each column's carry is written as a new association in the space, and the next column reads it through the same
completion it uses for the input digits. The memory can't tell its own working from what it was given, which is how it
should be, and it's the owner's ink-on-paper picture. The run stops because, past the last column, there is nothing to
read, no fact completes, the clock doesn't move on, and the engine's state simply repeats. Nothing counted the columns
or decided to stop.

### 3. The controls

With writing off, the first column's fact completes, but its result isn't written, so the second column finds no carry
and its fact can't complete: the run stops after the first column, with nothing on the answer row. That shows the
column-to-column dependency runs through the space, through what was written. With the coincidence step, the run stops
at once, which brings up a difference worth recording.

### 4. A difference between learning and running: empty places

In learning (C142 to C148), an empty cell counted as 0 when the experiment's code added digits. In the circuit, an
empty place has no content, so attending it brings nothing on, and a fact missing a digit can't complete. The
coincidence step reads the answer cell to the right, which is empty in the first column, so in the circuit it never
starts. The learned step never reads an empty place, because the encoder gives each number a leading 0 and puts a carry
of 0 above the last column. That padding is a crutch of the encoder, declared. Without it, the leading column (where
only a carry is left) would have nothing to read in its digit places, and the run would stop one column early, missing
a final carry. **Making "nothing here" mean 0 inside the engine is still open.**

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | learned: 100% at 4 to 8 digits, every seed | **Holds:** 4,000 of 4,000; 20 of 20. |
| 2 | every run stops by itself; the limit never reached | **Holds:** 4,000 of 4,000; 0. |
| 3 | 2 writes per column worked | **Holds:** 4,000 of 4,000. |
| 4 | no write rule: 0%, nothing on the answer row | **Holds.** |
| 5 | the coincidence: at most 10% at 6 digits and above | **Holds:** 0%. It fails at the first column, because the circuit treats an empty place as nothing (4 above). |

## The ledger, after the run

**Given:** the encoder (the numbers written into the space, each with a leading 0, and a carry of 0 above the last
column); the circuit's fixed architecture (the six-phase clock, the attending, routing and write-place gates, the write
rule, the facts as gates in the direction of use); turning the learned step into the circuit's gates; starting it ("+"
and the focus on the last column, once); reading the answer out (attending each place on the answer row, through the
engine); the limit. Learning the step is C148's, with its crutches (the search's shape, the carry check, the held-open
rule).

**The engine, in one run, with nothing from the experiment's code:** reading by completion; routing; the facts; writing;
holding the step and the focus; the clock; the moves; stopping.

## What it suggests next

1. **Learning in the same circuit.** The step is learned by C148's process and then turned into gates by the
   experiment's code. The next milestone is learning it in the circuit itself: worked examples placed in the space, the
   circuit trying hypotheses on them, and the one that leaves no heat being bound as the circuit's own structure.
2. **"Nothing here" as 0,** so the encoder needn't pad.
3. **A second procedure** (subtraction with borrowing, or multiplying by one digit) on the same circuit, to see whether
   the circuit is general or shaped for addition.

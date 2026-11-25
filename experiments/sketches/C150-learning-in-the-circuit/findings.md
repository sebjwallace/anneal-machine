# C150 · Learning in the circuit: findings

Run: `node learn.js > out.txt` (about ten minutes; [out.txt](out.txt) has the first seed of each arm example by
example, the steps learned, the test and the work). Read [the hypothesis](hypothesis.md) first. Engine: C149's copy,
unchanged; `lanes.js` holds the lanes of the circuit, `circuit.js` is C149's.

## In short

**The circuit learned column addition by running candidates over worked examples, and the step it learned did the
long sums.** Each candidate ran in a lane of the circuit over a fully worked example. Every write landed on the
working already written there: the same digit cooled it, a different digit or an empty place was a misfit. The
candidate that made no misfit and left nothing hot was the one kept. In all 20 seeds that was the step C142 to C149
found, settled by the first or second example, and every later example was cooled by running the bound step alone. Bound
into C149's circuit, it was **100% right on 4 to 8 digit sums** (2,000 of 2,000), every run stopping by itself.

**The checker is gone.** There is no separate code comparing a candidate's answer with the working. Running the step
**is** the test: its writes either agree with what's written or they don't. That is what changed from C147 and C148.

**Every prediction held**, but the "without carries" control held partly for a reason other than the one predicted
(below).

## Results

| arm | step learned | learnt at example | 4 to 8 digits, right | seeds at 100% | stopped by itself |
|---|---|---|---|---|---|
| **learn** | the right step, **20 of 20** | 1 / 1 / 2 | **100%** | 20 of 20 | 2,000 of 2,000 |
| learn from sums without carries | the right step, 20 of 20 | 2 / 2 / 2 | 100% | 20 of 20 | 2,000 of 2,000 |

Work in learning, per seed: **111 runs of the circuit** (up to 8 lanes each), 882 moments. That covered 792 read sets
tried at one column (stage A) and 40 whole steps run over a whole example (stage B). Without carries: 173 runs and 1,397
moments.

## What it shows

### 1. Running the step is the test

A worked example's working is already in the space, so a candidate's writes all meet something. The write rule decides
what that means: the same digit explains that part of the working and cools it; anything else is heat. No code compares
numbers. A candidate either runs cleanly through the whole sum, cooling every cell of the working, or it doesn't. Seed
1, example 1 (326 + 43) left two read sets standing after stage A, and example 2 (91 + 248) narrowed it to one. From
then on, every worked example was explained by running the bound step alone (one run each).

### 2. Coincidences die on empty places

C147's coincidence (reading the answer digit to the right) reads an empty place at the last column. In the circuit
an empty place brings nothing on, so that lane's fact can't complete there and the candidate never survives stage A. The
circuit's "nothing is nothing" (a difficulty in C149) works in its favour here.

### 3. Without carries: right, but partly by luck of order

The prediction was that written zero carries would pin down the carry, unlike C142. They pinned down where the carry is
**written**, but not quite where it is **read**. With every carry 0, "read the carry above this column" and "read the
carry above the column to the left" both read 0 everywhere, so both explained every example (seed 1: the same two
candidates in examples 1 and 2). The held-open rule then took the first, and the first was the right one because rule
B's order puts it nearer: the carry above is three moves away, the one to the left four. So the outcome is right in all
20 seeds, but it was decided by distance, not by evidence. The other choice would have failed on any sum that carries.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | learn: the right step in every seed, within six examples | **Holds:** 20 of 20, by example 1 or 2. |
| 2 | learn: 100% at test, stopping by itself | **Holds:** 2,000 of 2,000. |
| 3 | coincidences reading an empty place die in stage A | **Holds** (the reason in 2 above). |
| 4 | without carries: the right step in at least 18 of 20, pinned by the written zero carries | **Holds in outcome** (20 of 20), **partly not in reason:** the read place was not pinned. Distance broke a genuine tie (3 above). |

## The ledger, after the run

**Given:** the encoder (worked examples written in full, padded, with a carry of 0 above the last column); the circuit's
fixed architecture and its lanes; the write rule meeting written working; which candidates get a lane (rule B's order
for read sets, then every carry place and move for each surviving read set); the judgement "no misfit and all the
working cooled", read by the experiment's code from the write rule's record; C139's held-open rule; binding the settled
step into C149's circuit (the experiment's code); the test as C149.

**The engine:** running every candidate, in lanes, over the worked example: reading by completion, routing, the facts,
the write places, the clock, the moves, and the write rule meeting the working; then running the learned step on the
test sums, as C149.

**So, plainly:** the circuit that does the arithmetic also tests the candidates, by doing the arithmetic on worked
examples. What remains the experiment's: proposing which candidates get a lane, reading off "no heat left", choosing
among candidates that tie, and binding the winner in.

## What it suggests next

1. **"No heat left" as the engine's.** The write rule already records cooled and misfit places. A lane whose working is
   all cooled could switch on a "settled" cell, which could then bind its parts to "+" (a binding rule like the write
   rule). That would make the judgement and the binding the circuit's.
2. **Proposing candidates:** priming instead of distance (C147), so the order isn't the experiment's.
3. **A second procedure** on the same circuit (subtraction with borrowing), to see if the circuit is general.

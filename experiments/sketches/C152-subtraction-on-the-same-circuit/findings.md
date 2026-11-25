# C152 · Subtraction on the same circuit: findings

Run: two shards in parallel (`SEEDS=10 SHARD=0/2 node learn.js` and `SHARD=1/2`, about fifty minutes on two cores),
then `SEEDS=10 REPORT=1 node learn.js > out.txt`. [out.txt](out.txt) has the first seed of each arm example by example,
what the store gives, the test and the work; the `rows-*.json` files hold every seed. Two diagnostics were written after
the run: [circuit-check.js](circuit-check.js) ([its output](circuit-check.txt)) and [probe.js](probe.js)
([its output](probe.txt)). Read [the hypothesis](hypothesis.md) first. Engine: C151's copy, unchanged.

## In short

**Subtraction with borrowing is learned by the same machinery, with nothing added but the facts.** In every
subtraction example of every seed, the lanes found and settled the right step: take from the top number, take the
bottom number and the borrow above, write the units at the focus and the borrow above the next column, move left,
using the subtraction facts. Its shape is addition's, except for the family and which read is taken from. Bound into
the circuit on its own, it subtracts 4 to 8 digit numbers **100% right**, stopping by itself, exactly as the addition
step adds.

**But the two procedures can't live together, in the store or in the circuit.** They share four of their seven parts
(the borrow or carry read, the two write places and the move). Wherever they share parts, the memory loses track of
which procedure it's in:

- **In the store,** recall from the sign follows its own procedure until the first shared part. From there on, the two
  procedures are rivals, and the one bound more often wins, whatever the sign. With equal counts, recall stops there.
  So the store never gave the subtraction step whole: from "−" it gave the subtraction reads followed by the addition
  family (a hybrid) whenever addition led, and nothing when they were level. Binding each subtraction knocked out
  addition's recall too. **At the end of training, in all 10 seeds of both arms, the store gave nothing from either
  sign.**
- **In the circuit,** the two steps, bound in together by hand (bypassing the store), come on together: the sign brings
  on its step's parts, and the other step's state, sharing four of them, completes and comes on as well. Both families
  and both sets of reads run at once, and **every sum comes out wrong (0 of 200)**, although each step alone is 100%.

**So the experiment found the edge cleanly.** The circuit's way of learning and running a column procedure is general
across addition and subtraction. What isn't there is anything that keeps two learned procedures apart once they share
structure: the sign starts a procedure but doesn't stay with it.

## Results

| arm | lanes settled the right step | the store gives at the end | test, both steps in one circuit |
|---|---|---|---|
| **learn both** | **120 of 120 examples** (60 "+", 60 "−") | nothing from "+", nothing from "−", 10 of 10 seeds | 0% "+", 0% "−" |
| one sign for both | 120 of 120 | nothing from "+", 10 of 10 | 0%, 0% |

| the circuit alone (circuit-check) | 4 digits | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|
| addition step alone | 20/20 | 20/20 | 20/20 | 20/20 | 20/20 |
| subtraction step alone | 20/20 | 20/20 | 20/20 | 20/20 | 20/20 |
| both in one circuit, "+" sums | 0/20 | 0/20 | 0/20 | 0/20 | 0/20 |
| both in one circuit, "−" sums | 0/20 | 0/20 | 0/20 | 0/20 | 0/20 |

Every test run, wrong or right, stopped by itself.

Seed 1, learn both, as it happened: example 1 (326 + 43) settled the right addition step and a coincidence; the store
tied. Example 2 (248 − 91) settled the right subtraction step; still nothing recalled. Example 3 (345 + 672): addition
now had two copies, so "+" recalled the right step, and **"−" recalled the subtraction reads with the addition family**.
Example 4 (872 − 88): that hybrid didn't settle, the search found the subtraction step again, and with the counts level
both signs recalled nothing. That pattern repeated to the end: after each addition, "+" right and "−" a hybrid; after
each subtraction, nothing from either. Over all seeds, recall from "−" gave the hybrid 46 times and nothing 74 times,
and never the subtraction step. Because the examples alternate starting with "+", addition was always level or ahead;
which procedure wins is just a matter of which has been bound more so far.

The coincidences settled now and then, as in C151, when an example had no carries or borrows: "read the carry to the
left" (13 times) and "take the borrow to the left" (15 times).

Work in learning, per seed: about 3,840 circuit runs (up to 8 lanes each) and 24,000 moments. Nothing was ever settled
by recall, so every example was searched, which is why this run is so much heavier than C151's.

## What it shows

### 1. The learning machinery isn't addition-shaped

Nothing about cooling, settling, binding or the lanes had to change. Given subtraction facts beside the addition facts,
and candidates that could say which family and which read to take from, it found the right subtraction step from the
first worked example. The step it found has exactly addition's shape (read the column and the borrow above, write the
units here and the borrow up and to the left, move left). That's what you'd expect if the column procedure really is
one shape with different facts plugged in. The step alone, bound in, subtracts long numbers it has never seen.

### 2. Shared parts make two procedures into rivals

The probe of the store on its own shows the mechanism plainly. Bind the two steps under their signs and recall:

- one each: each sign recalls its own first three parts, then stops at the first shared part (RK10);
- addition twice, subtraction once: both signs recall the rest of **addition's** tail, so "−" ends in Σ;
- the other way round: both end in Δ;
- three each: both stop at the shared part again.

Putting the family straight after the sign (FAMILY=first in the probe) gets the families right, but recall still stops
at the shared part whenever the counts are level. The two chains have the same continuation from there, but they're
different structures, and with equal support they tie. So it isn't the order of the parts: **after a part two
procedures share, nothing tells the memory which one it's continuing.** The sign was on at the start and isn't any
more.

The circuit fails for the same reason in a different form. Each step is held as a state of its parts. When "+" brings
on the addition parts, four of the subtraction state's seven members are on, and the state completes: the other three
(the subtraction reads and the Δ family) come on the next moment, and stay. From then on both procedures run at once.

### 3. One sign for both is no worse, because nothing was separating them anyway

The control was meant to show the sign keeping the procedures apart. It doesn't, because the sign doesn't keep them
apart even in the main arm. With one sign, the store is the same rivalry with a single starting point, so it ends in a
tie at the shared part and gives nothing, just as the main arm does.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | the store gives the right step from each sign, in every seed | **Fails:** nothing from either sign at the end, 10 of 10 seeds. The lanes did find and settle the right step every time (120 of 120). |
| 2 | 100% for both signs with both steps in one circuit | **Fails:** 0%. Each step alone is 100%; together they interfere through the shared parts, the risk the hypothesis named. |
| 3 | addition undisturbed | **Fails:** each subtraction bound knocks out addition's recall, until the next addition. |
| 4 | one sign for both: mostly ties, never both right | **Holds:** a tie at the shared part, nothing recalled, 0%. But it tells us nothing extra (above). |

## The ledger, after the run

**Given:** the encoder (worked examples written in full with their sign, and declaring their working as heat); the two
fact families, formed beforehand and keyed by family cells; the circuit's fixed architecture (as C151); proposing
candidates, including the family and, for subtraction, which read is taken from (one slot distinguished, the other two
alike, as the facts have it); moving the store's steps into the test circuit; and, in circuit-check only, binding the
two settled steps into one circuit by hand. **The engine:** running every candidate, cooling, stopping on a misfit,
settling, binding under the sign, recalling with copies counting, completing the other step's state in the circuit, and
running every test sum.

**Changes from the hypothesis, disclosed:**

- **10 seeds per arm, not 20,** because of run time: about five minutes a seed, on two cores. The seeds were split into
  two shards run side by side, and the report was printed from both.
- **The first seed was run once, as a smoke test, after the hypothesis was written** and before the full run. It already
  showed the store giving nothing and the hybrid from "−". The full run went ahead with nothing changed.
- **probe.js and circuit-check.js were written after seeing that smoke test,** to tell apart the store's part and the
  circuit's part in the failure. Neither is in the hypothesis, and neither changes the main result.
- The carry or borrow slot of the facts still takes any digit 0 to 9, as in C151, so subtraction facts can borrow 0, 1
  or 2 (2 never happens in real working).

## What it suggests next

These are what the evidence points to, not a shape to impose. All of them address the same gap: once two procedures
share structure, nothing carries which one is running.

1. **Keep the context on.** If the sign (or whatever started the procedure) stayed on while the procedure runs, the
   state {sign, parts} would have its sign among its members, and the other procedure's state would be missing one of
   its members. Whether that is enough to stop it completing, and enough for recall to keep to its own tail, is a
   one-change experiment.
2. **Parts that carry their context.** If each part's gate were keyed on the sign as well as the part before it, the
   two procedures would no longer share anything in the store, while still sharing the cells the circuit acts with.
   That is closer to binding "in this procedure, then this", and it would let the store hold many procedures over
   the same cells.
3. **Or no separate procedures at all.** Addition and subtraction are one step shape with a different family and a
   different "from". A single step that reads the sign as one more input, and takes its family and order from it, would
   have nothing to keep apart. Whether the circuit can learn that, a step with a part that depends on what's read,
   says something about whether separate learned states are needed at all.

The first is the cheapest and the most direct test of the diagnosis.

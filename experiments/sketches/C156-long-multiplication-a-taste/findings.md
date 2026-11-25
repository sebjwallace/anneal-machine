# C156 · Long multiplication, a taste: findings

A short run, by agreement, for an early indication: two seeds, six examples each, a small test. Run: two shards side by
side (`SEEDS=2 SHARD=0/2 node learn.js` and `SHARD=1/2`, about twenty minutes), then
`SEEDS=2 REPORT=1 node learn.js > out.txt`. Read [the hypothesis](hypothesis.md) first, including what was seen
before it was written. Engine: C155's copy, unchanged.

## In short

**The first row of long multiplication can't be learned on the paper layout with what the circuit has.** The step
carries the multiplier along by writing it into the place to its left. On a two-digit multiplier, that place already
holds the next digit, and a place that holds something is never written. So the next column reads the multiplier's
tens digit and multiplies by that instead. The search over worked long-multiplication pages found **nothing that
settles**. The store kept C155's step, which is right on the long pages only by coincidence (**about 10%**, consistent
with the two multiplier digits being the same), and still **100% on single-digit multiplication**.

**The indication is that long multiplication needs something held rather than written.** A person doing 47 × 36 keeps
"times 6" in mind for the whole first row. They don't write the 6 again under each column. So far everything this
circuit carries, the carry, the sign and the multiplier, it carries by writing on the page. Long multiplication is the
first procedure where the page has no room for that, so something has to stay on in the circuit for as long as a row
runs. That's the first real pressure towards held context, which is a kind of state, and it comes from the procedure
itself rather than from a design choice.

## Results

| | seed 1 | seed 2 |
|---|---|---|
| first three examples ("+", "−", "×" one digit) | as C155: searched, replayed, replayed; the one step learned at example 3 | the same |
| long first rows: search | nothing settled | nothing settled |
| long first rows: replay and recall | settled only coincidences (below) | the same kind |
| the store gives at the end | C155's step, unchanged | C155's step, unchanged |
| test: long first rows, 3 to 5 digit tops | 10% / 12.5% / 7.5% over both seeds | |
| test: × one digit | 100% | 100% |

The coincidences, seed 1. Example 5 (87 × 21) was settled by replay. Its multiplier's units digit is 1 and it has no
carries, so steps that compute the carry times the multiplier, plus the top digit, just copy the top number, which is
the right answer for "times 1". Example 6 (88 × 55) was settled by recall, because both multiplier digits are 5, so
multiplying by the wrong one gives the right row. Neither changed what the store gives.

## What it shows

1. **The learned step is right for what it saw, and wrong for this.** Passing the multiplier to the left was learned
   where the place to the left was empty. On a two-digit multiplier it isn't, and the step fails exactly where you'd
   expect, from the second column.
2. **The page can't carry everything.** The circuit's only way to keep a value through a row has been to write it
   where the next column reads it. That worked for the carry (written in the carry row), the sign (written in the empty
   sign row) and the single-digit multiplier (written in the empty bottom row). A two-digit multiplier fills the place.
3. **What's needed is a value held on while a row runs.** In C152 holding the sign on looked like a patch for a
   problem that turned out not to need it. Here the evidence points the other way: there's no space on the page, so
   something has to be held. It's the first time the question of states has come up because a procedure needs it.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | recall and replay fail on the long pages | **Holds**, apart from coincidences: a multiplier ending in 1 with no carries, or two equal multiplier digits. |
| 2 | search finds nothing; the store keeps C155's step; 0% on long first rows, 100% on one digit | **Holds**, except that long first rows are about 10% right by coincidence rather than 0%. |
| 3 | the indication: the multiplier must be held, not written | That is the reading here. It's an interpretation of the failure, not something the run tested. |

## The ledger, after the run

**Given:** as C155, plus the long-multiplication page layout (first row only) and the new proposer constraint (no step
writes its sign and its pass-on into the same place). **The engine:** as C155. **Disclosed:** before writing the
hypothesis, C155's step was put on two long-multiplication pages by hand in the test circuit (47 × 36 and 583 × 24).
That's what showed the problem, and it's described in the hypothesis. This was a deliberately small run, so the numbers
are an indication, not a measurement.

## What it suggests next

1. **Holding a value on while a row runs.** The smallest version: when the step reads the multiplier at the start of a
   row, the value stays on (held by the clock, as the step's parts are) until the row ends, and the step reads it from
   there rather than from the page. Whether that can be learned, rather than built in, matters. One way is to offer
   "hold this read" as a part a candidate can have, like the pass-on, and see whether the long pages select it.
2. **Then the restart.** Going back to the start of the next row, one place left, with the next multiplier digit. With
   a held value, that's also where letting go of one held value and picking up the next comes in.
3. **Then adding the rows,** which the step already does.

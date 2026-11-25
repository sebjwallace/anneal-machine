# C150 · Learning in the circuit: hypothesis

Follows [C149](../C149-the-engine-does-the-sum/findings.md), where the engine performed column addition by itself in
one run, but with a step learned elsewhere (C148's process: the experiment's code proposing steps, the engine judging
units digits one at a time, the held-open rule settling) and then turned into the circuit's gates by the experiment's
code. Here the step is learned by **the circuit that runs it**, on worked examples placed in the space.

## The idea

A worked example already has its working written in: the carries above and the answer below. If the circuit runs a
candidate step over it, every write lands on a place that is already written. The write rule meets it: **the same
digit cools the place** (that part of the working is explained); **a different digit, or an empty place, is a misfit**
(heat). Nothing is formed in the space. So running a candidate over the example is its own test, with no separate
checker: a candidate that gets through the whole example with no misfit, and cools all the working, has explained it.

## How

- **The worked examples, written in full** by the encoder: both numbers padded with zeros to one more digit than the
  longer, a carry of 0 above the last column, every carry (0 or 1) and every answer digit. (Written-out zero carries
  are a change from C142 to C148, where only carries of 1 were shown.)
- **Lanes of the circuit** (C146's idea, applied to C149's circuit): 8 copies of the circuit's focus, clock, held parts,
  fact slots, facts and write places, all reading the one shared space. Each lane runs one candidate.
- **Stage A, the reads:** for each read set, a lane runs one cycle at each column of the example, from that column; the
  read set survives if the units digit it would write is the written one at every column. Read sets come in rule B's
  order (C147, with C147's fix): nearest first; once any survive, one ring further, then stop.
- **Stage B, the whole step:** every surviving read set, with every carry place and both moves, run in a lane over the
  whole example from the last column, as C149 runs a sum. Kept if no misfit and all the working is cooled.
- **Across examples:** first, the step already bound is run alone over the next example; if it leaves no heat, that
  example is cooled by recall. Otherwise stages A and B, and C139's held-open rule between examples.
- **Test:** the bound step in C149's circuit, as C149 (4 to 8 digits at a new position), 20 sums per length.

A smoke test on one seed was run while building the lanes, before this hypothesis was written.

## Arms

- **Learn:** worked examples as above, 20 seeds.
- **Learn from sums without carries:** the same, with every worked example chosen so no column carries (every carry
  written is 0). In C142 this control failed, because nothing showed where a carry goes.

## The ledger

**Given:** the encoder (worked examples written in full, with padding and the carry of 0); the circuit's fixed
architecture and the lanes (copies formed beforehand); the write rule as it meets written working (same digit cools; a
different digit or an empty place is a misfit); **which candidates get a lane** (stages A and B: rule B's order, then
every carry place and move for each surviving read set); **the judgement "no misfit and all the working cooled"**, read
by the experiment's code from what the write rule recorded; the held-open rule; **binding the settled step** into
C149's circuit (the experiment's code); the test as C149. **The engine:** running every candidate over the worked
example (reading by completion, routing, the facts, the write places, the clock, the moves), and the write rule meeting
the working.

## Predictions (fixed before running)

1. **Learn:** every seed binds the step C142 to C149 found (read the carry above and the two digits; units at the
   focus; carry one left in the carry row; move left), within the six examples.
2. **Learn, test:** 100% at 4 to 8 digits, every run stopping by itself.
3. **Coincidences die in stage A or B:** a read set that reads an empty place (as C147's coincidence does, at the last
   column) never completes a fact there, so it can't survive stage A.
4. **Without carries:** unlike C142, the step is still learned right in at least 18 of 20 seeds, because the written
   zero carries pin down where a carry goes and where it is read from. Those seeds are 100% at test.

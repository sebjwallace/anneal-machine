# C181 · Heat in the substrate: hypothesis

Written before the run (C180's lapse is not repeated). Date: 2026-11-27. "Substrate" is the owner's word, from today, for
the structure of associative memory: volumes of interconnected cells, like a material. Heat is the energy dynamics of
that material.

## The question

In C180, heat lowering the bar worked as heat dynamics, but the heat levels, the "already tried" marks and the ranking
were the code's. Can heat live in the substrate as energy on its cells, moved by a few general rules, and drive the
adapting without any of that bookkeeping?

## The setup

C180's harness (one memory replayed through its earlier lessons; times one digit from adding; the second row from times
one digit; tests from the start), with a new arm.

### The energy layer

Heat is an amount on each cell of the shared vocabulary of parts: every kind of part at every place in reach. Four
general rules move it:

1. **Sources.**
   - When an attempt leaves work undone, each part blamed (C180's blame) gains 1 unit: a write that didn't cool; the
     reads, sign read, holding and move when a wrong digit landed on the working; a read whose place was empty where
     the work stopped.
   - Each place of the working still to be done gains 0.5 units on the cells that could write there (the answer and the
     carry writes at that place).
2. **Spreading.** After each attempt, every cell keeps half its heat and passes the other half, shared evenly, to its
   neighbours. Neighbours are the same kind of part at the places one step away, plus read versus hold at the same
   place, and the other direction of move. The nearest alternatives warm first, and the reach widens by itself.
3. **Taking over.** At the start of an attempt, for each part of the way of working, the warmest alternative that can
   act takes over if its heat is above 1 (the strength of the part in place, a fixed bar). An alternative can act if it's
   a write on an empty place in reach, or a read of a place holding something. Several parts can take over in one
   attempt. **A cell that takes over spends its heat** (it goes to 0).
4. **Draining.** When an attempt cools more of the working than any before, its way of working is kept, and all heat
   drains to 0.

The numbers (1, 0.5, a half kept, a bar of 1) are knobs, set before the run and not tuned after it. They're declared.

### Still the code's

- practising, meaning running the worked example again;
- comparing an attempt's cooling with the best so far;
- blame, read from the run's writes and focus (as C180);
- the energy layer's arithmetic, which lives beside the assemblies, not yet in them.

**Gone from the code:** the list of changes, the "already tried" marks, the ranking, and the reach schedule.

- Each worked example has a limit of 1,500 attempts.

## Predictions

1. **Times one digit:** within about 20 attempts. The stall blames the read of an empty place, and the heat spreads to
   holding at the same place (one step away), which takes over.
2. **The second row: settles, and doesn't get stuck where two parts must move at once.** The writes are pulled straight
   to the places still to be done by the sources. Later, the answer write and the carry read are both hot and can take
   over together. Expected between 150 and 600 attempts in all, and 200 of 200 at test.
3. **Risks:**
   - **Churn:** several parts taking over at once may change too much, so nothing cools more and it runs to the limit.
   - **The coincidence:** heat-driven tries may settle the first example with the wrong carry read, as greedy did.
   Either would be reported as it is.

## The ledger (planned)

**Removed:** the code's heat levels, tried marks, ranking and reach. **Added:** the energy layer's four rules and knobs.
Everything else as C180.

## A fix after the first run (disclosed; the knobs unchanged)

In the first run (out-first-run.txt) almost every attempt was refused: two parts took the same place at once (usually
the answer and the carry write, both drawn to the same place still to be done), and the rule refused the whole
attempt. So nothing ran, and every example stuck within about ten runs. That was a flaw in the wiring, not in the idea.
The fix: alternatives take over hottest first, and a part can't take a place that another part of its group already
holds (the three reads; the two writes). It takes its next warmest instead. The predictions above stand as written.

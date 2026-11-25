# C155 · Times one digit: hypothesis

Follows [C154](../C154-the-sign-carried-along/findings.md), where one learned step added and subtracted, carrying the
sign along itself from a single written sign. Long multiplication is the aim further on. This is its first piece:
**multiplying a number by a single digit (say 347 × 6), learned on the same circuit and in the same store as addition
and subtraction.** On paper the multiplier is written once, under the last column, with the × sign. So it's in the same
position the sign was in: written once, needed in every column. The question is whether the step learns to carry the
multiplier along as it learned to carry the sign, and whether one step still covers all three kinds of sum.

## What changes from C154

- **A third fact family,** Π: from a digit a, a digit b and a carry k, the units and tens of a × b + k. The tens can now
  be up to 8, so the carry cells go up to 9 (they went up to 2). Formed beforehand, like the others.
- **A third sign,** "×", written once under the starting column. Its meaning (which facts) is learned, like the others'.
- **Worked multiplications** are laid out as on paper: the top number (padded with one 0), the multiplier once under
  the last column in the bottom row, the sign once below it, every carry written above the next column, every answer
  digit below. The carried multiplier is not shown, just as the carried sign isn't.
- **A pass-on write.** The step gets one more part: pass one of its digit reads (the first, second or third) on to a
  place. It's held one phase and written by the same write rule as everything else, and a place that already holds
  something is never written. In the lanes, as with the sign, the lane's own copies of empty places hold what it
  passed on, and the lane reads them back like any written digit.
- **Stage A, changed in one respect for every example:** a read set is judged only at columns where all three of its
  places hold a digit. A read of an empty place gives nothing to judge, so that column's heat is unexplained rather
  than contradicted. Without this, no read set could survive a multiplication, because the multiplier is only under
  one column. Stage B1 and B2 are as C154's, with B2 trying every sign place together with every pass-on (which read,
  and where). Candidate reads are proposed in all three orders for every family.

## What's expected to happen, and why

In additions and subtractions the bottom row is full, so passing the bottom digit on to the left writes nothing. It
makes no difference which pass-on a candidate has: all of them settle, and the store ties at that part. In a
multiplication, only passing the multiplier (the second read) on to the place to its left (−1,−1) lets the next
column read it, so only that one settles. It is then bound once more than every other pass-on, and wins. As in C153
(reading order) and C154 (sign place), repetition picks the one part that fits every kind of example.

## The arm

**Learn:** 12 worked examples per seed, cycling "+", "−", "×" (4 of each; 2 and 3 digit numbers, multipliers 1 to 9).
10 seeds. There's no control arm. C154 already showed the carrying is learned only when the examples need it, and the
test below checks all three kinds with the one step.

Test, per seed: the store's step and links bound into one circuit; 20 sums per length at 4 to 8 digits for each of
"+", "−" and "× one digit", at a column not seen in training, each with its sign (and multiplier) written once.

## The ledger

**Given:** the encoder (worked examples written in full, the sign once, the multiplier once, the working declared as
heat); the cue "="; the three fact families; the circuit's fixed architecture (as C154, plus the pass-on write and carry
cells up to 9); proposing candidates (stages A, B1 and B2, with stage A's rule for empty places); moving the store's
step and links into the test circuit. **The engine:** running every candidate, carrying the sign and the multiplier
along, cooling, stopping, settling, binding, recalling with copies counting, and running every test sum.

## Predictions (fixed before running)

1. **The store:** in every seed, "=" gives C154's step plus **pass the second read (the bottom digit) on to −1,−1**.
   "+" links to Σ, "−" to Δ, "×" to Π. Learned at the first multiplication (example 3), when that pass-on gets its
   extra copy; later examples by recall.
2. **The test:** 100% on all three kinds at 4 to 8 digits, every run stopping by itself.
3. **Addition and subtraction undisturbed:** the step's other parts are C154's exactly.
4. **The risk:** carries up to 8 and three families may expose something addition-shaped in the circuit, or the search
   may grow too large. If so, it will show as a multiplication that never settles, and the store keeping C154's tie.

## Revision before the main run (after a build check)

A build check (one seed, the first three examples; [build-check.txt](build-check.txt)) showed that **the change to stage A
doesn't work.** Judging a read set only where all its places hold a digit lets near coincidences survive in additions
and subtractions: sets that include an empty place at the edges get judged on fewer columns. Rule B then stops before the
ring where the true reads are. In that seed's subtraction, no candidate settled at all. In the multiplication, where
the true reads can only be judged at one column, 110 read sets survived, and the search was far too large to be useful
(56,250 candidates in B1).

**Revised, before the main run:** stage A goes back to C154's (judged at every column), and the proposer gains
**replay.** Before any search, every step the store already holds is run over the example, with each family as the
candidate link for the example's sign. Whatever settles binds itself, as in a search. In plain terms: try what you
already know before looking for something new. This is a new part of the proposer, and a step towards priming (it's the
proposer reading the store's own structure, so it's still the experiment's, and declared).

With replay, the expectation is: the first addition is searched as in C154 and binds its step with every pass-on (all
alike there). The first subtraction is settled by replaying those, which binds the top-first ones again. The first
multiplication is settled by replay too, but only by the top-first step that passes the second read on to −1,−1 (with
the Π link), plus the bottom-first step that passes the first read there. Top-first passing the second read then has
one copy more than anything else. The predictions stand as written, with "learned at example 3". Stage A alone could
never find a multiplication, because the multiplier is under one column only, so a multiplication that comes first,
before any step is stored, would not be learned. In this arm the order is always "+", "−", "×".

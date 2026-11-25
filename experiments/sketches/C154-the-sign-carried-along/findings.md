# C154 · The sign carried along: findings

Run: the learn arm in two shards side by side (`ARMS=learn SEEDS=10 SHARD=0/2 node learn.js` and `SHARD=1/2`, about
twenty-five minutes on two cores). Then the other arm the same way with `ARMS=full SEEDS=4` (about an hour). Then the two
reports, with `REPORT=1`, joined into [out.txt](out.txt). The `rows-*.json` files hold every seed. Read
[the hypothesis](hypothesis.md) first. Engine: C153's copy, unchanged.

## In short

**The step now carries the sign along by itself.** With the sign written once, under the column where the work starts,
every seed learned C153's step plus one more part: **write the sign under the next column to the left**, which is
exactly where the focus will read it after moving. Bound into one circuit, with each test sum's sign written once, it
was **100% right on 4 to 8 digit additions and subtractions** (2,000 of 2,000), every run stopping by itself. It was
learned from the first two examples in every seed, and the other ten were settled by recall.

**Nothing told it the sign needed carrying.** The worked examples don't show the carried sign, and it isn't part of the
working that has to cool. A candidate that writes the sign anywhere else simply finds no sign in the next column, so
no facts open, no answer digit comes, and the lane stops there. The only candidates that get through a whole example
are the ones that leave the sign where the next column will look.

**When the page carries the sign instead, the carrying isn't learned.** With the sign under every column in training,
there is nowhere empty in the sign row to write to. Where the sign is written then makes no difference to any example:
all fifteen sign places settled alike, every time. The store tied at that part and gave **no step in all 4 seeds: 0%**
on test sums with the sign written once. The links were still learned right.

**Every prediction held.**

## Results

| arm | the store gives at the end | step and both links by example | searched examples | test (sign written once) |
|---|---|---|---|---|
| **learn**: sign once (10 seeds) | **one step that carries the sign** (writes it at +1,−1); "+" → Σ, "−" → Δ, **10 of 10** | 2 / 2 / 2 | 2 of 12 | **100%** both kinds (2,000 of 2,000), all stopped by themselves |
| sign under every column in training (4 seeds) | **no step**; links right, 4 of 4 | never | 12 of 12 | 0% |

Seed 1, learn: example 1 (326 + 43) settled six lanes, the three reading orders each with the carry read above or to
the left (no carries in that sum), and **every one of them writing the sign at +1,−1**. In B1, twelve candidates got
through the first column; in B2, of all fifteen sign places, only that one let any of them finish. Example 2 (248 − 91)
settled one lane, top first, with the same sign write, and the store gave that step from then on.

Seed 1, sign under every column: each addition settled every surviving read order with all fifteen sign places (90
lanes in example 1, 45 in others), and each subtraction settled the one read order with all fifteen (15 lanes). The
fifteen were always bound equally often, so recall stopped at the sign place in every example.

Work in learning, per seed: 2,473 circuit runs for **learn**, almost exactly C153's (2,451). Stage B2, the new search
over sign places, added only 174 candidates a seed, because B1 had already narrowed things to the few that got through
a first column. The other arm searched every example: 14,755 runs a seed.

## What it shows

### 1. A variable carried through the frame, learned from its effect

The sign is now a value the procedure reads, uses, and passes on, column to column, by the same write rule that writes
digits. This is the frames-and-variables goal in small: the frame (the step) is constant, the variable (the sign) is
picked up at one place and passed to the next. And it was learned not because the example showed it, but because
nothing else lets the procedure keep going. The need for the variable is what selected the write.

### 2. Evidence decides what's learned, as before

The two arms differ only in what the worked examples show. Where the page already holds the sign everywhere, carrying
it is never needed, so it's never learned, and the store honestly gives nothing rather than picking a sign place at
random. That's C151's carry-free control again: what the examples can't tell apart, the store doesn't guess.

### 3. Staged search by heat keeps the cost flat

Splitting stage B by the first column's heat (B1, then B2) meant that adding a whole new part to the step cost almost
nothing. Only candidates that explained the first column were tried with sign places. That staging is still the
experiment's (proposing candidates is the main crutch left), but it shows the order in which heat is explained can
carry much of the search.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | learn: C153's step plus write the sign at +1,−1; links right; by example 2; later by recall | **Holds:** 10 of 10, by example 2; all later examples by recall. |
| 2 | learn: 100% on both kinds with the sign written once, stopping by itself | **Holds:** 2,000 of 2,000. |
| 3 | sign under every column in training: every sign place settles alike, the store ties, no step, 0% | **Holds:** all fifteen settle; no step in 4 of 4; 0%. |

## The ledger, after the run

**Given:** the encoder (worked examples written in full, the sign written once under the starting column, or under
every column in arm 2; the working declared as heat); the cue "="; the two fact families; the circuit's fixed
architecture (as C153, plus holding the sign read one phase, the sign write place, writing a sign by the write rule, and
in the lanes a lane's own copy of the empty places it writes a sign into); proposing candidates (stages A, B1 and B2);
moving the store's step and links into the test circuit. **The engine:** running every candidate, carrying the sign
column to column, cooling, stopping, settling, binding the step and the link, recalling with copies counting, and
running every test sum.

**Disclosed:** [smoke.js](smoke.js) was run while building, as a check: the expected step with the right and a wrong
sign place in the test circuit, and three lane jobs on one worked subtraction. It isn't part of the results. The two
arms' reports were printed separately and joined into out.txt, with its second line edited to give both seed counts.

## What it suggests next

1. **Long multiplication**, the owner's stated aim. It needs things this circuit hasn't had to do: a carry that can be
   more than 1, a digit of the multiplier held while sweeping the whole multiplicand (another carried variable, but
   held across a whole row rather than passed along), several rows written at shifting offsets, and a final addition
   of those rows, which is the procedure already learned. It is the first case where one step plainly won't be enough
   on its own, so it is where the question of states will really be tested.
2. A way in that changes one thing at a time: **multiplying by a single digit first** (one row; the multiplier digit
   read once and carried, as the sign is here; carries up to 8). Then the rows, then adding them.
3. **Proposing candidates** is still the experiment's, and long multiplication will make the search much bigger. Priming
   from the store (trying what's already learned, and its parts, first) may become necessary rather than optional.

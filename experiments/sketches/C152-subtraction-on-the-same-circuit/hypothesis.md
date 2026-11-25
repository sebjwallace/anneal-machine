# C152 · Subtraction on the same circuit: hypothesis

Follows [C151](../C151-settled-and-bound/findings.md), where the circuit learned column addition from worked examples,
judged and bound the step itself, and added 4 to 8 digit numbers 100% right. The question here is whether that circuit
is general or addition-shaped: **give it worked subtractions with borrowing, alongside worked additions, and see what
it learns and whether both procedures live in one store and one circuit.** No target shape is assumed beyond that: the
interest is in what changes, what breaks and what comes out on its own.

## What stays the same

The circuit is C151's: the space as place → content gates, the six-phase clock, reading by attending a place, routing
read digits into the slots of the facts, writing as a fixed rule, agreement gates cooling the working, the clock stopping
on a misfit, the Settled gate, the binding rule and the program store with copies counting. Candidates are proposed as
in C151: stage A tests read sets at single columns, nearest ring first and one ring further (rule B), and stage B runs
each survivor with every carry place and move over the whole example.

## What changes, and why

- **Two families of facts in memory, side by side.** The addition facts as before, and subtraction facts: from a digit
  a, take b and k, giving the units digit and how many tens are borrowed (a − b − k, with units in 0 to 9 and the
  borrow 0, 1 or 2, using the same T cells as the tens of a sum). Each fact gate now has a **family cell** in its key
  (Σ for addition, Δ for subtraction), so a fact only opens when its family is on.
- **The family is part of the step, and learned.** A step is now: three reads, a units place, a carry place, a move,
  **and a family**. Nothing in the code says which family goes with which sign; the proposer tries both.
- **Order can matter.** Addition's facts treat their three slots alike, so a read set is unordered, as in C151.
  Subtraction's facts have one distinguished slot, the one taken from, and two alike (taking b then k is taking k then
  b). So for the Δ family each read set is proposed three times, once with each read as the "from". The proposer fills
  the slots each family's facts have; it doesn't know which read is the top number.
- **Two signs.** Each worked example carries its sign ("+" or "−"), given by the encoder, and a settled lane binds its
  step under that example's sign in one shared store. Recall is from the sign. At test, both learned steps are bound into
  one circuit (each brought on by its own sign, sharing every other cell), and each sum is started from its sign.
- **Worked subtractions** are laid out as the additions are: the top number, the bottom number below it, borrows
  written in the top row above the next column to the left (a 0 above the last column), the answer in the bottom row.
  The top number is always the larger, so answers are never negative. Both numbers are padded with zeros to one more
  digit than the top.

## Arms

1. **Learn both:** 12 worked examples per seed, alternating "+" and "−" (6 of each, 2 and 3 digits), each bound under
   its own sign. 20 seeds.
2. **One sign for both:** the same examples, but the encoder writes "+" for all of them, so both procedures are bound
   under one sign. 20 seeds. This shows whether it's the sign that keeps them apart.

Test, per seed: the store's "+" and "−" steps bound together into one circuit; 20 sums per length at 4 to 8 digits for
each sign, at a column not seen in training. In arm 2 both kinds of sum are started from "+".

## The ledger

**Given:** the encoder (worked examples written in full with their sign; declaring their working as heat); the two fact
families, formed beforehand, each keyed by its family cell; the circuit's fixed architecture (as C151); proposing
candidates, now including the family and, for Δ, which read is taken from; moving the store's steps into the test
circuit. **The engine:** running every candidate, cooling, stopping on a misfit, settling, binding under the sign,
recalling from the sign with copies counting, and running the recalled steps on the test sums.

## Predictions (fixed before running)

1. **Learn both, the store:** in every seed, "+" recalls C151's step with the Σ family, and "−" recalls: take from the
   top number (−2,0), take the bottom (−1,0) and the borrow above (−3,0), write the units at the focus and the borrow at
   −3,−1, move ←, with the Δ family. That is, the same step shape as addition except for the family and the "from".
   Each is learned within its first two or three examples of that sign.
2. **Learn both, the test:** 100% at 4 to 8 digits for both signs, every run stopping by itself. This is the most
   uncertain prediction: the two steps share four of their seven parts in both the store and the test circuit, and if
   completion from the shared parts brings on the other step's parts, the two will interfere and both will fail.
3. **Addition is undisturbed:** arm 1's "+" results match C151's (100%).
4. **One sign for both:** the two steps are bound equally often under "+", so most seeds end in a tie and recall
   nothing; and in no seed are both kinds of sum right, since one sign can only bring on one step.

# C153 · One step reads the sign: findings

Run: the learn arm in two shards side by side (`ARMS=learn SEEDS=10 SHARD=0/2 node learn.js`, and `SHARD=1/2`, about
twenty-five minutes on two cores). Then the unordered arm the same way with `SEEDS=4` (about forty minutes). Then the
two reports, with `REPORT=1`, joined into [out.txt](out.txt). The `rows-*.json` files hold every seed. Read
[the hypothesis](hypothesis.md) first. Engine: C152's copy, unchanged.

## In short

**One learned step does both addition and subtraction, and nothing has to be kept apart.** With the sign written on the
page and read like a digit, every seed's store ended up with a single step: read the top number, then the bottom, then
the carry or borrow above; read the sign below; write the units here and the carry or borrow up and to the left; move
left. "+" means the addition facts and "−" the subtraction facts, a link learned from which facts settled each example.
Bound into one circuit, that step and its two links were **100% right on 4 to 8 digit sums of both kinds** (2,000 of
2,000), every run stopping by itself.

**It was learned from two examples.** In every seed, the first addition settled the step in all three reading orders
(addition doesn't care which number comes first). The first subtraction settled only the top-first order. That gave
top-first one more copy than the others, and from then on the store gave it from "=". All ten later examples, of
both kinds, were settled by recall alone, one circuit run each.

**C152's problem didn't need solving; it went away.** There are no longer two procedures sharing parts, so there is
nothing to lose track of. The difference between adding and subtracting isn't held by the step at all. It's on the
page, and the step reads it each column.

**The control shows where the one step comes from.** When addition is proposed in only one order (the bottom first, as
in C151 and C152), the addition step and the subtraction step differ in their first two reads. Both are bound under
"=", they're rivals, and the store ends with **no step in all 4 seeds: 0% on both kinds**. The links were still learned
right. So a single step emerges only because addition's freedom of order is open to the learner, and repetition picks
the order that also fits subtraction.

**Every prediction held.**

## Results

| arm | the store gives at the end | step and both links by example | searched examples | test, both kinds |
|---|---|---|---|---|
| **learn** (10 seeds) | **one step**, top first, sign below; "+" → Σ, "−" → Δ, **10 of 10** | 2 / 2 / 2 | 2 of 12, every seed | **100%** (2,000 of 2,000), all stopped by themselves |
| addition proposed unordered (4 seeds) | **no step**; "+" → Σ, "−" → Δ, 4 of 4 | never | 12 of 12 | 0% |

Seed 1, learn: example 1 (326 + 43) has no carries, so six lanes settled: the three reading orders, each with the carry
read above or to the left. Every one of them found the sign below the column, and every one bound "+" to the addition
facts. Example 2 (248 − 91) settled one lane only: top first, borrow above, sign below, with "−" bound to the
subtraction facts. That step now had two copies against one, and the store gave it. Examples 3 to 12 were each settled
by running the recalled step once.

Seed 1, unordered: after each addition, the store gave the addition step (bottom first), which failed on the next
subtraction. After each subtraction the two were level, and the store gave nothing. That alternation ran to the end,
just as in C152, but now with one cue instead of two signs.

Work in learning, per seed: 2,451 circuit runs for **learn**, against 3,838 in C152, even though each search is
heavier here (15 places, three orders for addition, sign places). Recall did the rest. The unordered arm never
recalled anything that settled, so it searched every example: 9,327 runs a seed.

## What it shows

### 1. A difference in procedure can live on the page instead of in the step

In C152 the sign picked a procedure and then vanished, so two procedures sharing parts couldn't be told apart. Here the
sign is data, read every column, and what it selects is the facts, not the procedure. One step, seven parts, and a
link from each sign to a family of facts. This answers the owner's question for this family of procedures: **no
separate states were needed.** What looked like two procedures was one procedure applied with two sets of facts,
chosen by what's written.

### 2. Repetition finds the general step

Nothing told the learner to read the top number first. Addition alone would never decide it (all three orders tie
for ever). Subtraction alone would decide it, but only for subtraction. With both kinds of example, the order that
fits both is bound every time, and each of the others only half the time. So the step that covers more of what's seen
outgrows the rest. That's C148's "more structure wins" doing what a designer would otherwise have to do, and the
control shows that it needs the alternatives to be on offer.

### 3. The meaning of a sign is learned the same way as everything else

The link "+" → addition facts was never wired. A candidate tried either family for the example's sign, and only the
right one settled, so only the right link was bound. Across every seed of both arms, the links came out right.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | learn: one step, top first, sign below, links right, every seed, by example 2 or 3; later examples by recall | **Holds:** 10 of 10, by example 2; all ten later examples by recall. |
| 2 | learn: 100% on both kinds in one circuit, stopping by itself | **Holds:** 2,000 of 2,000. |
| 3 | unordered: C152's rivalry returns; no step in most seeds; never both kinds right | **Holds:** no step in 4 of 4; 0% on both. |

## The ledger, after the run

**Given:** the encoder (worked examples written in full, the sign under every column of worked and test sums alike,
declaring the working as heat); the cue "=" that starts any written sum; the two fact families, formed beforehand; the
circuit's fixed architecture (as C152, plus routing a sign read through a link into a family); proposing candidates
(stage A with the family switched on; stage B with every carry place, move and sign place, and the survivor's family
as the candidate link); moving the store's step and links into the test circuit. **The engine:** running every
candidate, cooling, stopping on a misfit, settling, binding the step under "=" and the link under the sign, recalling
both with copies counting, and running every test sum.

**Changes from the hypothesis, disclosed:**

- **The unordered arm ran 4 seeds, not 10.** It searches every example, at about twenty minutes a seed. A first attempt
  at 10 seeds was stopped partway, before any seed of that arm had finished, and restarted at 4. The learn arm ran its
  full 10 seeds.
- **A build check, [smoke.js](smoke.js),** was run while building: the expected step bound in by hand on one sum of each
  kind, and three lane jobs on one worked subtraction (the right one settled, the wrong link and the wrong sign place
  didn't). It isn't part of the results.
- The reports for the two arms were printed separately (each with its own seed count) and joined into out.txt. Its
  second line was edited to give both counts. Nothing else in it was changed.

## What it suggests next

1. **Write the sign once.** Here the encoder writes the sign under every column, which is a crutch: the page is doing
   the carrying. On real paper the sign is written once. The step would then need to carry it along, reading it and
   writing it to the next column as it does the carry: a variable passed from column to column by the procedure
   itself. That is the frames-and-variables goal in miniature, and the obvious next experiment.
2. **A procedure that really is different.** Addition and subtraction turned out to be one shape. Something whose steps
   differ in shape, like multiplying by a single digit (carry can exceed 1, a different write pattern) or long
   multiplication (several passes), would test whether "one step that reads more of the page" keeps working, or where
   a second step, or a state, becomes necessary.
3. **Proposing candidates** is still the experiment's, and stage A has grown. Priming from what is already in the store
   is the way to shrink it.

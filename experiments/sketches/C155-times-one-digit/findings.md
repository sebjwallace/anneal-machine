# C155 · Times one digit: findings

Run: two shards side by side (`SEEDS=10 SHARD=0/2 node learn.js` and `SHARD=1/2`, about fifty minutes on two cores),
then `SEEDS=10 REPORT=1 node learn.js > out.txt`. The `rows-*.json` files hold every seed. Read
[the hypothesis](hypothesis.md) first, **including its revision**: a build check before the main run showed the first
design for stage A didn't work, and it was replaced by replay ([build-check.txt](build-check.txt) is that check, and
[build-check-2.txt](build-check-2.txt) is the revised design on one seed, four examples). Engine: C154's copy, unchanged.

## In short

**One learned step now adds, subtracts and multiplies by a single digit.** Every seed ended with the same single step:
C154's, plus one new part, **pass the second read (the bottom digit) on to the place to its left**. In additions and
subtractions that writes nothing, because the bottom row is already full. In a multiplication it carries the
multiplier along, exactly as the step already carries the sign. "×" was learned to mean the multiplication facts. Bound
into one circuit, the step was **100% right on all three kinds at 4 to 8 digits** (3,000 of 3,000), every run stopping
by itself. Carries up to 8 caused no trouble.

**Multiplication was learned by reusing what was already known, not by searching.** In every seed, only the first
example (an addition) was searched. The first subtraction and the first multiplication were each settled by
**replay**: running the steps already in the store over the new example, with each family as the sign's meaning. For
the multiplication, of the 270 steps stored from the first addition, exactly two settled. One was the top-first step
passing the multiplier on, the other a bottom-first step doing the same. Top-first then had one copy more than
anything else, and the store gave it from then on. All nine later examples were settled by recall, one run each.

**The first design failed, and that's worth keeping.** A search on its own could never find the multiplication. The
multiplier is under one column only, so no set of reads can be checked across a whole multiplication without the
pass-on that hasn't been found yet. My first attempt, judging reads only where their places hold digits, let
coincidences through everywhere (details below). What worked was what a person does: try what you already know first.

**Every prediction held,** with the design revised before the main run.

## Results

| | result |
|---|---|
| the store gives at the end | **one step, 10 of 10 seeds:** read the top, then the bottom, then the carry above; read the sign below; write the units here and the carry up and to the left; write the sign on under the next column; **pass the bottom digit on to its left**; move left. "+" → Σ, "−" → Δ, "×" → Π |
| step and all three links first recalled | example 3 (the first multiplication), every seed |
| how each seed's 12 examples were settled | searched, replayed, replayed, then recall ×9, **in every seed** |
| test, one circuit | **100%** on +, − and × one digit, 4 to 8 digits (3,000 of 3,000), all stopped by themselves |

Seed 1, as it happened. Example 1 (326 + 43), searched: 270 lanes settled. That's six read orders (no carries, so the
carry above or to the left) times all 45 pass-ons, since in an addition every pass-on writes nothing and they all fit
alike. So the store tied at the pass-on. Example 2 (248 − 91), replay: 45 settled, the top-first step with every
pass-on, under the Δ link. Example 3 (345 × 7), replay: **2 of 270 settled**, both under the Π link: top-first passing
read 2 on to −1,−1, and bottom-first passing read 1 there. Both pass the multiplier. Top-first passing read 2 had now
been bound in all three examples, and it won.

Work in learning, per seed: 2,711 circuit runs, about the same as C153 and C154, nearly all of it in the first example's
search. Replay cost about 100 runs per example.

## What it shows

### 1. The multiplier is a variable carried through the frame, like the sign

The step reads the multiplier where it's written, uses it, and writes it on where the next column will read it.
That's the same mechanism that carries the sign, and it was selected the same way, because nothing else lets the
procedure continue. The procedure has two carried variables now (the sign and the multiplier) plus the carry, all
passed on by the one step.

### 2. One step, extended rather than replaced

Addition, subtraction and multiplication by a digit are one procedure: the same reads and writes, with a pass-on that
only matters when the page leaves a gap. The store never held separate procedures, and still didn't need states. Each
new kind of sum either fitted the existing step or picked out the variant of it that fitted everything seen so far.

### 3. Reuse before search is what made it learnable

Search alone, as built here, can't find a multiplication: judging reads column by column can't see a variable that
only exists once it's been carried (the bottom read is empty in every column but the first, so no read set passes
stage A). That follows from the design rather than from a run. Replay finds it at once, because the right step was already in the store, bound by the additions, where
its pass-on did nothing. In a sense the additions prepared the multiplication: their ties left every pass-on in
memory, and the first multiplication chose among them. This is the first time an earlier procedure has been the
source of a later one, rather than a rival to it.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | one step, C154's plus pass the second read on to −1,−1; links right; learned at example 3; later by recall | **Holds:** 10 of 10. |
| 2 | 100% on all three kinds, stopping by itself | **Holds:** 3,000 of 3,000. |
| 3 | addition and subtraction undisturbed | **Holds:** every other part is C154's. |
| 4 | the risk: carries up to 8 or the search size break something | **Didn't happen** with replay. The search, as first designed, did break (see the revision). |

## The ledger, after the run

**Given:** the encoder (worked examples written in full, the sign and the multiplier written once, the working declared
as heat); the cue "="; the three fact families, formed beforehand; the circuit's fixed architecture (as C154, plus the
pass-on write and carry cells up to 9); proposing candidates: **replay** (running every step the store holds, read
from the store's own structure, with each family as the link), and when replay settles nothing, stages A, B1 and B2;
the order of the examples (always "+", "−", "×": a multiplication first would not have been learned); moving the
store's step and links into the test circuit. **The engine:** running every candidate, carrying the sign and the
multiplier along, cooling, stopping, settling, binding, recalling with copies counting, and running every test sum.

**Changes from the hypothesis, disclosed:**

- **The revision.** A build check before the main run (one seed, three examples) showed the hypothesis's stage A rule
  failing: coincidences survived early rings in additions and subtractions, so rule B stopped before the true reads (in
  that seed's subtraction, nothing settled), and 110 read sets survived the multiplication. Stage A went back to
  C154's, and replay was added. That was written into the hypothesis before the main run, with a second build check
  (one seed, four examples) on the revised design. Both checks' outputs are kept.
- **No control arm,** as the hypothesis said.

## What it suggests next

1. **Long multiplication.** Now that one row works, the rest is: several rows, each for one digit of the multiplier
   and written one place further left; then adding the rows, which the step already does. That needs something the
   circuit hasn't had: **going back to the start of a row** and beginning again with the next multiplier digit,
   rather than sweeping once and stopping. Whether that can come from the same step reading more of the page, or
   needs a second step that takes over (the first real state change), is exactly the question.
2. **Replay as the engine's own.** Replay is still the proposer reading the store. A circuit that runs what the store
   recalls, including rival candidates when it ties, would move this into the engine. It's also likely to be needed
   for long multiplication, where search will be hopeless.
3. **Writing the working from nothing.** Worked examples still declare their heat. That stays the encoder's for now.

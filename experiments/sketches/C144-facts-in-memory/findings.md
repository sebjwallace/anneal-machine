# C144 · The facts in memory: findings

Run: `node facts.js > out.txt` (a few seconds; [out.txt](out.txt) has every part, and the first seed of each arm
example by example). Read [the hypothesis](hypothesis.md) first. Engine: C143's copy, unchanged.

## In short

**The facts are easy, as the owner said.** All 1,000 single-digit facts of addition (three digits in; units and tens
out) were formed as assemblies in the engine and recalled by completion, **1,000 of 1,000 exactly right**. With every
fact in column addition recalled from the engine instead of looked up, everything came out **identical**: the same step,
bound at the same example in every seed, and 100% right on 4 to 8 digit sums at a new position, every run stopping by
itself. One crutch gone, at no cost.

**But completion can't judge a written digit, and what it does instead is interesting.** Given the three digits and a
wrong written units digit, the engine never rejects it (0 of 9,000). It brings on the right digit beside the wrong one
every time, **and it also opens the facts that would have made the wrong digit right**, by changing one of the inputs.
So the wrong digit recruits its own explanations. In the owner's terms, that is the memory patching: rationalising a
misfit rather than refusing it. Rejecting the wrong digit needs the two units digits to compete for one place, which
the engine can't do yet (its rivals come only from transitions). So the fit test stays given, and candidate B's main
risk is confirmed.

**A side finding:** completion has to be read the moment after the cue. Left to run on, the completed fact's members cue
other facts, and activity spreads (3, then 5, then 29, then 42 members active).

## Results

**Part 1, recall:** 1,000 of 1,000 cues brought on exactly the right units and tens, and nothing else, the moment after.

**Part 2, column addition:**

| facts | 4 to 8 digits, right | seeds at 100% | stopped by itself, after exactly the answer's digits | learnt at example | facts recalled from the engine (per seed) |
|---|---|---|---|---|---|
| looked up (C143's best search) | 100% | 20 of 20 | 4,000 of 4,000 | 1 / 1 / 2 | 0 |
| **recalled from memory** | **100%** | **20 of 20** | **4,000 of 4,000** | 1 / 1 / 2 | 1,495 |

The same step, bound at the same example, in every seed.

**Part 3, judging a written digit:**

| written digit | cases | result |
|---|---|---|
| right | 1,000 | only its own fact opened, bringing on that digit alone: 1,000 |
| wrong | 9,000 | wrong digit rejected: **0**. Right digit brought on beside it: 9,000. More than one fact opened: 9,000 |

From the trace: cue 0, 0, carry 0, with 1 written (right: 0). The next moment has units 0 and 1 both on, and 4 facts
open: the true one (0 + 0 + 0 = 0), and the three that would give 1 if one input changed (1 + 0 + 0, 0 + 1 + 0, and
0 + 0 with a carry of 1).

## What it shows

### 1. The facts are plain association

A fact is five members bound together. Three of them as a cue is enough for that fact alone to open (three of five
present), and nothing sharing only two opens. So arithmetic facts need nothing special: they're memorised associations,
recalled by completion, which is what the owner expected. Column addition didn't change at all with the facts moved into
the engine, which also shows the procedure never depended on how the facts were stored.

### 2. A wrong digit recruits its own explanations

With a wrong digit written beside the three inputs, the true fact still opens (three of its five members are there).
But so do the facts that contain the wrong digit and two of the three inputs: each is "what you'd have needed for this
digit to be right". The engine brings them all on together, and nothing competes. That is the memory looking for ways to
make a misfit fit, rather than seeing it as a misfit. It is the "always says yes" problem from the owner's notes,
showing up in arithmetic, and close to what he calls patching: a structured high-energy state that hides a misfit.

### 3. What it means for the candidate energy rules

Candidate B needs the engine itself to say "this explains that and nothing is left over". Here, the engine can't tell a
right digit from a wrong one, because the two units digits never compete: rivals in the engine come only from
transitions, and facts are states. The missing piece is the one C137 first found and the side notes describe: **rivals
from place**, so that two digits in the same place compete. A wrong digit would then lose to the recalled right one, and
that loss would be the heat. Until then, the fit test (comparing the recalled digit with the written one) stays the
experiment's.

### 4. Reading completion at the right moment

Completion is read one moment after the cue. Run on, the completed fact's members (its units and tens) become cues for
other facts, and activity spreads moment by moment. Here that is harmless because the experiment reads the first moment,
but in an engine running freely it would be: something has to stop a completed fact from setting off its neighbours.
In the theory's terms, a fact that completed should cool, not keep spreading.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | recall 1,000 of 1,000 exact | **Holds.** |
| 2 | column addition identical to C143's best arm | **Holds:** same step at the same example in every seed; 100%; every run stopping by itself. |
| 3 | completion can't reject a wrong digit; it brings on the right one alongside | **Holds:** 0 of 9,000 rejected; the right digit brought on in all 9,000. **Not predicted:** the facts that would have made the wrong digit right also open, in every case. |

## The ledger, after the run

**Given:** the 1,000 facts, formed beforehand; the roles (which population each read takes, by its order); counting an
empty cell as 0; reading completion one moment after the cue; the fit test (comparing the recalled digit with the
written one); everything else as C143. **The engine:** forming the facts and recalling every one by completion; storing
and recalling the step; every move.

## What it suggests next

1. **Rivals from place.** Two things in the same place compete. It would let a wrong digit lose to the right one, make
   the mismatch the heat, and move the fit test into the engine. It is also the side notes' learned competition, and
   what candidate B needs. This now looks like the next fundamental piece.
2. **Completion that cools.** A completed fact should stop, not cue its neighbours.
3. Then **candidate B** itself, with the facts and the fit both in the engine.

# C145 · Rivals from place: findings

Run: `node place.js > out.txt` (about 45 seconds; [out.txt](out.txt) has every part, and the first seed of each arm
example by example). Read [the hypothesis](hypothesis.md) first. Engine: C144's copy plus one rule, rivals from place,
switched on per memory.

## In short

**With rivals from place, the memory rejects a wrong answer by itself.** The rule: two members compete if they have
never been in an assembly together but share company. Given the three digits of a fact and then a written units digit,
the engine kept every right digit (1,000 of 1,000) and dropped every wrong one (9,000 of 9,000), with the right digit
standing in its place. Without the rule, as in C144, it dropped none. Instead the facts that would have made the wrong
digit right kept it on.

**Completion now stops.** Left to run on from a cue, the completed fact holds its five members and nothing else (3, then
5, then the same state held). Without the rule, activity spread to 43 members.

**The fit test for the units digit is now the engine's.** Column addition, with the units digit judged by whether it
survives in the engine, gave identical results: the same step at the same example in every seed, 100% on 4 to 8 digit
sums, every run stopping by itself. The rule also broke nothing else: moves and the step's recall worked as before.

**Every prediction held.** The rule was not told which digits compete. It found the five places in the facts (first
digit, second digit, carry, units, tens) from the structure alone.

## Results

**Part 1, judging a written digit** (digits at moment 1, written digit at moment 2, read at moment 3):

| | right digit kept | wrong digit dropped | right digit on, when a wrong one was written |
|---|---|---|---|
| without place rivals (C144) | 1,000 of 1,000 | **0** of 9,000 | 9,000 of 9,000 |
| **with place rivals** | **1,000 of 1,000** | **9,000 of 9,000** | 9,000 of 9,000 |

From the trace, cue 0, 0, carry 0, with 1 written: without the rule, every units digit 0 to 9 is on by moment 3. With
it, only 0 is on.

**Part 2, left to run on** from 3, 4, carry 1: without the rule, 3, 5, 29, 42, 43 members active. With it, 3, then 5,
then that state held.

**Part 3, column addition:**

| arm | 4 to 8 digits, right | seeds at 100% | stopped by itself, after exactly the answer's digits | learnt at example |
|---|---|---|---|---|
| C144 (rule off, units compared in code) | 100% | 20 of 20 | 4,000 of 4,000 | 1 / 1 / 2 |
| rule on, units compared in code | 100% | 20 of 20 | 4,000 of 4,000 | 1 / 1 / 2 |
| **rule on, units judged by the engine** | **100%** | **20 of 20** | **4,000 of 4,000** | 1 / 1 / 2 |

The same step at the same example as C144 in every seed, in all three arms.

## What it shows

### 1. Where things vary, they compete, and the structure already says where that is

In the facts, "7" as a first digit and "4" as a first digit are never in one fact together, but they both keep company
with the same second digits, carries, units and tens. So the rule makes them rivals. "7" as a first digit and "3" as a
units digit are in facts together, so they never are. Nobody declared the places: the rule found exactly the five slots
of a fact from which members never meet. That is the owner's attraction and repulsion in its plainest form: shared
company draws things together, and never meeting in the same company makes them compete for one place.

### 2. A wrong answer now loses instead of being rationalised

In C144, a wrong digit recruited the facts that would have made it right, and nothing stopped them. With place rivals,
those facts are rivals of the true fact, since each swaps one input for a rival digit, and the true fact has more support:
by moment 3 it holds all five of its members, while each alternative holds three or four. So the alternatives lose, and
nothing holds the wrong digit up, so it goes off. The right digit stays in its place. The mismatch is no longer patched
over. It is something that loses, and in the theory's terms, that loss is the heat.

### 3. A completed fact cools

The facts that used to be set off by a completed fact's members are all rivals of it, so they lose, and the completed
fact holds still. Completion now stops by itself, which C144 found was needed.

### 4. The fit test moved into the engine with nothing lost

The search still comes from the experiment (C143's), but the question it asks at every candidate, "does this explain
the written digit?", is now answered by the engine: the digit survives, or it doesn't. Results were identical.

### 5. A mistake in reading, corrected

The first run reported that right digits were **not** kept (0 of 1,000). That was the experiment misreading the engine,
not the engine. When a state repeats, the engine's run stops without recording the repeat, so moment 3 was missing
exactly when the right digit was held steady. The reading was corrected to count a repeated state as held. Nothing in
the engine changed.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | without the rule: the wrong digit still on in all 9,000; the right kept in all 1,000 | **Holds.** |
| 2 | with it: the wrong digit off in all 9,000, the right on; the right kept in all 1,000 | **Holds** (after the reading correction, 5 above). |
| 3 | completion stops with the rule, spreads without | **Holds:** 5 members held, against 43. |
| 4 | column addition with the engine judging: identical to C144 | **Holds.** |
| 5 | nothing else breaks | **Holds:** moves and recall as before; the rule on with the code's fit test also identical. |

## The ledger, after the run

**Given:** as C144, except that the units fit is now the engine's. Also given: the order of the judging protocol
(digits first, then the written digit, read the moment after); switching the rule on; comparing the carry with the
recalled tens (still in code). **The engine:** the new rule; completion and competition; recalling the facts; storing
and recalling the step; every move.

## What it suggests next

1. **The carry judged the same way.** The tens digit through the same protocol, so that both written cells are judged
   by the engine.
2. **Candidate B.** With facts, fit and competition all in the engine, the remaining crutch is the search. Candidate
   B (heat lowering the bar around a hot cell, with rival assemblies competing) can now be tried with the engine doing
   the judging.
3. **Place rivals elsewhere.** The rule is general. It may also answer C137's open question (a value with no rivals
   can't be replaced) and the side notes' types, since things that keep the same company but never meet are a type.
   Worth checking where it helps and where it gets in the way.

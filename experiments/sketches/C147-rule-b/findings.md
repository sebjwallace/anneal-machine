# C147 · Rule B: findings

Run: `node ruleb.js > out.txt` (about 25 seconds; [out.txt](out.txt) has the check, the first seed of each arm example
by example, and the full log of every seed that didn't reach 100%). Read [the hypothesis](hypothesis.md) first. Engine:
C146's copy, unchanged.

## In short

**Rule B works, with one change, and it shows nearest-first is credulous.** With the bar lowered by distance around the
heat and hypotheses judged eight at a time in lanes, column addition learned the right step in every seed, but one seed
first bound a wrong step and then jammed (**95%**). The cause is rule B itself: it stops lowering the bar at the first
explanation that accounts for a whole example, so a nearby coincidence never has to face the true explanation one step
further out. **After the first run (declared):** lowering the bar one more step before stopping fixed it. **100%**, the
same step at the same example as C145 in every seed.

**What rule B saves, and what it doesn't.** Judging in lanes cut the engine's runs about six-fold (28 per seed instead
of 158), because eight hypotheses are judged in one run. But the bar saved almost nothing in what had to be tried (152
hypotheses per seed instead of 158), because the true explanation is not the nearest one. Nearness alone is not a good
guide to where the answer is.

**The refined rule passed its check.** With company counted from the facts only, C145's judging was unchanged: 1,000 of
1,000 right digits kept, 9,000 of 9,000 wrong ones dropped.

## Results

| arm | 4 to 8 digits, right | seeds at 100% | learnt at example | hypotheses judged in training (per seed) | engine runs for judging (per seed) |
|---|---|---|---|---|---|
| C145 (C143's search, judged one at a time) | 100% | 20 of 20 | 1 / 1 / 2 | 158 | 158 |
| rule B | 95% | 19 of 20 | 1 / 1 / 2 | 96 | 17 |
| *after the first run:* **rule B, lowered one step further** | **100%** | **20 of 20** | 1 / 1 / 2 | 152 | **28** |

Every run of every arm that reached 100% stopped by itself after exactly the answer's digits.

How far the bar was lowered, over the 31 and 27 searched examples:

| | distance 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| rule B | 0 | 2 | 29 | 0 |
| rule B, one step further | 0 | 0 | 2 | 25 |

## What it shows

### 1. Nearest-first takes a coincidence for an explanation

Seed 17's first worked example was 19 + 22 = 41. At distance 2, before the bar reaches the carry row, one hypothesis
reads the answer digit to the right instead of the carry above. In the first column the cell to the right is empty,
so it reads 0, and 9 + 2 + 0 = 11 is right. In the second column the cell to the right holds the 1 just written, which
happens to equal the carry, so 2 + 1 + 1 = 4 is right too. It explains the whole example. Rule B stopped there, so the
true explanation at distance 3 was never opened, there was no tie to hold, and the near one was bound at once. The
next examples contradicted it, the true step was bound later, and the two jammed (the C139 problem again): 0% for that
seed.

C143's search didn't have this problem because it looked at every candidate and held the tie between the coincidence
and the true explanation until an example separated them. **Stopping at the first explanation makes the memory
credulous:** it trusts whatever fits first.

### 2. Looking one step further fixes it, at a cost

Lowering the bar once more after something explains everything means a near explanation has to face its rivals from
one step out. In seed 17 the true explanation was found alongside the coincidence, the tie was held, and the next
example settled it correctly. With that, rule B matches C145 exactly. But it costs most of what the bar saved: since the
true explanation is at distance 3, looking one further means reaching distance 4 in most examples, which is nearly
everything.

### 3. Lanes are where the saving is

Judging eight hypotheses in one run is what cut the engine's work: 28 runs per seed instead of 158. That is real
parallel judging, by the engine, of rival hypotheses, which is what C146 made possible.

### 4. What rule B has not done

Competition **between** lanes, choosing the winner, isn't here. Lanes are kept apart (that's what makes them work), and
choosing among explanations that all fit is still C139's held-open rule. Lowering the bar is triggered by the engine's
judgements (every open hypothesis failed and heat remains), but acting on that trigger, and the order of the bar by
distance, are the experiment's code. So rule B has moved **judging** into the engine and made it parallel, but not the
**generation** or the **choice**.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | the refined rule leaves C145 unchanged | **Holds:** 1,000 of 1,000; 9,000 of 9,000. |
| 2 | rule B learns the same step in every seed; 100% | **Fails:** the right step was bound in every seed in the end, but seed 17 first bound a coincidence and jammed (95%). |
| 3 | the bar stops at distance 3 in every searched example, never 4 | **Fails narrowly:** 29 at distance 3, 2 at distance 2 (the coincidences), none at 4. |
| 4 | at most half as many hypotheses judged as C145 | **Fails:** 96 against 158 (61%). The engine's runs were about a tenth, but that is the lanes, not the bar. |

The "one step further" arm was added after the first run and has no prior predictions.

## The ledger, after the run

**Given:** the lanes, the content cells and switching on selectors; the bar's order by distance; lowering it when every
open hypothesis has failed and heat remains (the trigger is the engine's, the act is the code's); stopping once
something explains everything (and, after the first run, one step later); the carry check; following each hypothesis's
heat; the held-open rule and the choice among explanations that fit. **The engine:** routing, completing the facts,
rivals from place, judging every hypothesis (eight at once); storing and recalling the step; every move.

## What it suggests next

1. **A better guide than distance.** Nearness found the answer only by reaching almost everything. What draws attention
   should come from what is already known. Here: places that held numbers in past explanations, or the shape of
   related steps. In the owner's terms, priming: warmth from structure already there lowering the bar where a fit is
   likely, rather than everywhere nearby.
2. **Competition between lanes for the choice.** Explanations that fit all compete, and the one with more support (more
   heat resolved, across more examples) wins, replacing the held-open rule.
3. **Repeated bindings still jam.** Seed 17 failed for the same reason as C139, C140 and C143: a wrong early binding is
   never outcompeted by later right ones. Fixing that is overdue, and it would have rescued this seed even without
   looking further.

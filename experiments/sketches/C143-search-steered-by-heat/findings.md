# C143 · A search steered by heat: findings

Run: `node heat.js > out.txt` (about a second; [out.txt](out.txt) has the first seed of every arm example by example,
and the full log of every seed that didn't reach 100%). Read [the hypothesis](hypothesis.md) first. Engine: C142's
copy, unchanged; the world, the step, the loop and the test are C142's.

## In short

**Steering the search by heat shrank it about 200 times, and the first version lost something on the way.** Looking
only where the heat is (explain the hot cell at the focus from cool cells nearby, cool what is explained, move to where
heat remains) needed **184 times fewer checks** than C142's exhaustive search, and learned the right step in every
seed. But in one seed it first settled on a wrong step, and the right one, bound later, then jammed with it (C139's
finding again): **95%** right, against C142's 100%.

**Two changes after the first run, declared.** The first (a place can't be written twice) didn't help, and the trace
showed why. The second did: **each explanation keeps its own heat, and counts only if it leaves none.** With that, the
results matched C142 exactly (**100%**, 20 of 20 seeds, every run stopping by itself), with **241 times fewer checks**
(680 per seed against 164,216).

**What it teaches for the engine's rules:** a hypothesis's cooling can't be shared with its rivals, and an explanation
is finished only when no heat is left.

## Results

| arm | 4 to 8 digits, right | seeds at 100% | stopped by itself, after exactly the answer's digits | learnt at example | checks in training (mean per seed) |
|---|---|---|---|---|---|
| exhaustive (C142, counted) | 100% | 20 of 20 | 4,000 of 4,000 | 1 / 1 / 2 | 164,216 |
| steered by heat | 95% at every length | 19 of 20 | 3,800 of 4,000 | 2 / 3 / 4 | 894 (184× fewer) |
| steered by heat, without carries | 17% → 1.3% (4 → 8 digits) | 0 of 20 | 123 of 4,000 | 2 / 2 / 3 | 564 |
| *after the first run:* a place written only once | 95% at every length | 19 of 20 | 3,800 of 4,000 | 2 / 3 / 4 | 912 |
| *after the first run:* **each explanation keeps its own heat, and must leave none** | **100%** | **20 of 20** | **4,000 of 4,000** | 1 / 1 / 2 | **680 (241× fewer)** |
| *after the first run:* the same, without carries | 17% → 1.3% | 0 of 20 | 123 of 4,000 | 2 / 2 / 3 | 1,023 |

Every arm except "without carries" ended with the right step bound (read the carry above and the two digits; units at
the focus; carry one left in the carry row; move left). "Keeps its own heat" settled at the same example as the
exhaustive search in 19 seeds, and one example later in the other. The limit was never reached in any arm.

## What it shows

### 1. Looking only where the heat is cuts the search by two orders of magnitude

The exhaustive search replays every possible step (63,360) on the whole sum. Steered by heat, the first column alone
narrows things to the read sets that explain its hot answer digit from cool cells nearby, about 220 checks, and each
later column only checks what is still standing. That is the main result for the owner's picture: **heat says where to
look, and that is most of the work.**

### 2. What went wrong first: shared cooling let a wrong explanation erase the evidence

Seed 7's first two worked examples (962 + 405, and 42 + 87) each had one carry, in the top column, so the carry's "1"
appears twice: in the carry row, and as the answer's leading digit, one column left. Two explanations fit: "the carry
is written in the carry row" (right) and "the carry is written in the answer row, one left" (wrong). In the first
version, a cell cooled as soon as **any** standing explanation explained it. So the wrong explanation cooled the
answer's leading digit; the focus then found no heat left to move to, and the example ended before anything could
show the wrong explanation was wrong (it would have written the carry where the leading digit needs to go). The two
were interchangeable on the examples, the held-open rule settled on the wrong one, and the right one, bound later,
jammed with it at recall.

The first change, "a place can't be written twice", couldn't help, because the clash it looks for happens at the very
column the example never reached.

### 3. What fixed it: each explanation keeps its own heat, and must leave none

In the second change, each candidate step is a hypothesis with its own record of what is hot and what is cool, and it
follows its own heat from column to column. It counts only if, when it can move no further, **no heat is left**. The
wrong explanation above cools the leading digit but leaves the carry row's "1" hot forever, so it is rejected. The
right one cools the carry-row cell, moves to the leading digit (still hot for it), explains it from the carry, and
leaves nothing. Ambiguity (several possible carry places) branches into separate hypotheses rather than being merged.

This is close to the theory's own language. **Heat that never settles is a misfit, and an explanation that leaves a
misfit isn't an explanation.** And rivals can't share their settling: what cools for one hypothesis is still a misfit
for another.

### 4. An honest note on what the second change is

"Each explanation keeps its own heat" means each candidate follows its own path, which makes it a replay, like C142's,
but **started locally** (only the read sets that explain the first hot cell, from cool cells, are ever tried) and
**pruned as heat moves**. The saving comes from starting where the heat is, not from avoiding replay. In the engine,
the same thing would look like rival assemblies each holding their own partial settling, competing until one settles
everything.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | steered by heat learns C142's step in every seed, settling at the first example with a carry | **Partly fails:** the right step was bound in every seed in the end, but seed 7 first bound a wrong one, and settling came later (median example 3, against 1). |
| 2 | test results identical to C142's (100%) | **Fails:** 95%; seed 7 jammed (two procedures bound, recall brings on both). |
| 3 | at least 50× fewer checks | **Holds:** 184×. |
| 4 | without carries: at most 10% right at 6 digits and above | **Holds:** 4.1%, 2.9%, 1.3%. |

The two changes after the first run have no prior predictions and are reported as exploration.

## The ledger, after the run

**Given:** as C142, with the exhaustive search replaced by the heat-steered one, whose rules are the experiment's:
the focus goes to the heat (so the units place is the focus, not learned); only cool cells explain; a carry is
explained by the sum that made it; explained cells cool; the focus moves to remaining heat; the same step must explain
every column; and, after the first run, each explanation keeps its own heat and counts only if it leaves none.

**The engine:** as C142: storing and recalling the step, and every move of the focus.

**So, plainly:** the crutch is much smaller (680 checks per seed instead of 164,216), but it is still a search in the
experiment's code. What changed is its shape, which is now the shape the engine's own version would need.

## What it suggests for the candidate energy rules

1. **Attention goes to heat, and only cool things explain hot ones.** This alone did most of the work.
2. **Rivals settle separately.** A partial settling belongs to one hypothesis, not to the space. In the engine: rival
   assemblies each holding their own partial fit.
3. **An explanation is finished only when no heat is left.** Leftover heat rejects a hypothesis; it doesn't just lower
   its score.
4. **Ambiguity branches.** Several ways to explain one hot cell become several hypotheses, held open, not merged.
5. **Repeated bindings still jam** (C139 to C143). A wrong early binding is never outcompeted by later right ones.
   Still open, and it bit here.

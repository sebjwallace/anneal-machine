# C148 · More structure wins: findings

Run: `node more.js > out.txt` (about 35 seconds; [out.txt](out.txt) has the probe, seed 17 example by example with and
without the change, and the summary). Read [the hypothesis](hypothesis.md) first. Engine: C147's copy plus one rule:
copies count in competition.

## In short

**The jam is fixed, and the right structure now outcompetes the wrong one, as the owner's principle says it should.**
Two changes together: every binding of the step uses the same cells (so binding the same step again forms exactly the
same structure again), and in competition, **the structure that exists more times wins** among rivals at the same
support. In the probe, a wrong step bound once, then the right one twice, now recalls the right step. Before, nothing
was ever recalled once both existed. Rule B's failed seed recovers: **100%**, 20 of 20 seeds, where it was 95%. Nothing
else changed: every seed made the same first binding at the same example as before.

**Neither change works alone.** With fresh members per binding (as before) the chains never meet and all run at once.
With the same cells but copies not counted, they meet and tie. Only together does the more confirmed structure win.

**Every prediction held.**

## Results

**Part 1, the probe** (the wrong step bound once, then the right step n times, recall from "+" alone):

| | right 0 times | 1 | 2 | 3 |
|---|---|---|---|---|
| as before (fresh members, copies not counted) | the wrong step | no answer | no answer | no answer |
| same cells only | the wrong step | no answer | no answer | no answer |
| **same cells, copies count** | the wrong step | no answer (a tie) | **the right step** | **the right step** |

**Part 2, rule B rerun:**

| arm | 4 to 8 digits, right | seeds at 100% | stopped by itself, after exactly the answer's digits |
|---|---|---|---|
| rule B, as C147 | 95% | 19 of 20 | 3,800 of 4,000 |
| **rule B, with the change** | **100%** | **20 of 20** | **4,000 of 4,000** |
| rule B one step further, as C147 | 100% | 20 of 20 | 4,000 of 4,000 |
| rule B one step further, with the change | 100% | 20 of 20 | 4,000 of 4,000 |

**Seed 17, with the change:** the coincidence was bound at example 1, as before; the right step at examples 3 and 5.
At example 6 the right step was recalled and fitted, cooling it with no search. At test, from "+" alone, the right step.

## What it shows

### 1. Being wrong is more structure, and it's outcompeted

The wrong step is still there, nothing was broken or erased (the owner's "nothing breaks"). The right step has simply
been bound more times, so there is more of it, and in competition more of the same structure wins. That is how the
owner described being wrong: you remember being wrong, and why, but what you know now outcompetes it. Reinforcement here
is exactly what he said it should be: not a strength on a bond, but more structure built up over repeated encounters.

### 2. Why it needed both changes

With fresh members, every binding started from its own "+" and nothing competed. With the same cells, the bindings
meet: the wrong and right chains both start from the one "+" and become rivals. But one opening's support doesn't know
how many copies of itself exist, so one wrong and three right still tied. Counting copies is what lets repetition
matter. It is also decision 009 applied to procedures: the same thing is the same cells everywhere, including a step
learned twice.

### 3. One right binding isn't enough to overturn one wrong one

With the wrong and the right bound once each, it's a tie and no answer. That seems right: one example against another
is a genuine tie, held open until more evidence comes. The second confirmation decides it.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | as before: no answer whenever both are bound; only wrong gives wrong | **Holds.** |
| 2 | same cells only: ties, no answer | **Holds.** |
| 3 | copies count: tie at 1, right at 2 or more | **Holds.** |
| 4 | rule B with the change: seed 17 recovers, 100% | **Holds.** |
| 5 | one step further with the change: unchanged, 100% | **Holds.** |
| 6 | every other seed the same as C147 | **Holds:** the same first binding at the same example in every seed. |

## The ledger, after the run

**Given:** as C147, plus one cell per part of the step (a declared choice of populations). **The engine:** as C147, plus
counting copies of the same structure in competition.

## What it suggests next

1. **Make copies count the default,** and the same cells for every learned structure, since it's decision 009 applied
   throughout. Then check the earlier experiments where the jam caused failures (C139's "×" seeds, C143's seed 7) also
   recover.
2. **Recall as confirmation.** Here only a binding after a search adds a copy. A recall that fits is also a confirmation;
   whether it should add structure (and how much it then hardens what is known) is open.
3. **Priming,** the better guide than distance that C147 pointed to.

# C151 · Settled and bound: findings

Run: `node learn.js > out.txt` (about sixteen minutes; [out.txt](out.txt) has the first seed of each arm example by
example, the steps learned, the test and the work). Read [the hypothesis](hypothesis.md) first. Engine: C150's copy,
unchanged; the changes are in `lanes.js`.

## In short

**The circuit now decides for itself when a candidate has explained an example, and binds it.** Cooling is a cell
switched on by an agreement gate. A misfit stops the lane's clock where it happens. "Settled" is a gate that opens only
when every cell of the working has cooled. A fixed binding rule ties a settled lane's step to "+" in a long-term store.
No code judges, chooses among ties or binds. What has been learned is simply whatever the store gives from "+",
with the structure bound most often winning (C148).

**It learned the right step in every seed, and the step added the long sums.** All 20 seeds' stores gave the right
step by the first or second example, and every later example was settled by recall, which bound it again. In C149's
circuit it was **100% right on 4 to 8 digits** (2,000 of 2,000), every run stopping by itself.

**Without carries, it now refuses to guess.** Both explanations C150 found (read the carry above, or the one to the
left) settle every carry-free example equally, so the store ties and gives **no step: 0% at test, in all 20 seeds**.
In C150 the same tie was broken quietly by distance, and happened to come out right. Here nothing chooses between
explanations the evidence can't tell apart, which is the honest answer.

**Every prediction held.**

## Results

| arm | the store gives | learnt at example | 4 to 8 digits, right | stopped by itself |
|---|---|---|---|---|
| **learn** | the right step, **20 of 20** | 1 / 1 / 2 | **100%** (2,000 of 2,000) | 2,000 of 2,000 |
| learn from sums without carries | **nothing** (a tie), 20 of 20 | never | 0% | – |

Seed 1, learn: example 1 (326 + 43) settled two lanes, the right step and a coincidence, each bound once, so the store
tied. Example 2 (91 + 248) settled only the right one, which now had two copies against one, so the store gave it.
Examples 3 to 6 were each settled by running the recalled step once.

Work in learning, per seed: 111 circuit runs (up to 8 lanes each) and 888 moments for **learn**; 512 runs and 3,898
moments without carries, where nothing is ever recalled, so every example is searched.

## What it shows

### 1. Explaining, deciding and remembering are now one process

A candidate runs; each write either agrees with the working and cools it, or doesn't and stops the lane; if every cell
of the working cools, the lane settles; a settled lane binds its step; the store recalls whichever step has been bound
most. Each of those is a cell or a gate or a fixed rule of the architecture, inside the engine's own moments. Compared
with C150, the experiment's code no longer reads off whether heat is left, no longer holds ties open, and no longer
binds the winner.

### 2. Repetition decides, as the owner's principle says

There is no held-open rule. A coincidence that fits one example is bound once; the true step, fitting every example, is
bound every time. After the first example that tells them apart, the true step has more structure and wins at recall.
Being confirmed again is just more of the same structure (C148), and recall itself confirms: the recalled step settling
the next example binds it once more.

### 3. When the evidence can't decide, it doesn't

Without carries, "the carry above" and "the carry to the left" are both always 0, so every example settles both, and
they keep the same count for ever. The store ties and gives nothing. That's the right behaviour for a memory that
mustn't guess (CON-10), and it makes plain what C150 hid: there, the tie was broken by the experiment's order of
candidates, not by anything in the examples.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | learn: the right step in every seed by the second or third example; later examples settled by recall | **Holds:** 20 of 20, by example 1 or 2. |
| 2 | learn: 100% at test, stopping by itself | **Holds:** 2,000 of 2,000. |
| 3 | without carries: a tie, no step, 0%, every seed | **Holds:** 20 of 20. |

## The ledger, after the run

**Given:** the encoder (worked examples written in full, and declaring their working as heat, as one Settled gate per
lane); the circuit's fixed architecture, including the agreement gates, the clock that stops on a misfit, the Settled
gate and the binding rule; proposing candidates (stages A and B, as C150); reading stage A's cooled units from the
engine's moments; moving the store's step into C149's circuit for the test. The title line of out.txt was corrected by
hand from C150's (the code's title string had been copied); nothing else in it was changed.

**The engine:** running every candidate over the worked example, cooling, stopping on a misfit, settling, binding into
the store, recalling from the store with copies counting, and running the recalled step on the test sums.

## What it suggests next

1. **Proposing candidates** is the main crutch left in learning. Priming (warmth from structure already there) is the
   candidate.
2. **Declared heat.** The encoder says which cells are the working. In the owner's picture, heat would be what nothing
   explains yet, found by the memory itself.
3. **A second procedure** on the same circuit, to see whether it's general.

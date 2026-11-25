# C158 · Only the parts it uses: findings

Run: two shards side by side (`SEEDS=4 SHARD=0/2 node learn.js` and `SHARD=1/2`, about fifty minutes on two cores),
then `SEEDS=4 REPORT=1 node learn.js > out.txt`. The `rows-*.json` files hold every seed. Read
[the hypothesis](hypothesis.md) first. Engine: C157's copy, unchanged. [smoke.js](smoke.js) was a build check run
before the main run. [probe.js](probe.js) ([its output](probe.txt)) was written after the run, to check one mechanism
directly in the store.

## In short

**The lean frame now stands on its own: the hold step comes back as one structure.** Left free to drop parts, the step
that holds the multiplier for a whole row was recalled without its useless pass-on, and in 3 of 4 seeds it was what the
store gave at the end. Bound into the circuit, it was **100% right on long-multiplication first rows** (and on
single-digit multiplication) in those seeds, the first time long rows have come out right at all. In C157 it was never
recalled once.

**But the store dropped a part that did matter, too.** The read step (the one that adds and subtracts) came back
**without** its pass-on in every seed, from the second example on, even after single-digit multiplications had
needed that pass-on. The probe shows why, and it isn't counting. When one frame is the other minus a part, the store
recalls the leaner one **whatever the counts**: lean bound once and full bound ten times still recalls the lean one.
The likely reason (read from how competition works, not traced step by step) is that every part of the lean frame is
also in the full one, so at the point where they differ, "move on now" is backed by both, and "pass the digit on
first" by only one. Agreement between explanations beats repetition.

**So minimality is already in the engine, and it's stronger than I thought.** It doesn't need a rule; competition
already prefers what more explanations share. But it doesn't stop at unused parts. It strips any part that only some
of the explanations have, even one that some examples need. Prediction 2 failed on exactly the risk the hypothesis
named.

**The rivalry is now visible, as predicted.** The store flips between the read step, the hold step, and nothing,
depending on what's been seen. At the end: the hold step in 3 seeds (long rows and "×" right, "+" and "−" wrong) and
nothing in 1. **No seed was right on all four kinds.**

## Results

What the store gave after each example (r = the read step, H = the hold step, both lean (no pass-on); - = nothing), and
how each example was settled (S = searched, P = replay, V = varied replay, R = recall):

| seed | + − × L L L + − × L L L (how settled) | store after each |
|---|---|---|
| 1 | S P P V P P P P P P P P | - r r r - - - r - - - - |
| 2 | S P P P V P P P P P R R | - r r r r - - r - H H H |
| 3 | S P P V P P P P P R R R | - r r r - - H - H H H H |
| 4 | S P P V P P P P P R R R | - r r r - - H - H H H H |

| at the end | test (over the 4 seeds) |
|---|---|
| the hold step, lean, in 3 seeds; nothing in 1 | long first rows **75%** (100% in the 3 hold seeds); "×" one digit 75% (likewise); "+" and "−" **0%** |

The probe of the store alone (the read step with and without its pass-on, bound different numbers of times):

| lean bound | full bound | the store recalls |
|---|---|---|
| 1 | 1 | lean |
| 1 | 3 | lean |
| 2 | 5 | lean |
| 1 | 10 | lean |

Work in learning, per seed: 4,664 circuit runs. Almost every example after the first was settled by replay. Recall
rarely held, because the store kept flipping.

## What it shows

1. **A lean frame can be recalled.** The obstacle from C157, one useless part splitting a step into tied versions, is
   gone. The hold step is a single structure, and when it's recalled, long first rows come out right.
2. **Competition already prefers the shared.** When two frames overlap and one is the other minus a part, what both
   agree on wins at the point they part ways, before repetition is even consulted. That's a real property of the
   engine, and a good one in principle: what more explanations share is what they abstract. But it means "the frame
   with the part explains more examples" never gets a say. Repetition only breaks ties between frames that support
   their parts equally.
3. **Two frames that can't replace each other are now both in the store, and nothing picks between them.** The store
   completes into one or the other according to what it has seen recently, and the other kind of sum fails. This is
   the problem the hypothesis set out to expose, and it's exposed.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | the hold step comes back as one structure without a pass-on, recalled when its copies lead | **Holds:** recalled in 3 of 4 seeds; long first rows 100% in those. |
| 2 | the read step keeps its pass-on | **Fails:** it loses it in every seed. The probe: the leaner frame wins whatever the counts. |
| 3 | the rivalry is visible; the store flips; no seed right on all four | **Holds:** it flips; 0 of 4. |
| 4 | the risk: the lean read step wins and single-digit multiplication breaks | **Happened** for the read step. Single-digit multiplication was only right at test because the hold step, which also does it, ended up recalled. |

## The ledger, after the run

**Given:** as C157, plus proposing every step with and without each of its last two writes. **The engine:** as C157.
**Disclosed:** 4 seeds, as agreed. They agree with each other in what matters (the lean hold step recalled once long
rows lead; the read step always lean; never all four kinds), so I didn't run more. The smoke check before the run and
the probe after it are described above.

## What it suggests next

1. **What picks the frame.** Two frames that can't replace each other, both in memory, and the right one depends on
   the sum in front of it. The owner's transition-memory picture is the natural place to start: a cue plus context
   decides which state it completes into. Here the context is on the page (a two-digit multiplier, the sign). The
   experiment is whether what's read at the start of a sum can decide which frame completes, without a built-in rule.
2. **Keeping a part that matters.** The lean-beats-full result means single-digit multiplication now depends on the
   hold step rather than the read step's pass-on. That's not wrong (holding is a fine way to multiply by one digit),
   but it shows that a part only some examples need can't survive in the same frame as examples that don't need it.
   Splitting by context (point 1) may settle this too: the frame for multiplying holds, the frame for adding reads.
3. Then the restart to the next row, and adding the rows.

# C157 · Holding a value: findings

Run: two shards side by side (`SEEDS=10 SHARD=0/2 node learn.js` and `SHARD=1/2`, about an hour and a half on two
cores), then `SEEDS=10 REPORT=1 node learn.js > out.txt`. The `rows-*.json` files hold every seed. Read
[the hypothesis](hypothesis.md) first. Engine: C156's copy, unchanged. [smoke.js](smoke.js) was a build check run
before the main run (three lane jobs on one long first row); it isn't part of the results.

## In short

**The long pages do pick the hold.** In 9 of 10 seeds, the first long-multiplication row failed recall and replay, as
in C156. It was then settled by **varied replay: the learned step with the multiplier held** instead of read every
column. In the tenth seed the first long row happened to be recalled by coincidence (equal multiplier digits), and the
hold was picked at the next one. No hold step ever settled an addition or a subtraction.

**But the store never once gave the hold step back.** At the end, 5 seeds gave the old read step (right on +, − and ×
one digit, wrong on long rows except by coincidence) and 5 gave nothing at all. **0 of 10 seeds were right on all four
kinds**, as predicted, but for a different reason than predicted. It isn't only that the hold step and the read step
are rivals. **The hold step can't even win among its own copies.** Once the multiplier is held, the step's pass-on
part does nothing: whatever it passes, wherever, the row still comes out right. So every long page settled the hold
step with all 45 pass-ons alike (84 variants in all, counting the two reading orders), each bound once. Nothing in any
example can tell them apart, so they tie for ever, and a tie gives nothing. The read step, by contrast, had its
pass-on pinned by the single-digit multiplications in C155, so it is one structure with all its copies together.

**So the first obstacle is that a step has to have every part, even parts it doesn't use.** A part that doesn't
matter splits the step into many equal variants, and the store can't recall any of them. The rivalry the hypothesis
expected (read step against hold step, decided by counts) is real, but it sits behind this one and never got the
chance to show.

## Results

| | result |
|---|---|
| first long row | settled by **varied replay with the multiplier held** in 9 of 10 seeds (seed 2: by a coincidental recall, then the hold at the next long row) |
| holds settling an addition or subtraction | **never** (every replay of the stored steps on "+" and "−" examples, where it happened, left the holds unsettled) |
| what the store gives, example by example | the read step, or nothing when the counts tie; **never a hold step**, in any seed, at any point |
| at the end | the read step in 5 seeds, nothing in 5 |
| test, over all seeds | long rows 3.5 to 5.5% (coincidences); "×" one digit, "+" and "−" each **50%** (100% in the 5 seeds with the read step, 0% in the 5 with nothing) |
| seeds right on all four kinds | **0 of 10** |

How each seed went (S = searched, P = replay, V = varied replay, R = recall; and what the store gave after each
example: r = the read step, - = nothing), for example seeds 1 and 3:

| seed | examples: + − × L L L + − × L L L | store after each |
|---|---|---|
| 1 | S P P **V** P R R R R P P P | - - r r r r r r r r r r |
| 3 | S P P **V** P P P R R P P P | - - r r r - r r r r r - |

The long rows after the first were settled by plain replay: the hold variants were now in the store, so replaying
them found them again, and every one of them was bound once more. That kept all the hold variants equal to each other.
The store's falling into ties (nothing recalled) after some long rows fits the hold variants drawing level with the
read step, though the run doesn't count copies directly.

Work in learning, per seed: 3,367 circuit runs. Varied replay cost about 1,500 candidates a seed, and search was never
needed after the first example.

## What it shows

1. **Holding a value works, and is found from its effect.** Holding the multiplier fixes exactly what broke in C156,
   and the learner found it by changing one part of a step it already had, the moment the page called for it.
2. **A part that does nothing can't be learned, and in this store it blocks recall.** That was harmless before
   only because some kind of example always pinned every part down: the single-digit multiplications pinned the
   pass-on in C155. With the multiplier held, nothing pins the pass-on, and the step dissolves into equal variants.
   C154's control showed the same thing with the sign place. The fix it points to isn't specific to holding: **a step
   should only need the parts it uses.** Trying the step without a part, and preferring the smaller step when both
   settle, would turn 45 variants into one.
3. **Behind that, two steps really are needed.** The hold step can't add and the read step can't do long rows, so even
   with one hold step in the store, it would rival the read step under the one cue, with counts deciding. That's the
   rivalry the hypothesis predicted, still waiting to be seen once the first obstacle is out of the way.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | long pages pick the hold, by varied replay; no search | **Holds:** 9 of 10 at the first long row, the tenth at the next. |
| 2 | the hold step fits single-digit multiplication too, but never an addition or subtraction | **Half tested:** never an addition or subtraction. Never tried on a single-digit multiplication, because those were all settled by recalling the read step. |
| 3 | the store can't give both; no seed right on all four; which wins flips with the counts | **Holds in outcome** (0 of 10). **Wrong in mechanism:** the hold step never won once, because its unused pass-on split it into equal variants. |
| 4 | the indication: two steps, each recalled in its own situation | Still the indication, but there's a first obstacle in front of it (above). |

## The ledger, after the run

**Given:** as C156, plus the hold architecture (pick-up at the start, the held value, gates into the slot) and varied
replay in the proposer. **The engine:** as C156, plus picking up, holding and using held values. **Disclosed:** the
smoke check above; nothing else changed between the hypothesis and the run.

## What it suggests next

1. **Steps with only the parts they use.** Let a candidate leave a part out (no pass-on, no sign write) and, when a
   smaller step settles as well as a bigger one, bind the smaller. This is "fewest parts that explain it", which is
   the contract's minimality goal applied to steps. It should turn the hold step into one structure that every long
   row binds again.
2. **Then the rivalry.** With a single hold step, the store will hold two steps that can't replace each other. What
   picks between them? The obvious candidate is what's on the page (here, a two-digit multiplier), recalling the
   step from "=" together with what's read, rather than from "=" alone. That's the state question in its plainest
   form, and I'd keep it open rather than build an answer in.
3. **Then the restart and the rows,** as before.

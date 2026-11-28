# C184 · Nothing undone: findings

Run: one seed at a time, `ARM='nothing undone (seed N' node heat.js > out-seedN.txt` (about fifteen to twenty minutes a
seed). Read [the hypothesis](hypothesis.md) first, written before the run. The first run, all three seeds in one process,
was stopped partway (`log-first-run.txt`, below).

## In short

**Keeping every change, with nothing undone, drifted. It was worse than C183.** The second row wasn't learned in any of
the three seeds (0 of 200 each; 3,220, 2,291 and 3,275 runs). Times one digit was learned in 2 of 3 seeds (79 and 12
runs), against 3 of 3 before, and seed 2 failed even that. This was the risk named before the run, novelty search's
divergence.

**How it drifted.** With nothing undone, each change moved the way of working on from wherever it had got to, even when
that change had made things worse. It climbed partway on most worked examples (5 to 7 places cooled at its furthest),
then wandered away from that, through hundreds of ways of working, each slightly different and none further on. In the
end every part with heat on it had used up its alternatives: the map rules out any way of working already tried on the
page, and residue made the rest slimy rocks. In times one digit (seed 2), the first change made things worse and the
right answer, one change from where it started, was never reached again, because it had wandered off.

**What it shows about the owner's picture.** The trouble a change causes didn't point at its partner reliably. The heat
went to whichever part was most heated relative to its convergence, usually the part just moved, which had no
convergence yet. So the next change was another move of the same part, not the partner. And with no way back, nothing
held the learner near the good place long enough for the partner to be found.

**So neither extreme works.** C183's "the best so far is a safe home" stuck in local optima. C184's "nothing is
undone" drifts away and never converges. The owner's own picture holds the middle: the basin fills with heat and pushes
you out. Nothing here made the best so far fill with heat. It was simply abandoned at once. The middle would be to go
back to the best so far unless its own heat has built up enough to push you out. That compares heat with heat, with no
totals.

## Results

| seed | times one digit (runs) | test | second row (runs) | test |
|---|---|---|---|---|
| 1 | 79 | 200 of 200 | 3,220 (stuck on all four) | 0 of 200 |
| 2 | 62 (stuck on both) | 0 of 200 | 2,291 (stuck on all four) | 0 of 200 |
| 3 | 12 | 200 of 200 | 3,275 (stuck on all four) | 0 of 200 |
| C183 (worse undone), for comparison | 11 to 12 | 200, 200, 200 | 154, 196, 307 | 200, 200, 0 |

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | times one digit within about 6 attempts | **Fails** in two seeds (79 runs; 62 runs and stuck). |
| 2 | the second row out of the local optimum more often than C183; at least 2 of 3 seeds | **Fails:** 0 of 3. |
| 3 | risks: drift; the coincidence; no better than C183 | **Drift came true**, and it was worse than C183. |

## Disclosed

- **The first run, all three seeds in one process, was stopped** during the second seed, because it would have been cut
  off by the time limit. Its seed 1 had given the second row in 3,769 runs and 17 of 200 at test (`log-first-run.txt`).
  The seeds were then run one at a time.
- **Running seeds separately changed their samples.** The random sample for residue is seeded per worked example by a
  counter that runs through the whole process. Alone, seed 1 gave 3,220 runs and 0 of 200, and seed 2 gave times one
  digit 62 runs and 0 of 200 (16 runs and 200 of 200 in the combined run). The separate runs are what's reported. The
  difference shows how sensitive drift is to small differences, which is itself a finding.

## The ledger

As C183, minus the undo. **The code's:** the reading rule, practising and blame.

## What it shows

Taking every change, with no way back, is divergence without convergence. The owner's hill-climb picture needs the
basin to fill with heat, not to be thrown away at the first worse step. Next: return to the best so far unless its heat
has built up past where you are. That's heat compared with heat, no totals, so the basin pushes you out only once it's
full.

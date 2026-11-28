# C180 · Heat that builds up (round two, step one): findings

Run: `node heat.js > out.txt` (about two and a half minutes). Read [the hypothesis](hypothesis.md) first. **It was written
after the run, so there were no predictions to hold this run to.**

## In short

**Heat that builds up works one try at a time, and it learned the right second row without being fooled by the
coincidence.** On times one digit it took 14 runs (C179: 14 for B, 15 for greedy). On the second row it took 341 runs in
all (C179's B: 226; greedy: 258), and the way of working it settled was the right one, 200 of 200 new second rows from
the start. Unlike greedy and B in C179, it never learned the coincidence: it got stuck short of settling instead, so
nothing wrong was kept.

**It got stuck twice where two parts had to move together.** On the first two worked examples it climbed to 7 and then 8
places cooled, one change at a time:

1. the answer write down a row;
2. the answer write down another row;
3. the carry write to the carries row;
4. the top read one place over.

Then it was stuck. The last step needed the answer write and the carry read moved together, and the fallback for
pairs (two of the twelve strongest alternatives) didn't include that pair. On the third example, moving the carry read
alone happened to cool one more place (6, from 5). So the heat reset, and then the answer write alone settled it. The
fourth example was recalled and settled first time.

**What the heat did well.** It went to the right parts: the writes first (where the work visibly wasn't done), then,
once a write landed on the working with a wrong digit, back to the reads that fed it. Every change it kept was a step
of the right way of working, in roughly the order greedy found them. It wasted fewer tries on the reads than greedy did,
because the reads only got hot once a wrong digit showed they were to blame.

## Results

| | times one digit (runs) | second row (runs) | second row test (200 new, from the start) |
|---|---|---|---|
| heat that builds up (C180) | 14 | 341 (stuck on examples 1 and 2; settled on 3; recalled on 4) | 200 of 200 |
| C179 · B, heat lowers the bar (rounds) | 14 | 226 (a coincidence first, corrected) | 200 of 200 |
| C179 · greedy | 15 | 258 (a coincidence first, corrected) | 200 of 200 |

## The ledger

As C179. The arm is the code's rule, now in the shape of heat dynamics:
- blame;
- heat that builds up and resets;
- reach that grows with heat;
- competition by heat less distance;
- one try at a time.

**Still the code's:** the heat levels, the tried marks, the ranking, the tie order, and the pairs fallback. **Disclosed:**
the hypothesis was written after the run.

## What it shows, and what's next

Heat that builds up on the parts that are to blame, spreading back from a wrong answer to what fed it, steers adapting
to the right parts with no rounds and no list of every change. Its weak spot is when two parts must move at once, which
greedy and B handled by trying pairs exhaustively. The next step is to move the heat into the memory's own structure:
heat as copies formed when work is left undone, the reach and the competition done by the engine. That would also give a
principled answer to pairs: two parts that are both hot pulling at once.

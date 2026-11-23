# C128 · No search limits: findings

Run: `node limits.js <folder> <book> 8` (a few seconds a book; everything is in [out.txt](out.txt)). Read
[the hypothesis](hypothesis.md) first. The "C127 as it was" rows reproduce C127's final figures exactly.

## In short

**It survives: the limits only saved time.** With every candidate partner considered and no depth limit, energy rises
by 0.2% on both books, and every reading measure is the same or a point better.

| | *Buster*: limits | no limits | *Alice*: limits | no limits |
|---|---|---|---|---|
| energy = memory + unseen | 9,051 | 9,070 | 13,802 | 13,832 |
| different patterns held | 1,094 | 1,104 | 1,387 | 1,395 |
| letters loose on unseen text | 10% | 9% | 8% | 8% |
| words read whole | 43% | 44% | 51% | 52% |
| cuts at a word boundary | 54% | 55% | 56% | 56% |
| clean pieces | 34% | 35% | 34% | 35% |

Learning still takes about a second a book: the limits weren't even needed for speed at this scale.

## What it means

V7 is removed. The search no longer has numbers chosen by the experimenter. What remains of the partner choice is
still given by the layer (V5: a three-letter index over memory, and the longest shared run), and that is a later step.

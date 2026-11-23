# C134 · Count from what is active: findings

Run: `node count.js <folder> <book> 8` (under half a minute a book; everything is in [out.txt](out.txt)). Read
[the hypothesis](hypothesis.md) first. The first rows of each book reproduce C133's final setting. `check/check.sh`
still gives the same output as the Go engine (1,113 lines).

## In short

**The index can go.** Counting only what is in front of the machine, the two wholes being compared and the held chains
this reading saw running over the letters, gives slightly *lower* neutral energy than the count over all of memory:
−0.7% on *Buster Brown* and −0.2% on *Alice*. Reading is two points better on *Buster* and two points lower for whole
words on *Alice*, with cuts a point better.

| | *Buster*: index | **active** | *Alice*: index | **active** |
|---|---|---|---|---|
| neutral energy, whole book | 43,842 | **43,528** | 75,478 | **75,337** |
| memory + describing | 4,660 + 39,182 | 4,696 + 38,833 | 5,435 + 70,042 | 5,582 + 69,755 |
| letters loose on unseen text | 8% | 7% | 7% | 7% |
| words read whole | 43% | 45% | 50% | 48% |
| cuts at a word boundary | 55% | 56% | 55% | 56% |
| "the" read inside a piece | 100% | 98% | 99% | 100% |

## What it means

**V4 is removed.** The energy rule judges a new piece by the evidence present when it is formed: the comparison
itself and what reading has just brought up. Nothing searches memory. Contrary to the prediction, this doesn't make
fewer pieces pay: the count is smaller, but pieces that matter are present in the sentence when they're judged.

## Against the prediction

Neutral energy within 2% and reading within 3 points: **yes** (−0.7%, −0.2%; reading +2 to −2). **Survives.**

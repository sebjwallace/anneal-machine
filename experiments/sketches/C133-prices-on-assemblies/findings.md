# C133 · Prices on assemblies: findings

Run: `node prices.js <folder> <book> 8` (under half a minute a book; everything is in [out.txt](out.txt)). Read
[the hypothesis](hypothesis.md) first. The first rows of each book reproduce C132's final setting (no floor, uses from
reading). `check/check.sh` still gives the same output as the Go engine (1,113 lines).

## In short

**The table can go.** Each piece's uses counted on its own state, each letter's on its own population, and the whole
taken from the engine's own clock: on the neutral yardstick, energy over the whole book is within half a percent of
the table's (−0.4% on *Buster Brown*, +0.5% on *Alice*). Memory is smaller (4,660 and 5,435 against 5,760 and 7,965),
and describing the text costs a little more. Reading is two points better on *Buster* and three worse on *Alice*.

| | *Buster*: table | **own evidence** | *Alice*: table | **own evidence** |
|---|---|---|---|---|
| neutral energy, whole book | 44,023 | **43,842** | 75,116 | **75,478** |
| memory + describing | 5,760 + 38,263 | 4,660 + 39,182 | 7,965 + 67,151 | 5,435 + 70,042 |
| assemblies | 3,173 | 2,587 | 4,597 | 3,116 |
| letters loose on unseen text | 9% | 8% | 8% | 7% |
| words read whole | 41% | 43% | 53% | 50% |
| cuts at a word boundary | 54% | 55% | 58% | 55% |
| "the" read inside a piece | 96% | 100% | 100% | 99% |

Each learner's own energy is also printed in [out.txt](out.txt), but it is in its own units and not compared. The
neutral yardstick agrees with the table learner's own energy to within 0.5%, which is a check that it measures the
same thing.

## What it means

**V3 is removed.** Prices now come from evidence each thing keeps for itself, plus the clock the engine already keeps.
That is the form the contract asks for: counted per memory, never pooled, and nothing worked over centrally.

**What changed in the learning.** Against the clock, a piece read once in a long stretch of letters is dearer than it
was against the total of uses, which counts units rather than letters. So fewer pieces are worth forming: 18% to 32%
fewer assemblies. *Alice* loses three points of whole words and cuts. *Buster* gains two. On the neutral yardstick the
two even out.

**The yardstick from now on** is the neutral one: memory and the whole book's description, each unit costed by how
often it occurs there. It can compare learners that price differently, which the remaining steps need.

## Against the prediction

Neutral energy within 2% and reading within 3 points on both books: **yes** (−0.4%, +0.5%; reading +2 to −3).
**Survives.**

# C132 · Uses from reading: findings

Run: `node uses.js <folder> <book> 8` (about half a minute a book; everything is in [out.txt](out.txt)). Read
[the hypothesis](hypothesis.md) first. The first two rows of each book reproduce C131 exactly. `check/check.sh` still
gives the same output as the Go engine (1,113 lines).

## In short

**The floor can go.** The collapse without it came from counting anneal's reuse of common pairs as uses. Counting uses
only when a piece is read removes the collapse. Without any floor, energy over the whole book is within 1% of C131
with the floor (+0.4% on *Buster Brown*, −0.6% on *Alice*). *Alice* reads better than before (words whole 53% against
50%), *Buster* a little worse (41% against 43%). The floor still helps by about 1%: with uses from reading and the floor
kept, both books read better than at any point so far (*Alice*: 55% of words whole, 59% of cuts at word gaps). But
the floor is a number nobody chose, and the 1% is recorded as what it was doing.

**Energy over the whole book is the right yardstick.** It ranks the four settings exactly as the reading measures do
on both books. The tenth-only figure ranked them almost backwards.

| | *Buster*: C131 3+ | C131 2+ | reading uses, 3+ | **reading uses, 2+** | *Alice*: C131 3+ | C131 2+ | reading uses, 3+ | **reading uses, 2+** |
|---|---|---|---|---|---|---|---|---|
| energy over the whole book | 43,972 | 46,170 | 43,570 | **44,129** | 75,781 | 83,468 | 74,329 | **75,341** |
| memory | 4,783 | 2,846 | 5,810 | **5,468** | 6,348 | 2,709 | 7,954 | **7,609** |
| describing every sentence | 39,189 | 43,323 | 37,760 | **38,661** | 69,432 | 80,758 | 66,375 | **67,731** |
| energy, tenth only (old) | 9,023 | 7,415 | 9,907 | 9,670 | 14,090 | 11,539 | 15,434 | 15,252 |
| letters loose on unseen text | 10% | 10% | 9% | **9%** | 8% | 12% | 7% | **8%** |
| words read whole | 43% | 37% | 45% | **41%** | 50% | 24% | 55% | **53%** |
| cuts at a word boundary | 55% | 48% | 57% | **54%** | 56% | 41% | 59% | **58%** |
| "the" read inside a piece | 96% | 98% | 98% | **96%** | 100% | 2% | 100% | **100%** |

## What it means

**A use is a piece explaining the input.** Since C125, anneal forming or reusing a piece also counted as a use. That
let structure-building inflate the familiarity of whatever anneal touched most, which with short partners meant common
pairs. Counting only reading is simpler, one rule fewer, and it removes the need for the floor.

**V13 is removed.** The partner is the held chain that ran furthest along the stretch as it was read, sharing two
letters or more, with no floor. Energy over the whole book is within 1% of the floored version.

**What the floor was still doing (about 1%).** With uses from reading, annealing on a two-letter overlap still makes
memory slightly worse overall: more assemblies (3,173 against 2,989 on *Buster*) and slightly worse reading. Two-letter
overlaps are mostly coincidences between words. Whether the energy rule should see that, and how, is a smaller open
question. It's no reason to keep a floor.

**The yardstick from now on.** Energy over the whole book: memory, plus describing everything received with the final
memory. The tenth-only figure stays in the output for comparison, but it is no longer used to judge. C126 to C131
were judged partly on it. Their reading measures stand, but their energy comparisons should be read with this in mind.

## Against the predictions

1. Without the floor, within 2% of C131 with it: **yes** (+0.4%, −0.6%).
2. Energy over the whole book ranks the settings as reading does: **yes**, on both books.

**Survives**: the floor is removed, and with it a rule (the anneal credit).

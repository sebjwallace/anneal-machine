# C131 · Partner from reading: findings

Run: `node partner.js <folder> <book> 8` (under half a minute a book; everything is in [out.txt](out.txt)). Read
[the hypothesis](hypothesis.md) first. The first rows of each book reproduce C130 exactly. `check/check.sh` still gives
the same output as the Go engine (1,113 lines).

## In short

**The partner can come from reading, and the index isn't needed. But the result rests on a threshold nobody chose,
and this step found it.** Taken from reading as predicted, with any run of two letters or more, the partner made the
learning much worse. On *Alice*, words read whole fell from 51% to 24% and "the" was read inside a piece 2% of the time.
Comparing the partners each method picked showed why. The old index was built on three-letter runs, so it never
offered a partner sharing fewer than three letters in a row: a floor of three, hidden in how the index was built.
Reading accepts two, so it anneals on overlaps like "he" and "an". With the same floor of three, the partner from
reading matches the index on both books.

| | *Buster*: index | reading, 2+ | reading, 3+ | *Alice*: index | reading, 2+ | reading, 3+ |
|---|---|---|---|---|---|---|
| energy | 9,068 | 7,415 | 9,023 | 14,097 | 11,539 | 14,090 |
| memory + unseen | 4,884 + 4,183 | 2,846 + 4,569 | 4,783 + 4,240 | 6,384 + 7,713 | 2,709 + 8,830 | 6,348 + 7,742 |
| unseen cost per letter | 0.666 | 0.727 | 0.675 | 0.666 | 0.763 | 0.669 |
| letters loose on unseen text | 9% | 10% | 10% | 8% | 12% | 8% |
| words read whole | 44% | 37% | 43% | 51% | 24% | 50% |
| cuts at a word boundary | 55% | 48% | 55% | 56% | 41% | 56% |
| "the" read inside a piece | 98% | 98% | 96% | 100% | 2% | 100% |
| clean pieces | 35% | 24% | 33% | 35% | 13% | 34% |

## What it means

**V5's index is removed; the partner comes from what reading brought up.** With the floor of three, energy is within
0.5% and every reading measure within 2 points of C130.

**A new violation, V13: the floor of three letters.** It came into the learning in C118 with the three-letter index,
which was meant only to make the search fast. Since then every result has depended on it, and nobody chose it. It is a
number not taken from the world (CTR-2 DEF-5), and it has to go. What should replace it is the open question. Annealing
on a two-letter overlap cuts a stretch at common pairs and leaves fragments that the energy rule then keeps, so
something in the rule isn't pricing those cuts properly.

**The yardstick misled.** By energy alone, the two-letter version is the best of the three: 7,415 and 11,539, against
about 9,000 and 14,000. Yet it reads far worse. Its memory is smaller because it learns less, and the unseen tenth is
too small a share of the book for its worse reading to outweigh that. Energy as measured here (memory plus the cost of
a tenth) can prefer learning less. Until that balance is understood, energy can't be judged alone: the reading
measures have to be read beside it.

## Against the prediction

The same partners as the index: **no, not as predicted**. They match only with the index's hidden floor applied.
**Partly survives**: the index is removed, but the step exposed V13, and V5 isn't finished until V13 is.

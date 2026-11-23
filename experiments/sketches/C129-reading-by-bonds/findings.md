# C129 · Reading by bonds: findings

Run: `node bonds.js <folder> <book> 8` (a few seconds a book; everything is in [out.txt](out.txt)). Read
[the hypothesis](hypothesis.md) first. The first rows of each book reproduce C128 exactly. `check/check.sh` still gives
the same output as the Go engine (1,113 lines): the new reading adds to the engine copy and changes nothing else.

## In short

**The index isn't needed.** Reading by the chains' own bonds, as letters arrive, finds the same pieces in the same
places. Choosing by the cheapest description of the sentence, it reads exactly as the index did on both books. Energy
is within 0.1% on *Buster Brown* and 1.9% on *Alice*, all of it on the memory side. The engine's own competition,
choosing without any calculation, comes close: within 0.3% on *Buster* and 5% on *Alice*, where words read whole fall
from 52% to 47%.

| | *Buster*: index | bonds, settle | bonds, compete | *Alice*: index | bonds, settle | bonds, compete |
|---|---|---|---|---|---|---|
| energy | 9,070 | 9,068 | 9,097 | 13,832 | 14,097 | 14,572 |
| memory + unseen | 4,887 + 4,183 | 4,884 + 4,183 | 4,903 + 4,194 | 6,103 + 7,729 | 6,384 + 7,713 | 6,783 + 7,789 |
| letters loose on unseen text | 9% | 9% | 10% | 8% | 8% | 9% |
| words read whole | 44% | 44% | 43% | 52% | 51% | 47% |
| cuts at a word boundary | 55% | 55% | 54% | 56% | 56% | 54% |
| "the" read inside a piece | 98% | 98% | 87% | 100% | 100% | 99% |
| different patterns held | 1,104 | 1,103 | 1,117 | 1,395 | 1,447 | 1,553 |
| stored again (repeats) | 0 | 7 | 8 | 0 | 7 | 8 |

## What it means

**V1, V2 and V6 are removed as far as finding the pieces goes.** Which pieces fit where now comes from the engine's
own structure: members, the chains they belong to, and each chain's own evidence that its steps came in order. There's
no index, no lookup by text, and no search over what is held. Seen again comes from the reading's own completions.

**What remains is the choice between overlapping pieces.** With settle, the choice is the energy rule. But it is still
computed as a calculation over the sentence's completions, the cheapest path through them, not by gates. With the
engine's competition there is no calculation at all, and it costs 0.3% to 5% in energy. On *Alice* the loss is
visible: about one word in ten that settle reads whole, competition doesn't. On *Buster*, "the" falls from 98% to 87%
read inside a piece. Competition picks the piece that saves most where pieces overlap, which isn't always the set that
saves most in total. That is the same gap C112 and C116 found, now much smaller, because the pieces themselves are
better.

**A few stretches are stored again** (7 and 8 on each book, against 0 with the index). Completions only find a held
piece when its chain runs in full over exactly the stretch. A held text whose state lacks a full chain over the same
members isn't found. That's a small, real difference, and it shows in *Alice*'s memory being about 5% bigger under
settle.

## Against the prediction

1. settle within 2% or 2 points of the index on both books: **yes** (energy +0.0% and +1.9%; reading identical or a
   point lower).
2. compete worse by a few points: **yes** (energy +0.3% and +5.4%; words whole −1 and −5 points).

**Survives**: reading needs no index. The choice between overlapping pieces is the last part of reading to distil:
from the cheapest path to the engine's competition, which currently costs up to 5%.

# C130 · Support carried: findings

Run: `node carried.js <folder> <book> 8` (a few seconds a book; everything is in [out.txt](out.txt)). Read
[the hypothesis](hypothesis.md) first. The first two rows of each book reproduce C129 exactly. `check/check.sh` still
gives the same output as the Go engine (1,113 lines).

## In short

**The engine's competition reaches the cheapest description once support is in the currency and carried.** Reading
by bonds and choosing by competition with carried support gives exactly the same figures as the computed cheapest
description, on both books: the same energy (9,068 and 14,097), the same pieces held, and every reading measure the
same. Four ties were held over each whole run, and each left one letter loose.

| | *Buster*: settle | compete once | **carry** | *Alice*: settle | compete once | **carry** |
|---|---|---|---|---|---|---|
| energy | 9,068 | 9,097 | **9,068** | 14,097 | 14,572 | **14,097** |
| letters loose on unseen text | 9% | 10% | **9%** | 8% | 9% | **8%** |
| words read whole | 44% | 43% | **44%** | 51% | 47% | **51%** |
| cuts at a word boundary | 55% | 54% | **55%** | 56% | 54% | **56%** |
| "the" read inside a piece | 98% | 87% | **98%** | 100% | 99% | **100%** |

## What it means

**The gap in C129 was what support measured, not competition.** Competing once over the whole sentence, a piece is
judged by what it saves on its own. Competing as the letters arrive, a way of reading is judged by what it saves
together with everything it continues. So a long piece can't beat two short ones that together save more, because by
the time they compete the two short ones already carry their combined saving.

**An honest note on what this is.** Carrying the best so far, moment by moment, is the standard way of finding a
cheapest path. That's why the figures match settle exactly: it is the same choice, reached forwards instead of all at
once. What changes is where the work happens. There's no calculation over the sentence after the fact. Each moment,
only the pieces that just completed compete, and each continues a winner already held in the state. The engine's
competition rule is untouched.

**What changed in the engine's rule is support.** The engine's support is currently counted minus missing. Here it is
the saving, in the currency, carried from what a way continues. That is a real change to the engine, and the owner's
to accept or not. The case for it: the contract wants one currency (CTR-1 CON-2) and thresholds from prices (CAP-6),
and counted minus missing is neither. C122 also found that counted minus missing favours short transitions. The case
to weigh against it: support becomes a number carried through moments, so it must be counted per way of reading (per
memory), never pooled in a cell (CON-9).

## Against the prediction

Carry within 1% or 1 point of settle on both books: **yes, exactly equal.** **Survives**: the choice between
overlapping pieces needs no calculation, only competition with support in the currency, carried.

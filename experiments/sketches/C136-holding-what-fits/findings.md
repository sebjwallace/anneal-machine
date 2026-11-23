# C136 · Holding what fits: findings

Run: `node fits.js <folder> <book> [sentences|paragraphs|all] 8` (under half a minute a run; everything is in
[out.txt](out.txt)). Read [the hypothesis](hypothesis.md) first. The "wraps round" rows reproduce C135 exactly.
`check/check.sh` still gives the same output as the Go engine (1,113 lines).

## In short

**It survives, and the engine copy no longer departs from the engine here.** Only 4 to 9 hot stretches per book are
too long to hold in one go: mostly whole sentences or paragraphs read early, before much is held. Holding them as
consecutive parts that fit moves neutral energy over the whole book by 0.3% to 1.1%, and reading by at most 2 points
(paragraphs on *Buster Brown* read 5 points more words whole).

| | *Buster*: sentences, wrap | fits | paragraphs, wrap | fits | *Alice*: sentences, wrap | fits | paragraphs, wrap | fits |
|---|---|---|---|---|---|---|---|---|
| stretches held in parts | 0 | 4 | 0 | 9 | 0 | 5 | 0 | 7 |
| neutral energy | 43,528 | 43,996 | 43,832 | 44,119 | 75,337 | 75,894 | 74,946 | 75,138 |
| change | | +1.1% | | +0.7% | | +0.7% | | +0.3% |
| words read whole | 45% | 43% | 38% | 43% | 48% | 47% | 48% | 48% |
| cuts at a word boundary | 56% | 55% | 55% | 56% | 56% | 54% | 57% | 57% |

## What it means

**V11 is removed, provisionally.** The learning holds only what the engine can hold, under the engine's own rule, and
the copy now refuses as the engine does. Recorded as decision 011: the cut is the engine's limit, not a chosen number,
and it follows whatever rule settles how individuals become members.

**Encoders and populations have to fit.** With small populations, an encoder producing long buffers has its first
stretches held in parts. That is harmless here because it only happens before much is learnt. An encoder for a
different signal might produce buffers where it matters more.

## Against the prediction

Neutral energy within 2% with both encoders on both books: **yes** (+0.3% to +1.1%). **Survives.**

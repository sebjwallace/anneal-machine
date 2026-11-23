# C135 · Encoders: findings

Run: `node learn.js <folder> <book> [sentences|paragraphs|windows60|all] 8` (under half a minute an encoder; everything
is in [out.txt](out.txt)). Read [the hypothesis](hypothesis.md) first. The sentence rows reproduce C134's final figures
exactly. `check/check.sh` still gives the same output as the Go engine (1,113 lines).

## In short

**The learning doesn't depend on the encoder.** Fed a sentence at a time or a paragraph at a time, neutral energy over
the whole book is within 1% (*Buster Brown* +0.7% for paragraphs, *Alice* −0.5%). Fed windows of 60 letters cut
wherever they fall, it still learns, and costs about 5% more, as a careless cut should.

| | *Buster*: sentences | paragraphs | windows of 60 | *Alice*: sentences | paragraphs | windows of 60 |
|---|---|---|---|---|---|---|
| buffers | 1,044 | 266 | 1,064 | 2,066 | 808 | 1,795 |
| neutral energy, whole book | 43,528 | 43,832 | 45,905 | 75,337 | 74,946 | 79,387 |
| memory + describing | 4,696 + 38,833 | 6,125 + 37,707 | 4,572 + 41,334 | 5,582 + 69,755 | 7,436 + 67,510 | 5,262 + 74,125 |
| letters loose on unseen text | 7% | 7% | 9% | 7% | 7% | 9% |
| words read whole | 45% | 38% | 43% | 48% | 48% | 47% |
| cuts at a word boundary | 56% | 55% | 55% | 56% | 57% | 54% |

The reading measures are taken on the last tenth of the buffers, which is not quite the same text for each encoder.
Neutral energy covers the whole book and compares them fairly.

## What it means

**V9 and V10 are the encoder's choices, not violations.** How a signal is cut into buffers, and which populations it
feeds, are decided at the boundary, declared, and kept out of the learning. The learning takes whatever populations and
buffers it is given.

**Paragraphs hold more and describe more cheaply.** Bigger buffers give anneal more to compare at once, so memory grows
(by about a third) and the text costs less to describe. On *Alice* that nets out slightly better than sentences, on
*Buster* slightly worse. For the language experiments, sentences stay the default: the smallest buffer that does as
well.

**One thing an encoder must agree with the engine on: size.** A paragraph held whole as raw experience can need many
more members of a letter than a population of 8 has. The engine copy wraps round; the real engine refuses (V11). So an
encoder and the populations it feeds have to fit each other. That is the next part of step 7.

## Against the prediction

Sentences and paragraphs within 3%: **yes** (within 1%). Windows a few percent worse: **yes** (5%). **Survives.**

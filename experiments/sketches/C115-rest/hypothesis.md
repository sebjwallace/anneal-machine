# C115 · Rest: hypothesis

Written before running. Follows [C114](../C114-differentiation/).

## The question

In C114 each new utterance was compared with what memory held, but held pieces were never compared **with each
other**. The old picture engine did its best work at rest, comparing what it held with itself
(decompose, compose, re-describe). C114's errors were small slips at the edges of pieces (`tthing`, `denyi`,
`edthehatter`), the kind a comparison between two held pieces could split away (`tthing` against `nothing`).

**Does a rest phase, in which held pieces are compared with each other in the same way, make the pieces cleaner and
cover more of the text?**

## The mechanism

Exactly C114, plus **rest**: after every R utterances the input pauses, and each piece formed since the last rest is
compared with the other held pieces, as an utterance is (the held piece sharing the longest run of letters in order,
among those sharing three-letter runs with it; form the shared run and what varies before and after it; go on with
what is left). A piece isn't compared with itself. Nothing is edited: what rest finds forms beside what is there.

R = 100 and 400 (how often it rests), against no rest (C114 as it was). N = 16384 (C114's better coverage). *Buster
Brown* and *Alice*, with and without spaces. The same measures as C114.

## Predictions

1. **Cleaner pieces**: the share of pieces read with both edges at word boundaries rises by a few points (without
   spaces, from about 70% to about 75 to 80%).
2. **More coverage**: rest forms shorter, word-sized pieces (`thing` from `tthing` and `nothing`), so more of the text
   is read into pieces.
3. **The catch**: reading takes the cheapest description, and `[tthing]` (one use) is cheaper than `t` + `[thing]` (a
   letter and a use). So a slip already held may go on being read even once the clean piece exists. If so, the clean
   share rises less than coverage does.
4. **How often it rests barely matters** (R = 100 and 400 about the same).
5. **The risk**: comparing pieces with pieces finds overlaps that aren't words (odd shared runs between two long
   phrases), which would lower the clean share.

## Success and failure

- **Success:** without spaces, the clean share rises and coverage rises, on both books, at both R.
- **Failure:** the clean share falls (rest makes fragments), or nothing changes.

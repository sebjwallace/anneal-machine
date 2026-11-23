# C107 · A piece feels its own price: hypothesis

Written before running. Follows [C106](../C106-price-decides-the-cut/).

## The question

C106 kept a piece only if the **total** energy of everything fell: bookkeeping over the whole buffer and every piece,
which breaks cells first (CON-19) and sparse, event-driven computation (CON-18). On a buffer of a few hundred
characters the cuts were mostly sensible.

Can the same decision be made **locally**: by each piece, from what it holds itself? A piece knows its own body (how
many letters and which pieces it is built from) and can count its own uses. Counting that comes from the structure
itself is allowed. The local check is:

> a piece pays if spelling it out at every use would cost more than storing it once and pointing to it at every use:
> **k · body > body + k · use**

where k is its uses, body is what its body costs, and use is what one pointer to it costs.

**What the local check cannot see:** in the docs pricing a use costs 1 plus naming which piece, log2(pieces) /
log2(alphabet), so every new piece makes **every other** piece's uses a little dearer to name. That cost lands on
other pieces. A local check sees at most its own naming cost.

## What is compared

| | when a piece forms | what it checks | which goes first |
|---|---|---|---|
| **G** global (C106 main) | at rest, over the buffer | the total energy falls | the biggest fall in the total |
| **L** local, plain | at rest, over the buffer | k · body > body + k, a use costing 1 | the biggest saving of its own |
| **L+n** local, with naming | at rest, over the buffer | the same, a use costing 1 + log2(pieces) / log2(alphabet) | the biggest saving of its own |
| **S** local, as it streams | the moment it first pays, character by character | as L+n | whichever pays first |

L and L+n still pick the biggest saving among the candidates that pass: candidates compete, which is local to rivals,
but it is a comparison across them (stated as a given). S has no comparison at all: it reads the buffer a character at
a time, reads the tail with the pieces held, tallies every run that ends at the tail, and forms a piece the moment its
own check passes. S is also a first look at the question asked after C106: whether this can stream.

Unpack is local in all of them: a piece whose own check no longer passes (its uses taken by a longer piece) goes back
into the text, if no other piece is built from it.

Everything else as in C106: letters and `_`, pieces never edited, alphabet from the buffer, greedy. The tally of every
run in the text is still a table over the buffer: a given. Only **the decision** is made local here.

## Measures

- The pieces each forms, set against G's: how many are the same.
- The total energy each ends at, worked out afterwards (for comparison only; L, L+n and S never use it).
- The pieces a reader wouldn't recognise (cuts inside a word, like `cat_sa`, or fragments like `_wo`).

## Texts

The three from C106: two sentences, the reader, the prose.

## Predictions

1. **L+n matches G almost exactly**: the same pieces, give or take one or two. What it can't see (the naming cost put
   on others) is small while there are few pieces.
2. **L forms more pieces than G**: with naming free, short pieces like `th`, `at` and `er` pass. Its total energy ends
   a little higher than G's.
3. **S is worse than both**: forming at the first moment a piece pays means deciding on little text, so it makes the
   small-buffer cuts C106 found (inside words, at coincidences like "sa" from "sat" and "saw"), and they lock in. On
   the prose it ends at a clearly higher total than G.
4. In every setting, **no sentence is stored**.

## What would count as success, and failure

- **Success:** L+n gives G's pieces (within one or two). Then the decision doesn't need the total; the remaining
  non-local parts are the tally of runs and the naming cost on others.
- **Failure:** L+n's pieces differ from G's in a way a reader would call worse (more fragments, more cuts inside words).
  Then what lands on others matters, and a local rule needs some way to feel it.

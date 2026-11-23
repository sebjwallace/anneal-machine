# C109 · The better cut wins: hypothesis

Written before running. Follows [C106](../C106-price-decides-the-cut/), [C107](../C107-a-piece-feels-its-own-price/)
and [C108](../C108-a-population-of-fixed-size/).

## The question

All three earlier sketches met the same failure: a cut made on too little evidence stays, because pieces are never
edited and later text is read with the pieces already held. In C106 the reader in small buffers formed `cat_sa` and
`t_on_the_` (from "sat" and "saw" sharing "sa"), and "the zebra sat on the mat" was read as `the_zebra_sa[t_on_the_]mat`.

Can a better piece form **beside** a bad one, and win by being chosen, without anything being edited or broken? This
is the owner's "outcompeted, not broken": a mistake gets fewer uses and drops out to stored, still there but out of the
way.

## The mechanism (the givens)

Pieces live in a **loaded** population of fixed size N. Each use costs 1 + log2(N) / log2(alphabet), the same for
every piece (as in C108). A letter costs 1. A piece is never edited.

For each buffer, in turn:

1. **Read** the buffer with the **cheapest description** the loaded pieces allow (letters and pieces, anywhere they
   fit; on a tie the longer piece). This is the competition: rival pieces covering the same letters compete, and the
   cheaper description wins. Each piece counts how many times reading chose it (counting from the structure).
2. **Anneal**: try every run of 2 or more letters that occurs at least twice in this buffer and isn't a loaded piece
   already. A candidate is kept if adding it makes **this buffer's** description cheaper, counting its own body (made
   of letters and loaded pieces, as cheaply as possible). The best is taken, the buffer is read again, and so on until
   nothing pays. A candidate that is already a **stored** piece is brought back for free (reuse first). The
   bookkeeping is over one buffer only: still not cells first, as in C106.
3. **Make room**: while more than N are loaded, the loaded piece that reading has chosen least (the oldest on a tie)
   goes to **stored**. A stored piece isn't used in reading, but it is still there and can be brought back.

What's new against C106 is only step 1 (cheapest description, not "pieces in the order they formed") and step 3.
Candidates in step 2 come from the buffer's letters, so a new piece can cover letters an old piece already covers.

## The run

The reader in four buffers, then "the zebra sat on the mat", then "the zebra saw the zebra and the zebra ran" (C106's
buffers). Then the **whole sequence again**, to see whether bad pieces fade with more text. Sizes N = 8, 16, 64.

## Measures

- The pieces loaded at the end, with how often reading chose each.
- How each buffer is read on the second pass, especially "the zebra sat on the mat".
- The pieces loaded at the end against C106's pieces from the whole reader in one buffer (`_the_`, `_and_the_dog_`,
  `sat_on_the_`, `_the_cat`, `_the_dog_and_the_dog_`, `ran_to`, `_the_ma`).
- Pieces in use that cut inside a word (start or end between two letters, as in C107).

## Predictions

1. On the first buffer, bad cuts still form. One small buffer is all the evidence there is, and `cat_sa` really is
   cheap there.
2. By the second pass, reading stops choosing most of them, because better pieces (`sat_on_the_`, `_the_cat`) have
   formed from later buffers. The bad ones are stored at N = 8 and 16. At 64 they stay loaded but unused.
3. "the zebra sat on the mat" is no longer cut through "sat" on the second pass.
4. N = 8 is too small: good pieces get stored too, and it churns.

## Success and failure

- **Success:** on the second pass, the pieces reading actually uses are mostly words, word endings or short phrases,
  no more than one cuts inside a word, and the zebra sentence reads without a cut through "sat".
- **Failure:** the early bad pieces are still the ones reading uses on the second pass, or the population churns, with
  pieces stored and brought back again and again without settling.

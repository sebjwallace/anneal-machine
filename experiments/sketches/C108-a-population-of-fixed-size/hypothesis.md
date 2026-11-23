# C108 · A population of fixed size: hypothesis

Written before running. Follows [C107](../C107-a-piece-feels-its-own-price/).

## The question

In C107 a piece judging itself (its own body, its own uses, its own naming cost) kept every piece the global total
keeps, then over-formed, because it can't feel that each new piece makes every other piece's uses dearer to name. The
missing quantity is how crowded memory already is.

The machine already has something that could carry it: a **population of fixed size**. If pieces are members of a
population with room for N, then naming one means picking it out of N, whatever is in the population now. So the
naming cost is fixed by the population, and every piece knows it without anything being added up. Memory is finite
anyway (CON-14).

Does a fixed-size population give the global total's cuts, **without N being a number that has to be tuned**? The
contract forbids hand-set or tuned numbers (CON-2).

## What is compared

- **G**, the global total, as in C106 and C107: the reference.
- **N = 8, 12, 16, 24, 32, 64, 128, 256, 1024**: the local check from C107, with a use costing
  1 + log2(N) / log2(alphabet), the same for every piece. When the population is full nothing more forms (the simplest
  reading; a piece that no longer pays still unpacks and frees its place). Everything else as in C107's L+n: at rest,
  the biggest own saving forms first, pieces never edited.

## Texts

The reader and the prose from C106 and C107.

## Predictions

1. **The cuts swing with N.** With a small N, naming is cheap, so short pieces pass and the population fills with
   whatever paid first, then stops. With a large N, naming is dear and only the most-used pieces pass. Only when N is
   near the number of pieces G ends with (about 7 on the reader, 12 on the prose) do the cuts look like G's.
2. So **N acts as a tuned number**, and a fixed-size population is not, by itself, the crowding signal.
3. The total ends closest to G's near N ≈ G's piece count, and rises on both sides.

## Success and failure

- **Success** (the population carries the signal): across a wide range of N (say a factor of 8 or more), the pieces
  stay close to G's (most of G's pieces, few extras) and the total within a few percent of G's.
- **Failure** (N is a disguised parameter): the pieces and the total change a lot as N changes, and only one narrow
  range of N looks like G.

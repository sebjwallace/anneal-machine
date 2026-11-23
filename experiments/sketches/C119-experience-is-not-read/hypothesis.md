# C119 · Experience is not read: hypothesis

Written before running. Follows [C118](../C118-heat-and-energy/).

## The question

In C118, heat and the energy rule together improved coverage, whole words and the overall cuts, but the pieces got
only a little cleaner on *Alice*. The cause was traced to **raw experience**: what is kept without judgement (whole
sentences, or the hot gaps with heat on) so that an empty memory can start. It is material for comparison, but it was
also read with, and a hot gap's edges are wherever held pieces happened to stop (`aidthe`, `tthe`).

The owner has drawn a line before between episodic memory (the specifics) and semantic memory (what has earned its
place). **If raw experience is kept for comparison but never read with, so that only pieces derived by comparison and
kept by the energy rule are used in reading, are the pieces cleaner?**

## The mechanism

C118, with one change: memory has two parts.

- **Experience**: raw wholes (or hot gaps, with heat on), kept unjudged, as before. Compared with, never read with.
  Bounded at N; when full, the oldest goes (a storage policy).
- **Structure**: pieces derived by comparison (shared runs and the parts that vary) that the energy rule keeps. Only
  these are read with, and heat is judged by reading with these.

A new whole is compared with both. The energy rule's count k covers both (structure and experience containing the
piece, plus the whole).

Runs: C118's "both" as it was (experience read), and with experience not read, for "both" and "energy". *Buster Brown*
and *Alice*, no spaces, sentences and fixed 60-letter stretches. Strict scoring, cheapest reading. N 16384.

## Predictions

1. **Cleaner pieces**: the clean share rises clearly over C118's "both" (by 10 points or more), because the most used
   bad pieces (`aidthe`, `tthe`) were raw gaps.
2. **Less coverage**: reading has fewer pieces to use, so coverage and words read whole fall back some way towards
   C117's (but stay above "neither").
3. With heat on, the hot share stays higher for longer (less is explained when experience isn't read), so it cools
   more slowly.

## Success and failure

- **Success:** the clean share rises by 10 points or more over C118's "both", on both books and both cuts, while
  coverage stays above C117's "neither".
- **Failure:** the clean share doesn't rise much, which would mean the bad pieces weren't mainly raw experience, or
  coverage collapses.

# C120 · Prime patterns: hypothesis

Written before running. Follows [C118](../C118-heat-and-energy/) and [C119](../C119-experience-is-not-read/).

## The question

The owner's reading of C118 and C119: the machine isn't meant to find words. It is meant to find the **primitive
patterns** that explain the most with the fewest parts. Words can be composed from patterns later. So the yardstick
should be the energy rule itself, not word boundaries. A pattern like `atter` (from "hatter", "matter", "latter") is
valuable if it explains a lot cheaply.

The owner asked whether `atter` is **prime**: whether it can't usefully be divided. In the project's own terms, a
pattern is prime when **no split of it lowers energy**. That makes primeness relative to everything else held, not a
property of the letters: `atter` could be `at` + `ter` if those parts explain enough elsewhere. And decomposition need
not be unique (`hatter` = `h` + `atter`, or `hat` + `ter`).

The sketches so far never tried splitting held patterns (C114's composition step was skipped). This one does.

## The mechanism

1. **Learn** each book as C118 "both" (heat and energy, experience read; no spaces; sentences; N 16384) on the first
   nine tenths.
2. **Rest: decompose.** Every held pattern is tried split in two at every point. Each half not yet held is a candidate
   part, kept if it pays by the energy rule: k · (b − link) > b, where b is its length in letters, k the number of held
   patterns containing it, and link the cost of one link (a pointer to a part). Repeat until no new part pays.
3. **Compose.** Each held pattern is then stored as its cheapest description by the other held patterns and letters
   (its parts and links), or flat as letters if that is cheaper. A pattern whose cheapest description is flat is
   **prime**: no split lowers energy.

## The yardstick

**Energy** = the cost of memory (each pattern as stored, flat or composed) + the cost of describing the **unseen last
tenth** of the book with the held patterns (cheapest description). Lower is better. Measured before rest and after. Word
boundaries are kept only as a side check.

## The link price

How much a link costs decides how far anything can be split. At N 16384 a link costs about 4 letters, so splitting a
5-letter pattern into two parts costs 8 letters of links: short patterns come out prime almost by arithmetic.
So three link prices are run: **2.3, 3.2 and 4.0** letters (what 1 + log2(N) / log2(alphabet) gives at N = 64, 1024
and 16384). Learning is the same in all three. Only rest and the yardstick use the price.

## Predictions

1. **Rest lowers energy** at every price, mostly by making memory cheaper (patterns stored as compositions). The unseen
   tenth gets a little cheaper too, from new short parts.
2. **The cheaper the link, the fewer primes and the shorter they are.** At 4.0 almost every pattern under about 8
   letters is prime. At 2.3, many patterns split, and the primes are short, frequent pieces (`the`, `ing`, `ed`, `at`).
3. **`atter`**: prime at 4.0 and 3.2; at 2.3 it splits into `at` + `ter` or into `att` + `er`, if those pay.
4. The most used primes look like the "atoms" of the text: frequent endings, common short words, rhymes.

## Success and failure

- **Success:** rest lowers energy, and the primes it leaves at the cheapest price look like a small set of reusable
  pieces that the composite patterns are built from.
- **Failure:** rest doesn't lower energy, or splitting explodes into thousands of two-letter parts that don't make
  anything cheaper to describe.

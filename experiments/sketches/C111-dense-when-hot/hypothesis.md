# C111 · Dense when hot: hypothesis

Written before running. Follows [C110](../C110-a-hot-start/).

## The question

C110 crossed the barrier at the bottom: tentative pieces took part in reading and grew while still tentative, and
words were learnt from a plain stream with no buffers. But reading made **one** greedy cut at each point, and lasting
pieces inherited those cut points (`d_tha`, `an_s`). The price only ever judged the cuts that one reading offered it.

The owner observed in an earlier experiment that heat lowered a population's sparsity threshold, so activity got
denser (a "flash"): more assemblies lit up and could find the missing context. Applied here: **hot means many
readings at once**. Every piece that fits the text is met, overlapping, and every pair of met pieces that sit next to
each other is a tentative pair. The price then judges rival cuts against each other, because each rival gathers its
own sightings.

## The mechanism

As C110's second run, except for reading:

- At each position, **every unit that fits starting there is met**: the letter, every lasting piece and every
  tentative piece seen at least twice. Meeting a tentative piece counts one sighting (once per position).
- **Pairs:** every unit met that ends at a position pairs with every unit met that starts there. Each different text
  formed this way counts one sighting at that position, however many ways it was paired.
- Nucleation as in C110: k · b > b + k · use, where b is the cost of spelling the piece out with lasting pieces and
  letters.
- **The reading that is measured** is a separate, sparse one: the cheapest description of the text with lasting pieces
  only. That is what the machine "settles on", as against the dense activity it learns from.
- A second variant, **dense only where hot**: positions inside a lasting piece of the settled reading don't start
  units, except at that piece's own start. Once text is explained, its inside goes quiet, so activity is dense only
  where things are still loose.

Pool T = 256, 1024, 4096 (pairs are far more numerous now); population N = 256 for the main runs, also 64 and 1024.
Same texts as C110: the reader with the zebra sentences (three passes), the story (two passes).

## Predictions

1. Rival cuts compete, and the word-shaped ones win, because they recur in more contexts: `the_`, `cat_`, `sat_` beat
   `at_on`, `an_s`. The measured pass on the reader has **at most 3** pieces cutting inside a word, and the story's
   lasting pieces are mostly words, word+space or endings.
2. The zebra sentence reads without a cut through "sat".
3. Dense everywhere churns the pool hard. A small pool (256) loses evidence; 1024 and 4096 give about the same result.
4. Dense only where hot gives the same pieces with far less churn, and it cools: the number of tentative pieces
   dissolved per stretch falls over the run.

## Success and failure

- **Success:** prediction 1 holds on the reader, the story's lasting pieces are mostly words, and results are about
  the same at T = 1024 and 4096.
- **Failure:** fragments still dominate the lasting pieces, or dense activity floods the pool so badly that little
  nucleates.

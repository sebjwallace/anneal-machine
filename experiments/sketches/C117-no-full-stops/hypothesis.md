# C117 · No full stops: hypothesis

Written before running. Follows [C114](../C114-differentiation/) and [C116](../C116-reading-by-support/).

## The question

C114 to C116 cut each book into utterances at `.`, `!`, `?`, `;`, `:` and compared those wholes. That was stated as a
given ("like the pauses between utterances"), but the owner rightly asks whether it is a crutch. A full stop is a
marker written into the text by a person, of the same kind as a space, one level up, and it hands the machine its
wholes ready-made. The scoring also counted each utterance's start and end as correct word boundaries, which full
stops make true, so the punctuation may have flattered the scores as well.

**Do words still come out when the wholes are cut with no regard to punctuation or words?**

## What changes

The text (no spaces, the hard version) is cut three ways:

- **sentences**: as C114 to C116 (the reference);
- **random**: stretches of random length between 30 and 150 letters, cut anywhere, mid-word included (a fixed seed;
  sentences in these books average about 60 to 70 letters without spaces);
- **fixed**: stretches of exactly 60 letters, cut anywhere.

Everything else is C116's learning (no rest, N 16384), with C116's cheapest and support readings.

**Scoring is made strict for all three**: a piece's edge counts as clean only where it falls on a real word
boundary inside the stretch, never just because it is the start or end of the stretch. Words cut by a stretch edge
aren't counted as words to read whole. So the sentence rows here are scored more strictly than in C114 to C116.

## Predictions

1. **Words still come out with random and fixed cuts.** Comparison finds shared runs wherever the wholes start and
   end, so the pieces inside stretches are much the same.
2. **A little worse than sentences**, because every stretch edge splits a word, and those halves are formed as the
   "before" and "after" parts of comparisons, adding fragments. The clean share drops by a few points, not to chance.
3. Random and fixed are about the same.
4. Under strict scoring, the sentence rows score a few points lower than in C114 to C116.

## Success and failure

- **Success (full stops were not doing the work):** with random cuts, the clean share is within about 10 points of
  sentences, and far above chance, for both readings, on both books.
- **Failure (full stops were a crutch):** with random cuts, the clean share falls towards chance, or words stop
  appearing among the most used pieces.

# C112 · Rivals compete as in AMP: hypothesis

Written before running. Follows [C110](../C110-a-hot-start/) and [C111](../C111-dense-when-hot/).

## The question

C110 learnt words from a plain stream (no buffers), but reading made one greedy cut, and lasting pieces inherited it.
C111 let every piece that fits be met and judged each on its own, and every shifted copy of a frequent phrase paid
equally. Frequency can't choose the cut. Only competition for the same letters can.

AMP already has a competition rule ([invoke](../../../language/invoke.md)):

- **Support** is how much of an assembly is backed by what is active: counted part minus missing part.
- **Most support wins. One more is enough. Ties are held**: when the most support is shared, none of the tied open.
- A rival is beaten only by one with more support that wasn't itself beaten.
- **A part is not a rival of its whole.**

Does reading by this rule, with nothing else changed from C110, stop the shifted copies and give word-shaped cuts?

## The mechanism

Exactly C110's second (hot) run, except how reading settles at each point:

- **Candidates** are the lasting pieces and the tentative pieces seen at least twice whose letters all match the text
  (a full match: every member counted, none missing, so support is the piece's length in letters).
- **Wholes and parts:** among candidates starting at the same letter, the longest is the whole and the shorter ones
  are its parts. Parts are not rivals.
- **Rivals:** a candidate starting inside another and ending beyond it (they overlap, and neither holds the other).
- **Outcome:** a candidate wins its letters if no unbeaten rival has more support. If an unbeaten rival has the same
  support, it is a tie and **neither** wins: the letter is read loose (hot), and the rival doesn't win either. If no
  candidate wins, the letter is read loose.
- Everything else as C110: each unit read pairs with the one before it as a tentative piece; reading a tentative piece
  counts a sighting; a tentative piece becomes lasting when k · b > b + k · use; the pool of tentative pieces has room
  for T, and the least seen dissolves; lasting pieces live in a population of N.

What is borrowed from AMP is the rule only. The sketch is still strings and counts, not members and gates. The look
ahead needed to see rivals is a given.

## Texts and sizes

As C110: the reader with the zebra sentences (three passes, the last measured), the story (two passes, the last
measured). T = 64, 256, 1024; N = 64, 256, 1024; main run T = 256, N = 256, as C110's.

## Measures

As C110, plus **shifted copies**: lasting pieces that are another lasting piece moved by one letter (same length,
overlapping in all but one letter, like `the_d` and `he_do`). C111's failure in one number.

## Predictions

1. **Few shifted copies.** A shifted copy ties with the piece it shifts from (same length), and ties are held, so
   neither gets credit there. Far fewer than C111, and fewer than C110.
2. **Cuts better than C110.** On the reader's measured pass, at most 5 units cut inside a word (C110: 15 of 47).
   "The zebra sat on the mat" reads without a cut through "sat".
3. **Longest wins, so phrases form.** Support is length, so long pieces beat short rivals. Expect phrases like
   `sat_on_the_` and `_and_the_dog_` on the reader.
4. **The risk: ties everywhere.** If rivals of equal length are common, many letters are read loose, and learning
   slows or stalls. The story is most at risk.
5. Results about the same from T = 256 up, as in C110 on the reader.

## Success and failure

- **Success:** shifted copies near zero, the reader's measured pass mostly words and phrases (at most 5 cutting inside
  a word), the zebra sentence right, and the story's lasting pieces mostly words, word endings or short phrases.
- **Failure:** shifted copies or fragments still dominate, or ties stall learning (most of the story still loose
  after two passes, with far fewer lasting pieces than C110's 45).

## Addendum, written after the first run and before the second

**The first run formed nothing.** Every tentative piece starts as a pair of letters, so every rival is 2 letters
long. Neighbouring pairs ("th" and "he", "he" and "e_") always tie, ties are held, and neither wins. The letters are
read loose, which only makes more 2-letter pairs, which tie again. Evidence can only arrive by winning, so it never
arrives. Starting from nothing, everything is symmetrical, and the tie rule freezes the symmetry in place.

AMP's own wording gives a second reading of support: "how many ways in each one has". For a piece in this sketch,
its ways in are its sightings (each one a time it was formed or read). The data breaks the symmetry: "he" is met in
"the", "then" and "when", "th" in "the" and "that". So two more runs, changing only what support is:

- **ways in:** support is a piece's sightings (lasting pieces keep counting theirs).
- **length, then ways in:** support is the length matched, and among rivals of equal length, the one with more ways
  in has more support.

Predictions: with **ways in**, frequent short pieces win at first and grow by pairing. Long rare pieces (phrases)
struggle against short frequent ones, so fewer phrases than predicted above, and the zebra sentence may be cut where
a frequent pair straddles a word ("e_s" style). With **length, then ways in**, it should behave like the first
prediction set above: few shifted copies, phrases, and cuts better than C110. If both still stall or fragment, how
rivals compete isn't the missing piece, and the write-up should say so.

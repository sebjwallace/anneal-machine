# C116 · Reading by support: hypothesis

Written before running. Follows [C114](../C114-differentiation/) and [C115](../C115-rest/).

## The question

C115 found that the slips (`[tthing]` in "andmostthings", `[denyi]`, `[edthehatter]`) are a **reading** problem.
The clean pieces are held (`thing`, `nothing`, `most`), but reading takes the cheapest description, which is the one
with the fewest uses, so one use of `tthing` beats a letter and a use of `thing`.

A clean piece and a slip differ in how they came to be. A slip comes from one comparison where two wholes shared a
letter across a seam. A clean piece like `thing` is formed again and again, by many comparisons. Call that its
**ways in**: the number of comparisons that formed it (counting from the structure). **Does reading by ways in pick
the clean pieces?**

## Two readings by ways in (plus the old one, for comparison)

- **cheapest** (C114, C115): the fewest-cost description; a use costs 1 + log2(N) / log2(alphabet), the same for
  every piece.
- **support (AMP's rule):** every held piece that matches the utterance is a candidate. Two candidates are **rivals**
  when they overlap and neither holds the other (a part is not a rival of its whole). **Most support wins, one more is
  enough, ties are held**, and a rival is beaten only by one with more support that wasn't itself beaten. Support is
  ways in. This is done from the most supported down: the most supported candidate wins, and its rivals are beaten;
  then the next unbeaten one, and so on. Where unbeaten rivals tie, none of them wins. The reading is made of the
  outermost winners; what no winner covers is read as loose letters. Note what this means for slips. `thing` sits
  inside `tthing`, so it can't beat it. The slip's real rival is `most`, which overlaps it from the left.
- **named by ways in:** the cheapest description, but naming a piece costs what information theory says it should,
  the less the more often it comes up: a use costs 1 + log2(W / ways) / log2(alphabet), where W is the total ways in
  of everything held. A letter costs 1. So `the` (many ways in) is cheap, and a slip (one way in) is dear. This leans
  on counting how often, which the owner has said is fine when the count comes from the structure itself, and not
  when it is averaged. It is flagged here as the one to check against the principles.

Learning is exactly C114's (with and without C115's rest every 100), at N 16384. All three readings read the same
memory at the same moment.

## Predictions

1. **named by ways in** is the best of the three: more coverage (common short words like `the`, `and`, `of` become
   cheap enough to read) and cleaner pieces (slips are dear). Clean share without spaces above 80%; coverage well
   above C114's 41 to 52%.
2. **support** cleans some slips where a clean rival overlaps them (`most` against `tthing`), but leaves the slips
   whose clean rivals sit inside them. Its coverage is lower than cheapest's, because held ties leave letters loose.
3. With rest, both new readings do better than without, because rest forms more clean rivals.

## Success and failure

- **Success:** at least one reading by ways in, without spaces, has a clearly higher clean share than cheapest (by 5
  points or more) without losing coverage, on both books.
- **Failure:** neither beats cheapest, or the gain in cleanliness comes only by reading much less of the text.

# C111 · Dense when hot: findings

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece (fixed by the population size), while a loose letter cost 1. So a familiar short piece
> ("the", say) could cost more to use than to spell out: it was never worth reading on its own, it counted as heat
> each time it appeared, and nothing that judged what pays could keep it as a piece. That is the wrong way round: an
> established piece should be the cheapest thing to reach for. C125 replaced the flat price with cost as surprise (the
> more familiar a letter or piece, the cheaper it is to use), and that fixed it. Read the results here with that in
> mind: some may not depend on it, but anything about short pieces, what pays, or what counts as heat may.

Run: `node dense.js` (about a minute and a quarter; everything is in [out.txt](out.txt)). Read
[the hypothesis](hypothesis.md) first.

## In short

**It failed, and the way it failed is the finding.** When every piece that fits is met, overlapping, and each
tentative piece is judged on its own sightings, **every shift of a frequent phrase pays equally**. "the dog" makes
`the_d`, `_the_d`, `he_d`, `e_do`, `_the_do`, `the_do`, `he_do`, `e_dog_`, `_dog_`, `dog_` … all at once, each seen
4 times. So the population fills with near-copies of the same few phrases, shifted by a letter. Dense everywhere
filled every population, at every pool size. On the reader the first 256 lasting pieces had all formed by character
241, most of them shifts of "the cat and the dog".

Underneath: **frequency can't choose where to cut.** Every piece inside a frequent phrase is exactly as frequent as
the phrase. Only **competition for the same letters** can choose: one rival takes the letters, and the others get
nothing there. C106's global total did that without being asked (once `_the_` covers some letters, a rival over the
same letters saves nothing). C107's local check judged each piece alone and over-formed, a mild form of the same
thing. Here, with dense activity, it is the whole story.

"Dense only where hot" (inside a lasting piece goes quiet) helps a lot. On the reader the pool never needed to
dissolve anything, and the settled reading was `[sat_on_the_mat_][and_the_dog_][sat_on_the_log][_the_cat_]…` with 4
loose letters. It was still full of shifted duplicates and cut odd (`[the_z][ebra_]`, `[cat_the][n_the_]`). On the
story it was no better than C110.

| | reader: units, loose, cutting inside a word | story: lasting, loose, cutting inside |
|---|---|---|
| C110 hot (one greedy reading) | 47, 4, 15 | 45 lasting, 162 loose, many fragments |
| C111 dense everywhere (T 1024, N 256) | 74, 41, 14 | 256 (full), 640, 151 |
| C111 dense where hot (T 1024, N 256) | 36, 4, 11 | 256 (full), 482, 154 |

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | rival cuts compete; word-shaped ones win; at most 3 cutting inside a word on the reader | **Wrong.** Rivals don't compete when each is judged alone: all of them win. 11 to 18 cut inside a word. |
| 2 | zebra sentence not cut through "sat" | **Mostly as predicted** (`[_sat_]`, `[sat_on_the_mat_]`), but "zebra" is often split (`[the_z][ebra_]`). |
| 3 | dense everywhere churns hard; 256 loses evidence; 1024 and 4096 about the same | **Churn as predicted** (up to 34,000 dissolved). 1024 and 4096 give identical results. But the population, not the pool, is what runs out. |
| 4 | dense where hot: same pieces, far less churn, cools | **Far less churn** (none on the reader at 1024 and up). Not the same pieces, and still not cooling on the story. |

## Against the success and failure criteria

**Failure**: fragments and shifted duplicates dominate the lasting pieces, and dense activity floods the population.

## What C110 and C111 say together

1. **A barrier at the bottom** (C110, first run): structure can't grow up one paid step at a time. It needs a
   tentative stage.
2. **One greedy reading decides the cuts** (C110, second run): lasting pieces inherit wherever reading happened to
   chop.
3. **Many readings judged independently can't decide at all** (C111): every shift pays equally.
4. So what is missing is **competition among tentative rivals for the same letters**. The text is shared out, and a
   rival gets a sighting only where it wins. That is dense activity settling by competition: hot is dense, and
   competition makes it sparse. It is the same thing C109 did with lasting pieces (the cheapest description), now
   with tentative ones in it too.
5. **The open design question, the owner's to decide:** how tentative rivals compete. A tentative piece doesn't pay
   yet (that is the barrier), so "cheapest" alone won't pick it over loose letters. Something else has to decide
   among rivals that cost the same: the one with more support (sightings), the longer one, the one that fits with
   its neighbours. AMP's competition rule ("one more supporting member outcompetes") is one candidate. Several
   choices looked ad hoc when tried on paper (summing sightings favours fragments), so none is built.

## Givens to keep in mind

- Units met at a position include every lasting piece and every tentative piece seen at least twice that fits there.
- "Dense where hot" goes quiet inside the longest lasting piece that starts at a position: a simple stand-in for
  "explained".
- The settled reading measured is the cheapest description with lasting pieces only, taken after the run.
- Same small texts as C110.

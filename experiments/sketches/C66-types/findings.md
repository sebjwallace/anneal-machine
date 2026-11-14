# C66 · Types from what surrounds words · findings

Run: `node run.js` (out.txt). Branch engine unchanged; both regions held as experiences (as C65). The second region's
view (each word's surroundings, its place marked) is given by hand (G3): the claim is about what comparison finds given
that view, not about the view.

| Sentences (each seen once, one rest) | Groups | Purity: a group holds one type | Completeness: a type's words in one group | Words seen once that joined their type |
|---|---|---|---|---|
| 4 | 3 | 83 % | 100 % | 1 of 3 |
| 8 | 6 | 83 % | 100 % | 5 of 5 |
| 12 | 10 | 88 % | 75 % | 5 of 5 |
| 16 | 13 | **100 %** | 94 % | 2 of 2 |
| 24 | 14 | **100 %** | **100 %** | 1 of 1 (lamp) |

Examples at 24 sentences: around `the here warms the` → sun, stove, fire; around `the here heats the` → sun, fire, stove,
lamp; around `the warms the here` → sea, pot, air, room; around `the here feeds the` → river, stream, rain; around
`the feeds the here` → field, plant, tree. And the verbs, which we didn't set as types: around `the sun here the` →
warms, heats; around `the here the tree` → fills, feeds.

## What it shows
- **Types come from surroundings, by comparison, from a handful of sentences.** From 16 sentences, each seen once and
  one rest, every group holds one type; from 24, every type's words are together. No counting: what the words share is
  where they stand, found the way any part is found.
- **A word seen once joins its type.** "lamp", seen in a single sentence, is grouped with sun, fire and stove because
  its one surrounding matches theirs. That is few-shot generalisation.
- **The verbs group too.** warms and heats share their surroundings, and so do feeds and fills: one frame with the verb
  varying, the owner's "abstractions compared with abstractions", appearing without being asked for.
- **Early on, the shortest shared surrounding mixes types.** `the here the` (a word between two "the"s) gathers verbs
  and nouns at 8 and 12 sentences, until longer surroundings take over. More sentences sharpen it.

## Not yet
- **A type is still split across several surroundings.** Heat sources appear as one group around "warms" and another
  around "heats". Merging groups that share their members (comparing the groups themselves) would give one type, heat
  source, for both frames.
- **The view is given (G3).** A second region that receives surroundings, with the word's place marked, is wiring we
  chose. How the architecture should present it, and whether it can arise, is open (THY-2, CAP-15).

## On the word
The glossary already has **type** for what may fill a variable. This experiment fits it: the type is the group, bounded
by the shared surrounding that every member fits.

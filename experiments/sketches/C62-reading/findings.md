# C62 · A reading world with known rules · findings

Run: `node run.js` (out.txt). Branch engine (C56) unchanged, abstract region over items. 11-word language, 8-letter
window landing at random (G1-G4 in run.js: the language, where the eye lands, the window, spaces or not).

| Looks | Spaces | Words found | Kept parts: words · pieces of words · whole words together · cutting through a word | Cutting new text: F1 (random at same rate) |
|---|---|---|---|---|
| 150 | kept | **8/11** | 8 · 3 · 2 · 5 (of 18) | 51 % (38 %) |
| 400 | kept | 7/11 | 7 · 6 · 2 · 5 (of 20) | 46 % (35 %) |
| 1000 | kept | 4/11 | 4 · 3 · 0 · 6 (of 13) | 42 % (33 %) |
| 150 | removed | 5/11 | 5 · 2 · 1 · 7 (of 15) | 65 % (42 %) |
| 400 | removed | 3/11 | 3 · 3 · 4 · 2 (of 12) | 66 % (36 %) |
| 1000 | removed | 2/11 | 2 · 2 · 2 · 1 (of 7) | 62 % (35 %) |

How it cuts a new window (| a cut, _ a space), 150 looks, spaces kept: `_sat_on|_`, `d|og_|a_|d|o`, `en_|the_|f`.
Spaces removed: `t|by|a|d|o|g|a`, `henthe|f|o`.

## What it shows
- **It finds real pieces of the language, with no one telling it what a word is.** Early on, 8 of the 11 words are kept
  as parts, and its cuts fall between words better than chance in every run (F1 42-66 % against 33-42 %).
- **But what it keeps is what recurs, and in this language that isn't only words.** Chunks that cross words recur as
  often as words do ("sat on", "a hen", "the dog"), and so do pieces shared between words ("at" in cat and sat, "og",
  "he" in the and hen). Comparison keeps all of them, because energy can't tell a word from any other recurring stretch.
- **More reading makes it worse, not better.** From 150 to 1000 looks, words found fall from 8 to 4 (spaces kept) and
  5 to 2 (removed). Rest keeps re-describing what it read with the smallest shared pieces and the biggest recurring
  chunks, and whole words lose out to both. This is the edge of the circle.
- **Spaces don't help as much as expected.** They are the most shared thing of all, so they get glued to whatever comes
  before or after ("fox ", " by ", "en the "), and the cuts land next to them rather than on them.

## Why, in the engine's terms
A word is a unit because it varies independently of its neighbours: "the" can be followed by any of four nouns. Nothing
in today's rule sees that. It keeps what is cheap to store and reuse; it has no measure of where what follows becomes
unpredictable. In the engine's own vocabulary, the language is made of **kinds**: one form with a slot that varies
("the ·", "· sat on"), which is exactly the parked question of how general assemblies with slots should be priced
(HYP-12). Language may be what forces that question.

## Choices and givens
G1-G4 as declared. The flow window (100 pictures) and rest every 50 looks are the branch's. The measure of a cut
counts a cut wherever two neighbouring letters are explained by different placements.

## Next, inside or at the edge of the circle
- Kinds over letters: let the abstract region form general assemblies with slots ("the ·"), and see whether words then
  stand out as what fills the slots.
- Where the eye goes: let it look where it is still hot rather than at random.
- A richer language (more sentence patterns), so that cross-word chunks recur less than words do.

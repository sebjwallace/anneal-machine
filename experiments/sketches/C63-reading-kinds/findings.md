# C63 · Words as what fills the slots · findings

Run: `node run.js` (out.txt). Same world, engine and givens as C62; this reads the kinds C62's runs already formed.

| Looks | Spaces | Kinds | Fillers that are whole words | Words found as parts | as fillers | either |
|---|---|---|---|---|---|---|
| 150 | kept | 3 | 9/10 | 8 | 4 | 8/11 |
| 400 | kept | 6 | 17/34 | 7 | 5 | 8/11 |
| 1000 | kept | 8 | 32/71 | 4 | 6 | 7/11 |
| 150 | removed | 4 | 16/23 | 5 | 5 | 6/11 |
| 400 | removed | 5 | 29/46 | 3 | 7 | 8/11 |
| 1000 | removed | 6 | 32/70 | 2 | **7** | 7/11 |

The clearest kind, 150 looks, spaces kept: **"the" + [fox, hen, cat, on]**, and "a" sharing the same set: the
nouns, found as what can follow "the", plus one stray.

## What it shows
- **The words C62 lost are held in the slots.** As it reads more, words fall out of its parts (8 → 4 with spaces,
  5 → 2 without) but appear as fillers (4 → 6, and 5 → 7). Without spaces, at 1000 looks, 7 of the 11 words are
  fillers against 2 as parts. Counting both, 7 or 8 of 11 words stay found throughout. So a word is better seen as what
  varies in a slot than as a chunk that recurs: the owner's point about variation, and the engine's kinds, line up.
- **The slots point at parts of speech, roughly.** "the ·" and "a ·" share one set whose first fillers are nouns.
- **But the slots get noisy.** The share of fillers that are whole words falls from 90 % to about 45 %, and no slot
  holds a single part of speech: the noun slot takes in "on", "og", "by a" and the like. Sets are shared by several
  kinds ("the", "a", "at"), so one set gathers everything any of them was followed by, and fragments that recur (because
  the window cuts words at random) are cheap to add as fillers.

## Why, in the engine's terms
Adding a filler to a set is cheap, and nothing makes a set keep only fillers that play the same part. This is the
parked question of how general assemblies with slots are priced (HYP-12): the price decides how clean the slots are.

## Next
- The pricing of slots (the owner's parked decision): what should a filler cost so that a set holds only what plays one
  part?
- Where the eye lands: words cut by a random window feed fragments into the sets; looking where it is still hot may cut
  less.

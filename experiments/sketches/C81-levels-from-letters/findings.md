# C81 · Levels from letters: findings

> **How not to do time ([decision 009](../../../docs/decisions/009-no-context-in-cells.md)).** This experiment carries
> context in which cell fires (HTM-style temporal memory), or builds on something that does. The owner has ruled that
> out: it is brittle, and these results are kept as the evidence. Read the numbers as measurements, not as a direction.

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after development seed 1 (four changes declared there,
including one to the engine). Output: `out.txt`.

## Results (second half of one reading, no spaces)

| | boundaries: precision / recall | words recognised as exactly themselves | cell chains per word | shared parts: shared beginnings / whole words / fragments | sentences bound | object back from subject + verb |
|---|---|---|---|---|---|---|
| one region, never lets go | 74 / 82% | 40% | 7.3 | 14 / 36 / 50% (446) | 90 | 63% |
| one region, lets go at its own boundaries | 46 / 87% | 9% | 1.0 | 3 / 9 / 88% (173) | 0 | – |
| **two regions**: region 1 marks boundaries, region 2 lets go there | **74 / 82%** | **54%** | **1.0** | 6 / 12 / 82% (149) | 90 | **75%** |
| region 2 lets go at the true starts (ceiling) | 100 / 100% | 100% | 1.0 | 100 / 0 / 0% (7) | 400 | 100% |

With true boundaries, 24 word assemblies were stored (one per word) and recognised on every later occurrence.

## Predictions

| | prediction | result |
|---|---|---|
| P1 | ceiling: one chain per word, ≥ 99% recognised, ≥ 95% of parts shared beginnings, object ≥ 95% | **Holds:** 1.0, 100%, 100%, 100%. |
| P2 | never letting go: ≥ 3 chains per word | **Holds:** 7.3. |
| P3 | one region letting go: boundary precision ≤ 55% | **Holds:** 46%. |
| P4 | two regions: boundaries ≥ 70 / 75%, ≤ 1.2 chains, ≥ 45% recognised | **Holds:** 74 / 82%, 1.0, 54%. |
| P5 | two regions: object back ≥ 75% | **Holds, just:** 75.4% (224 of 297). |
| P6 | two regions: shared beginnings plus whole words ≤ 35% of parts | **Holds:** 18%. |

## What it means

- **Given the right boundaries, every level forms from cells alone.** With region 2 letting go at the true word starts:
  - each word got exactly one chain of cells, stored once and recognised every time after;
  - the parts it found were exactly the true shared beginnings ("ca" for "cat", "car", "cart");
  - every sentence was bound, and from its subject and verb the object came back every time.

  Letters in context, then words, then parts, then sentences, all as cells and segments: three levels above the letters.
- **A word's identity needs letting go of the old context.** Without it, the same word had about seven different chains
  of cells, one per preceding context, which is good for prediction and useless for identity. Letting go at a boundary
  gives one chain per word.
- **Letting go and marking boundaries can't be done by the same region.** A region that lets go at its own guesses
  spoils its predictions, makes more false guesses, and falls to 46%. Two regions running the same engine split the work
  (CTR-1 CAP-9): region 1 keeps the context and marks boundaries; region 2 lets go there and holds the words.
- **With the region's own boundaries the levels form, but noisily.**
  - Half of the words were recognised as exactly themselves.
  - Most parts were fragments of wrong cuts (18% were shared beginnings or whole words).
  - Only the 90 sentences whose three words were all cut exactly could be bound, and from those the object came back
    three times in four.
  - The bottleneck is the boundaries: 74% right and 82% found.
- **Sequence segments and assembly segments must be kept apart.** Stored words predicted all their letters at once and
  spoiled the boundaries until predicting the next letter used only sequence segments. The engine now labels segments
  by what they do (`seq`, or `word`, `part`, `bind`).

## Next
Better boundaries, from the levels themselves. A run that recurs as a stored word is evidence that its cuts were right;
a run that never recurs is likely a wrong cut. Fitting stored words to the stream (RM-6 at the word level) would let the
word level correct the boundaries the letter level proposes.

## Audit against the contracts (14 November 2026, at the owner's request)
Read clause by clause after the run. These violations were not all declared when the results were first written, and
they limit what can be claimed:

1. **Bookkeeping in the experiment (CTR-1 CON-19, CTR-2 CON-8, CON-7).** Recognising a word, and finding shared cells
   for a part, are done by the experiment's code scanning every segment and comparing link sets. A duplicate check
   (`partsSeen`) is a list of parts. The machine's own way would be its cells' segments firing in full when a stored word
   is active again (RM-4); that was not used.
2. **Mechanisms written outside the engine (CTR-2 DEF-9).** The boundary rule (the peak, with one letter of look-ahead)
   and letting go are in the experiment, which reaches into the region's context (`past`) directly. They should be part
   of the engine, driven by the region's own state.
3. **No energy rule (CTR-1 CON-1, CON-2, CAP-6).** Every run is stored on first sight; nothing is kept or dropped
   because it lowers energy. The same holds for every segment the engine grows (see the cells engine's README).
4. **Hand-holding with the truth (CTR-2 CON-2).** Sentences were grouped by their true sentence number, and bound only
   when all three words were cut exactly, judged against the true words. That was done to the machine, not only in the
   measuring. **So the sentence result with the region's own boundaries (90 sentences bound, the object back 75%) rests
   on what was given and cannot be claimed.** The ceiling arm's sentence result (all 400, 100%) also uses true sentence
   grouping, and shows only that binding works once words and sentences are known.
5. **Given and declared:** two fixed boundary cells; region 2 told region 1's boundaries (the wiring); 32 cells, context
   of two; the truth arm is an oracle by design.

**What survives the audit:**
- With true boundaries, letting go gives one chain of cells per word, and words recur on exactly the same cells.
- Without letting go, a word has about seven chains.
- One region letting go at its own guesses spoils its boundaries; two regions keep them (74 / 82%) and give each word
  one chain.
- About half the words were cut exactly.
- With true boundaries, the shared cells between stored words are exactly the true shared beginnings (found here by
  bookkeeping, so the mechanism is not shown).

## Given by hand (declared)
- The world: 24 words in random three-word sentences.
- 32 cells per column, context of two steps.
- The boundary context: two fixed boundary cells.
- The two regions' wiring: region 2 is told region 1's boundaries.
- Which cells are sampled for a sentence's binding.
- Sentences are bound only when all three words were cut exactly, by their true sentence number: this was done to the
  machine (see the audit).

serves: CTR-1 GOL-1, CAP-9, CAP-4, CAP-11, CON-19; CTR-2 D-01 V1.

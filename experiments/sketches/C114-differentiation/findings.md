# C114 · Differentiation: findings

> **Correction ([C117](../C117-no-full-stops/)).** The "pieces with both edges at word boundaries" figures below count
> the start and end of an utterance as clean edges, and full stops make those true word boundaries. Scored strictly
> (only real word boundaries inside the utterance count), the clean share without spaces is about 48 to 53%, not 69 to
> 75%. Still far above chance (roughly 6%), but read the figures below in that light.

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece in reading (fixed by the population size, about 3.6 to 4 letters), while a loose
> letter cost 1. So a familiar short piece ("the", say) could cost more to use than to spell out: it was never worth
> reading on its own, it counted as heat each time it appeared, and nothing that judged what pays could keep it as a piece.
> That is the wrong way round: an established piece should be the cheapest thing to reach for. C125 replaced the flat
> price with cost as surprise (the more familiar a letter or piece, the cheaper it is to use), and that fixed it. Here
> it is why short words stayed loose and coverage was low. Read the results here with that in mind: some may not
> depend on it, but anything about short pieces, what pays, or what counts as heat may.

Run: `node differentiate.js <folder>` (about three and a half minutes; everything is in [out.txt](out.txt)), with the
folder holding the unzipped `gutenberg.zip` from NLTK's corpus collection. Read [the hypothesis](hypothesis.md) first.

One measure was added after the first run and before the second (both runs are the same code otherwise):
**pieces read with both edges at word boundaries**, with **text covered by pieces**. The reason: reading leaves most
of each utterance as loose letters, and every loose letter is a cut. So "cuts at a word boundary" mostly measured the
loose letters and sat near chance, whatever the pieces were like. The pieces themselves looked clean, and the new
measure is how the pieces are judged.

## In short

**Splitting wholes by comparison finds words, even with no spaces at all.** This is the first sketch since C106 whose
pieces are mostly words and phrases. It came from the opposite direction to C107 to C113: nothing is built up from
letters, and every piece is the shared part, or a part that varies, of a comparison between whole utterances.

- **Without spaces** (the text runs together like speech), 69 to 75% of the pieces read have both edges at real word
  boundaries. By chance, a piece placed anywhere would have both edges at word boundaries roughly 6 to 10% of the time
  (an estimate: about the square of the 24 to 25% chance per edge). From *Alice* with no spaces it reads
  `[themarchhare][interrupted][inagreathurry]`, `[well][atanyrate][thedormouse][saidthehatter][wenton]`,
  `[youmust][remember][remarked][theking][orillhaveyouexecuted]`. Its most used pieces are `them`, `this`,
  `saidtheking`, `would`, `ofthe`, `with`, `they`, `theking`, `that`, `saidalice`, `jury`, `court`, `voice`, `dream`.
- **With spaces**, 77 to 79%: cleaner than anything in C110 to C113 (C113's best, greedy, had about half its pieces
  cutting inside a word).
- **But it covers only part of the text**: 30 to 59% of letters are inside pieces, the rest loose. More memory helps
  (*Alice* without spaces: 30% at N 4096, 52% at 16384). So few words are read whole overall (10 to 20%), and most cuts
  are between loose letters, which is why "cuts at a word boundary" stays near chance (27 to 32% against 24 to 25%
  without spaces; 42 to 44% against 38 to 40% with).
- **Coarse first, as predicted.** The first pieces are whole utterances and long shared runs (`theadventuresof`,
  `busterbear`, `downtherabbithole`, `hersister`). Shorter ones appear as more comparisons cut them up.
- **Mistakes are at the edges of pieces**, a letter or two off: `[tthing]`, `[denyi]`, `[edthehatter]`, `[utwhat]`,
  `[thedormouses]`. Where wholes share a letter across the seam ("t" ending one word, starting the next), the shared
  run takes it.

| | cuts at a word boundary (chance) | pieces with both edges at word boundaries | text covered by pieces | words read whole |
|---|---|---|---|---|
| *Buster Brown*, no spaces, N 4096 / 16384 | 29% / 31% (25%) | 70% / 75% | 36% / 41% | 10% / 12% |
| *Alice*, no spaces, N 4096 / 16384 | 27% / 32% (24%) | 72% / 69% | 30% / 52% | 11% / 13% |
| *Buster Brown*, spaces, N 4096 / 16384 | 44% / 44% (40%) | 78% / 79% | 40% / 48% | 12% / 16% |
| *Alice*, spaces, N 4096 / 16384 | 42% / 43% (38%) | 77% / 77% | 33% / 59% | 16% / 20% |

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | without spaces, words come out; at least 60% of cuts at a word boundary; chunks like `saidthe`, `ofthe` | **Words come out** (`saidtheking`, `ofthe`, `thedormouse`), and 69 to 75% of pieces are clean, but **cuts overall are near chance** (27 to 32%), because most of the text is still loose. |
| 2 | with spaces, better than C113's greedy | **Yes for the pieces** (77 to 79% clean against about half). Not for coverage: greedy read nearly everything into pieces; this reads 33 to 59%. |
| 3 | fewer fragments than C110 to C113 | **Yes.** |
| 4 | the risk: memory floods with leftovers | **Partly.** At N 4096 memory fills and stores away thousands (5,661 on *Alice*), but the pieces stay clean. A bigger N covers more text. |
| 5 | coarse first | **Yes.** |

## Against the success and failure criteria

**By the criterion as written, not met**: "at least 60% of cuts at a word boundary" without spaces was 27 to 32%.
**Not a failure either**: far above chance by the fairer measure, words are among the most used pieces, and memory
didn't flood. The criterion measured the loose letters as much as the pieces. What's honest to say is that **the cuts
it makes are good, but it doesn't yet make enough of them.**

## What this says

1. **Direction matters more than any mechanism tried since C106.** Building up from letters (C107 to C113) gave
   fragments, whatever the rule. Splitting wholes by comparison gives words and phrases from the first stretch of
   text, with no spaces, no price on forming, and no tuning. This is Werner's and Gibson's picture, and the project's
   own "decompose, don't average".
2. **The open problem is coverage**: why most text stays loose. Two causes are visible. Reading uses a piece only if
   it is cheaper than its letters (a use costs about 3.6 letters at N 4096), so short words are never read as pieces.
   And comparison only finds what two utterances share, so words met once stay loose. These are separate questions:
   what reading should prefer, and what happens to the parts that vary.
3. **Small edge errors come from letters shared across a seam.** They are the kind that a later comparison could split
   away (`tthing` against `thing`). Whether they do is not tested here.
4. No price decides forming here (as on `main`). Memory is bounded only by storing the least used away.

## Givens to keep in mind

- Utterances are cut at `.`, `!`, `?`, `;`, `:` in the book. That is the only cut given.
- A new utterance is compared only with the 40 held pieces that share the most three-letter runs with it (for
  speed), and only the best of those (the longest shared run) is used at each step.
- Every piece formed has at least 2 letters. Every utterance is also stored whole.
- Reading uses the C108 price. Use counts (for storing away) are updated every 50 utterances.
- "Chance" for both edges of a piece is an estimate (the square of the chance per edge), not measured.

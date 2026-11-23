# C119 · Experience is not read: findings

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece in reading and in the energy rule (about 4 letters), while a loose letter cost 1. So a
> familiar short piece ("the", say) could cost more to use than to spell out: it was never worth reading on its own,
> it counted as heat each time it appeared, and nothing that judged what pays could keep it as a piece. That is the wrong way
> round: an established piece should be the cheapest thing to reach for. C125 replaced the flat price with cost as
> surprise (the more familiar a letter or piece, the cheaper it is to use), and that fixed it. Read the results here
> with that in mind: some may not depend on it, but anything about short pieces, what pays, or what counts as heat
> may.

Run: `node apart.js <folder>` (about a minute and a half; everything is in [out.txt](out.txt)), the same books and
scoring as C118. Read [the hypothesis](hypothesis.md) first. The "experience read" rows reproduce C118's "both" exactly.

## In short

**It failed: the bad pieces weren't mainly raw experience.** With raw experience kept apart (compared with, never read
with), the clean share barely moves: −3, +2, 0 and +9 points across the four runs. Meanwhile coverage falls by 12 to
15 points, words read whole fall by about 10, and the overall cuts fall back from 44 to 48% to about 37% at word
boundaries. It also cools more slowly: about 40% of each whole is still hot at the end, against about 25%.

The pieces that are wrong now come from **comparison itself**. *Alice*, sentences, experience not read, reads
`[wento][nandm]ost`, `[themarchha]r[esaid]`, `[inter][rupted]`, `[thedo]r[mouse][saidthe]h[atter]`. Its most used
pieces include `atter` (from "hatter" against "matter" and "latter"), `esaid` (from "alice said", "the queen said",
"he said"), `saida`, `themarchha`. These are runs of letters that really are shared between different wholes, and
they recur, so the energy rule keeps them. They aren't errors of bookkeeping. They are real regularities of the
letters that don't line up with words: a rhyme (`atter`), or a common ending followed by a common word (`esaid`).

| strict clean share (coverage) | both, experience read (C118) | both, experience not read | energy, experience not read |
|---|---|---|---|
| *Buster Brown*, sentences | 62 (73) | 59 (58) | 57 (62) |
| *Buster Brown*, fixed 60 | 60 (66) | 62 (54) | 60 (57) |
| *Alice*, sentences | 51 (77) | 51 (63) | 47 (69) |
| *Alice*, fixed 60 | 52 (72) | 61 (58) | 56 (63) |

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | clean share up by 10 points or more | **Wrong**, except *Alice* with fixed cuts (+9). |
| 2 | less coverage, fewer whole words | **As predicted.** |
| 3 | cools more slowly | **As predicted.** |

## Against the success and failure criteria

**Failure**, by the first condition: "the clean share doesn't rise much, which would mean the bad pieces weren't
mainly raw experience." C118's diagnosis was half right. `aidthe` and `tthe` were raw gaps and are gone now, but the
errors that replace them come from what comparison finds.

## What this says

1. **C118's arrangement (experience read) is the better one.** It covers more, reads more words whole and cools faster,
   at about the same cleanliness.
2. **What's left is a limit of comparing letters, not of how memory is arranged.** Longest shared run finds overlaps
   between different words (`atter` in "hatter" and "matter") and across word edges (`esaid`), and these really do
   recur. With letters alone, a run that recurs in many places and a word look the same to the mechanism.
3. This brings the **yardstick** question to the front. Some of what is scored as wrong is real structure of the text
   (a rhyme, a word ending, `saidthe`), just not structure at word boundaries. Whether the mechanism needs improving
   here, or the scoring is asking for something the mechanism isn't meant to give, depends on what "good" is meant to
   mean. That is for the owner to decide before more tuning of this kind.

## Givens to keep in mind

- Experience (raw wholes or hot gaps) is bounded at N and loses its oldest when full. Structure is bounded at N and
  stores away the least used, as before.
- The energy rule's count includes experience containing the piece.
- Everything else as C118.

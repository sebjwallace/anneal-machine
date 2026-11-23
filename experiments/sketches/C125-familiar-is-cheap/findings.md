# C125 · Familiar is cheap: findings

> **Caution, added after [C127](../C127-spelled-pieces/).** The engine copy here read every held state of two or more
> members as a piece, by the letters of its members. Compositions (which anneal builds from about half of each part's
> members) and long words whose repeated letters were dropped therefore became pieces spelling strings that never
> occurred, such as "hape" or "saidin": about 13% of the letters held in C126's *Buster Brown* run. They were hardly
> ever read, but they were counted in memory, offered as anneal partners and counted by the energy rule. C127 makes a
> state a piece only when a chain spells it, and finds that reading on unseen text barely changes, while memory and
> energy figures here are overstated by roughly that share.

> **Note ([C126](../C126-seen-again/)).** These runs still store a hot stretch again as new raw experience when its
> letters are already held: 3,054 repeats in *Alice* (`it` 204 times, `to` 196), which kept short words from becoming
> familiar. C126 fixes that (seen again, not stored again) and reports the agreed yardstick (energy). With the fix,
> memory is a third of the size, energy falls 16 to 17%, loose letters on unseen text fall to 8 to 10%, and words read
> whole rise to 46 to 50%. Read the figures below as C125 before that fix.

Run: `node familiar.js <folder> <book> 8` (under 30 seconds a book; everything is in [out.txt](out.txt)). Read
[the hypothesis](hypothesis.md) first. `check/check.sh` still gives the same output as the Go engine.

## In short

**With cost as surprise, the "the" problem is gone.** In the unseen tenth, "the" is read inside a piece 98% (*Buster
Brown*) and 99% (*Alice*) of the time, against 75 to 78% before. And it is mostly read as `the` itself: the most read
unit in *Alice*, 311 times. Using it costs about 1 letter by the end, against 3.98 before. Heat on unseen text falls
from 25 to 29% of letters read loose to 14 to 16%, and the book starts cooler and cools faster (*Alice*: 40% loose in
the first tenth, against 87%). More words are read whole than in any run so far (37% and 44%, against 27%), and more
of the cuts fall at word boundaries (53%, against 45 to 47%, chance 24 to 25%).

**The cost: pieces are shorter, so the strict "clean" share falls** (*Buster Brown* 63% to 37%, *Alice* 54% to 35%).
The machine now reads with frequent short patterns, and many sit inside words: `[the][hat][ter][went]on`,
`[anxious][ly]`, `[noth][ing]`, `[be][ing]`, `[but][ter]`, `[the][dorm][ouse]`. Its most used pieces in *Alice*: `the`,
`and`, `ing`, `of`, `said`, `she`, `her`, `you`, `king`, `al`, `hat`, `his`, `ly`, `ch`, `alice`, `th`, `out`, `had`.
That is words and word endings, plus some frequent pairs of letters.

| | "the" in a piece | loose (unseen) | clean | coverage | words whole | cuts at a word boundary |
|---|---|---|---|---|---|---|
| *Buster Brown*, as before | 75% | 29% | 63% | 71% | 27% | 47% |
| *Buster Brown*, no placement charge | 74% | 15% | 45% | 85% | 36% | 55% |
| ***Buster Brown*, cost is surprise** | **98%** | **16%** | 37% | 84% | **37%** | 53% |
| *Alice*, as before | 78% | 25% | 54% | 75% | 27% | 45% |
| *Alice*, no placement charge | 66% | 13% | 40% | 87% | 40% | 53% |
| ***Alice*, cost is surprise** | **99%** | **14%** | 35% | 86% | **44%** | 53% |

Dropping the placement charge alone lowers heat and raises coverage, but doesn't fix "the": it reads "the" inside a
piece no more often than before, since a flat price of 2.98 is still about what three letters cost.

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | as before: "the" mostly loose or inside longer pieces | **Yes**: inside longer pieces (`theking`, `ofthe`), never `the` alone in the top units. |
| 2 | no placement charge: "the" more often a piece; coverage up, clean down | **Coverage up and clean down, yes.** "the" no better. |
| 3 | cost is surprise: "the" almost always a piece; heat well down; most words whole; clean holds up | **All but the last**: clean falls further than with no placement charge. |

## Against the success and failure criteria

**Met in part.** "the" is read inside a piece over 90% of the time, heat is clearly lower, and words whole are up.
The clean share fell below C123's, though, which the criterion said it shouldn't.

## What this says

1. **The owner's diagnosis was right, and the standard principle fixes it.** When the cost of using something is how
   surprising it is, an established piece is the cheapest thing to reach for, and it stops causing heat. "the" is now
   read as `the`, nearly every time.
2. **This also ties cost to heat directly.** Surprise is heat: something rare is costly to explain, something familiar
   costs almost nothing. The pricing and the heat are now the same quantity, which the earlier flat price never was.
3. **What it builds is patterns, not words, as the owner said to expect.** It composes words from frequent parts:
   `hat` + `ter`, `anxious` + `ly`, `noth` + `ing`, `be` + `ing`. The strict clean measure counts those as wrong edges,
   but they are the reusable parts that explain the most. On the measures that count every cut and every word (cuts at
   word boundaries, words whole), it is the best run so far.
4. **Some short pieces look like noise**: `ch`, `th`, `al`, `ju`, `ry`. They are frequent pairs of letters, cheap
   because frequent. Whether they're useful parts or scraps is the question for the next look. The energy rule would
   be the place to judge them, against the memory as a whole.

## Givens to keep in mind

- Uses are counted from the structure: each time reading uses a letter or piece while learning, and each time a
  comparison forms or reuses a piece. One extra use is added to every count, and the count of kinds of thing, so
  nothing new is impossible to use. Costs are in units of log2(26) bits (one letter of average surprise).
- The energy rule under surprise: a new piece pays if spelling it out k times costs more than storing it once and
  pointing to it k times, at what a piece used k times would cost.
- Reading the unseen tenth doesn't update the counts. Everything else as C123.

# C124 · Rest in the engine: findings

> **Caution, added after [C127](../C127-spelled-pieces/).** The engine copy here read every held state of two or more
> members as a piece, by the letters of its members. Compositions (which anneal builds from about half of each part's
> members) and long words whose repeated letters were dropped therefore became pieces spelling strings that never
> occurred, such as "hape" or "saidin": about 13% of the letters held in C126's *Buster Brown* run. They were hardly
> ever read, but they were counted in memory, offered as anneal partners and counted by the energy rule. C127 makes a
> state a piece only when a chain spells it, and finds that reading on unseen text barely changes, while memory and
> energy figures here are overstated by roughly that share.

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece (the "link price", 4 or 2.3 letters, the same for every piece), while a loose letter
> cost 1. So a familiar short piece ("the", say) could cost more to use than to spell out: it was never worth reading
> on its own, it counted as heat each time it appeared, and nothing that judged what pays could keep it as a piece. That is
> the wrong way round: an established piece should be the cheapest thing to reach for. C125 replaced the flat price
> with cost as surprise (the more familiar a letter or piece, the cheaper it is to use), and that fixed it. C124's
> conclusion that the link price is the real lever was about this flat price. Read the results here with that in mind:
> some may not depend on it, but anything about short pieces, what pays, or what counts as heat may.

Run: `node rest.js <folder> carroll-alice.txt 8` (about a minute and a half; everything is in [out.txt](out.txt)). Read
[the hypothesis](hypothesis.md) first. `check/check.sh` still gives the same output as the Go engine.

## In short

**Rest, put into the engine, adds almost nothing, at either link price. `atter` isn't formed in either.** What changes
the results is the link price itself.

| *Alice*, energy rule | clean | coverage | words whole | cuts at a word boundary (chance 24%) | energy (memory + unseen) | parts formed at rest |
|---|---|---|---|---|---|---|
| link 4.0, no rest (C123) | 54% | 73% | 27% | 44% | 48,233 | – |
| link 4.0, rest | 52% | 73% | 27% | 44% | 48,088 (−0.3%) | 43 |
| link 2.3, no rest | 31% | 86% | 36% | 48% | 18,985 | – |
| link 2.3, rest | 31% | 86% | 36% | 48% | 19,040 (+0.3%) | 14 |

- **At 4.0**, rest forms 43 parts in a whole book. Most are long words and phrases already common as parts of longer
  patterns (`fourtimes`, `ishall`, `thedoor`, `would`, `after`, `theduchess`, `twinkle`, `better`), and some are
  scraps (`amongth`, `atanyra`, `ekidgloves`). Energy falls by 0.3%, and the clean share by 2 points. `hatter` becomes
  `[hatte]` + `r`, the "peel off a free letter" composition C120 found. `matter` stays prime.
- **At 2.3**, rest forms 14 short parts (`rea`, `surp`, `tha`, `let`, `itt`, `mark`) and energy rises by 0.3%. It
  changes nothing measurable.
- **The link price changes everything else.** At 2.3 the energy rule lets shorter pieces pay during learning, so memory
  holds fewer, shorter patterns (2,703 against 4,218). It reads more of the text (86% coverage) and more words whole
  (36%, the highest of any run), and cools further (13% of letters loose at the end, against 27%). But the pieces are
  less clean (31% against 54%): `[the][mar][chh][are][int][err][upt][edin][agr][eat][hurry]`, `[dorm][ouse]`. At 4.0 it
  reads `the[marchhare][interrupt]ed[inagreathurry]`.
- `atter`, `hatter` and `matter` aren't held at all at 2.3. It reads "hatter" as `h[atte]r`. So `atter` isn't a pattern
  this learning arrives at, at either price.

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | at 4.0, rest does almost nothing; `atter` not formed | **As predicted** (43 parts, −0.3% energy). |
| 2 | at 2.3, many parts, memory cheaper, `atter` formed, `hatter` = `h` + `atter` | **Wrong**: 14 parts, no saving, `atter` not formed. |
| 3 | at 2.3, reading differs: more coverage, less clean | **As predicted**, strongly. |
| 4 | at 2.3, rest lowers energy by a few percent | **Wrong**: +0.3%. |

## Against the success and failure criteria

**Failure**: energy doesn't fall in any useful way. Rest doesn't fill memory with scraps either; it just finds little.

## What this says

1. **Annealing already does the splitting.** Every comparison between a hot stretch and a held pattern divides both
   into the part they share and the parts that vary. That is decomposition, done as learning happens. By the time rest
   looks, what would pay to split has mostly been split already. In C120 rest looked as if it helped, but there it ran
   on a memory learnt at one price and was scored at another. With one price throughout, as here, there is little left
   for it to do.
2. **So the "prime patterns" are already what annealing leaves.** At 4.0, 2,740 of 4,218 patterns are prime, among them
   `said`, `hatter`, `thing` and `ing`. Whether `atter` should be one depends on whether enough comparisons ever share
   exactly it. In *Alice* they don't: "hatter" is common and "matter" and "latter" rare.
3. **The link price is the real lever, and it is a trade-off, not a dial with a right answer found by looking.** A dear
   link (4.0) gives fewer, longer, cleaner pieces that cover less. A cheap link (2.3) gives short pieces that cover
   almost everything and read more whole words, but cut more often in the wrong place. C108 found the price robust
   over a wide range for a fixed text. Here it changes what kind of structure is learnt. What sets it, in principle,
   is still open: for now it comes from the size of memory.
4. Rest should stay out of the engine for now. It costs time and adds nothing measurable once annealing is in.

## Givens to keep in mind

- One link price throughout each run: reading, the energy rule and rest.
- Rest every 200 sentences and once at the end of learning. Its candidate lists are made once per rest and not updated
  as parts form (as in C120).
- A part is formed over the members of the first held state containing it (decomposition), reused if one with the same
  letters is held. Patterns containing it aren't composed again from it in the engine. Their composition is counted only
  in memory's cost.

# C121 · Local energy: findings

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece (fixed by the size of memory, or of the neighbourhood), while a loose letter cost 1.
> So a familiar short piece ("the", say) could cost more to use than to spell out: it was never worth reading on its
> own, it counted as heat each time it appeared, and nothing that judged what pays could keep it as a piece. That is the wrong
> way round: an established piece should be the cheapest thing to reach for. C125 replaced the flat price with cost as
> surprise (the more familiar a letter or piece, the cheaper it is to use), and that fixed it. Read the results here
> with that in mind: some may not depend on it, but anything about short pieces, what pays, or what counts as heat
> may.

Run: `node local.js <folder>` (a few seconds; everything is in [out.txt](out.txt)). Read [the hypothesis](hypothesis.md)
first.

## In short

**Local energy, as built here, made both registers worse, and the minority wasn't being drowned in the first place.**

- **With global energy (C118 as it was), the minority already learns.** 450 held patterns are found only in the King
  James stretch, and `thee`, `thou`, `hath`, `unto`, `shall` and `god` are held as patterns of their own, plus `fowl`,
  `dust`, `wife`, `abel`, `cain`, `eden`, `slew`, `shalt`, `woman`, `naked`, `wroth`. The prediction that 4-letter
  markers couldn't be held was wrong. It forgot **raw experience**: with heat on, the unexplained parts of each sentence
  are kept unjudged, and the King James stretch is almost all unexplained when it arrives, so it is kept, compared and
  learnt from. The unseen King James text is read with 64% coverage (Buster Brown: 73%).
- **Local energy holds fewer minority-only patterns (339) and makes both registers less clean.** Buster Brown's unseen
  clean share falls from 60% to 43%, King James's from 48% to 37%, and both cost more per letter to describe. It reads
  `he[woul]d[have][given][anyt][hing]`, `[andt]hatbringsus`, `[begant]o`, `o[nthe]f[aceoft][heearth]`.
- **Why:** the "neighbourhood" (held patterns sharing a three-letter run with the sentence) is large and mixed, so it
  doesn't pick out a register. Its only real effect is a **cheaper link** everywhere (n in the hundreds or low
  thousands instead of 16,384), so short splits pay that didn't before: scraps (`andt`, `woul`, `anyt`). That is C107's
  over-forming again, by a different route.

| | global energy (C118) | local energy |
|---|---|---|
| patterns held | 3,058 | 3,092 |
| only in the minority stretch | 450 | 339 |
| Buster Brown unseen: clean, coverage, cost per letter | 60%, 73%, 0.784 | 43%, 75%, 0.845 |
| King James unseen: clean, coverage, cost per letter | 48%, 64%, 0.845 | 37%, 68%, 0.900 |

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | global: few minority-only patterns; no 4-letter markers held | **Wrong**: 450, and most markers held. Heat and raw experience already give the minority its due. |
| 2 | local: clearly more minority-only patterns and short markers | **Wrong**: fewer (339). |
| 3 | the risk: scraps return in the majority | **This happened**: Buster Brown clean −17 points. |
| 4 | reading at the global price limits coverage gains | Coverage moved little either way (+2 to +4 points). |

## Against the success and failure criteria

**Failure**, on both counts: no gain for the minority, and scraps flooding the majority.

## What this says

1. **The tension is smaller in this mechanism than it looked on paper, and heat is why.** A new register arrives
   unexplained, so it is hot. Heat keeps it as raw experience and compares it, so learning goes where the misfit is.
   The global energy rule only judges what comparison derives, and the minority still earns plenty there. A register
   isn't averaged away. It gets attention because it doesn't fit.
2. **"Local" needs a neighbourhood that means something.** Sharing a three-letter run is too loose: nearly everything
   shares one with nearly everything. Here, "local" became "cheaper", and cheaper brings back scraps. A neighbourhood
   that really picks out a register probably needs what is held in context at the time, which is the support and
   context work set aside for now.
3. **For now, global energy with heat and raw experience is the better arrangement.** The owner's principle (variants
   are valid and are kept) is already met: nothing is forgotten, and the minority forms structure of its own.

## Givens to keep in mind

- Neighbourhood: the held patterns sharing at least one three-letter run with the whole being learnt from. Local link:
  1 + log2(neighbourhood size) / log2(alphabet). Local k: neighbourhood patterns containing the candidate, plus the
  whole.
- Reading and heat use the global price in both runs. The unseen parts are never learnt from.
- The King James text's verse numbers and all other non-letters are removed. Sentences end at `.`, `!`, `?`, `;`, `:`.

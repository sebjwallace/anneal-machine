# C118 · Heat and energy: findings

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece in reading and in the energy rule (fixed by the population size, about 4 letters),
> while a loose letter cost 1. So a familiar short piece ("the", say) could cost more to use than to spell out: it was
> never worth reading on its own, it counted as heat each time it appeared, and nothing that judged what pays could keep it as a piece. That is the wrong way round: an established piece should be the cheapest thing to reach for. C125 replaced
> the flat price with cost as surprise (the more familiar a letter or piece, the cheaper it is to use), and that fixed
> it. Heat here was partly made of familiar short words read loose. Read the results here with that in mind: some may
> not depend on it, but anything about short pieces, what pays, or what counts as heat may.

Run: `node heat.js <folder>` (about two and a half minutes; everything is in [out.txt](out.txt)), the same books as
C114, without spaces, with C117's strict scoring. Read [the hypothesis](hypothesis.md) first. "Neither" reproduces
C117's cheapest rows exactly.

## In short

**Heat and the energy rule together make the mechanism better all round, but only a little cleaner on *Alice*.**

- **Together ("both")**:
  - Coverage almost doubles: 32 to 52% becomes 66 to 77%.
  - Words read whole double: 9 to 13% becomes 23 to 28%.
  - Cuts across the whole text at a word boundary rise from about 31% to **44 to 48%**, against chance at 24 to 26%.
    For the first time, the overall cuts are well clear of chance with the plain cheapest reading. C116 needed the
    support reading for that.
  - It keeps about half as many pieces.
  - The clean share of pieces rises on *Buster Brown* (+9 with sentences, +13 with fixed cuts) but only by 3 points on
    *Alice*.
- **It cools.** With heat on, the share of each whole that is still hot (unexplained) falls over the book from about
  70 to 85% at the start to about 20 to 30% at the end, steeply at first.
- **Heat alone makes the pieces less clean** (down 9 to 14 points), though it raises coverage the most. The hot
  stretches stored as raw experience are cut wherever the held pieces happened to end, often mid-word, and reading
  then uses them. The energy rule doesn't judge raw experience, so it lets them in.
- **Energy alone** raises the clean share on fixed cuts (+8 on *Alice*, +14 on *Buster Brown*) and on *Buster Brown*
  sentences (+4), not on *Alice* sentences (0). It turns down 27,000 to 51,000 derived pieces per run, and it raises
  coverage too (the pieces it keeps are long, repeated runs that reading uses).

| strict clean share (coverage) | neither | heat | energy | both |
|---|---|---|---|---|
| *Buster Brown*, sentences | 53 (41) | 43 (79) | 57 (61) | **62 (73)** |
| *Buster Brown*, fixed 60 | 47 (32) | 38 (74) | **61 (56)** | 60 (66) |
| *Alice*, sentences | 48 (52) | 38 (80) | 48 (68) | **51 (77)** |
| *Alice*, fixed 60 | 49 (39) | 35 (77) | **57 (62)** | 52 (72) |

*Alice*, sentences, both, reads: `[them][archhare][inter][rupt][edina][great][hurry]`,
`[well][atanyrate]the[dormous]es[aidthe][hatter][wenton][look]ing[anxiously][round]`. Its most used pieces include
`said`, `king`, `ofthe`, `alice`, `that`, `with`, `thequeen`, `would`, `jury`, `little`, `hatter`, `whiterabbit`,
`important`, `voice`, but also `aidthe` (most used of all) and `tthe`.

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | heat: far fewer pieces, same clean share, cools | **Cools, yes.** But pieces held stay about the same, and the clean share **falls**. Heat stores the hot gaps as raw experience, and those are fragments. |
| 2 | energy: clean share up to 60% or more; coverage down | **Clean up on three of four** (to 57 to 61%), flat on *Alice* sentences. Coverage **up**, not down. |
| 3 | both: cleanest, fewest pieces | **Fewest pieces, yes.** Cleanest on sentences, not on fixed cuts, where energy alone is cleaner. |
| 4 | gains hold for fixed cuts | **Yes.** |

## Against the success and failure criteria

**Not met as written**: "both" gains at least 10 points of clean share only on *Buster Brown* with fixed cuts (+13).
It gains 9 on *Buster Brown* sentences and 3 on *Alice*. **Not a failure** either: the gain isn't bought by reading
less. Coverage nearly doubles, and words read whole double.

## What this says

1. **Both principles help, as principles.** The energy rule prunes most of what comparison derives (tens of thousands
   of pieces turned down), and what it keeps is cleaner and more used. Heat makes learning stop where things already
   fit, and the system cools over the book.
2. **The weak point is raw experience.** Whatever is stored unjudged (whole utterances, or hot gaps) is also used in
   reading, and a hot gap's edges are wherever held pieces happened to stop. `aidthe` and `tthe`, the most used
   pieces on *Alice*, come from that. A principled next question, within this mechanism: should raw experience be
   material for comparison only, and not read with until a comparison has derived something from it (paid for by the
   energy rule)?
3. The gains are uneven between books (*Buster Brown* more than *Alice*), and where the "energy" and "both" columns
   differ, energy alone is sometimes cleaner. More books would show whether that is noise or a pattern.

## Givens to keep in mind

- Heat: a hot stretch is a run of two or more loose letters in the cheapest reading with what is held. Only hot
  stretches are compared, and each is stored as raw experience.
- Energy: a derived piece (shared run, or a part that varies) is kept only if k · (b − use) > b, where k counts the
  held pieces containing it plus the whole it was learnt from. Raw experience is always kept, otherwise nothing could
  start.
- Cheapest reading only. No rest, N 16384. Everything else as C117.

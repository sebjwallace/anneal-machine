# C120 · Prime patterns: findings

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece (the "link price": 2.3, 3.2 or 4 letters, the same for every piece), while a loose
> letter cost 1. So a familiar short piece ("the", say) could cost more to use than to spell out: it was never worth
> reading on its own, it counted as heat each time it appeared, and nothing that judged what pays could keep it as a piece.
> That is the wrong way round: an established piece should be the cheapest thing to reach for. C125 replaced the flat
> price with cost as surprise (the more familiar a letter or piece, the cheaper it is to use), and that fixed it. What
> came out prime depended on that flat price; under cost as surprise it would differ. Read the results here with that
> in mind: some may not depend on it, but anything about short pieces, what pays, or what counts as heat may.

Run: `node prime.js <folder>` (about 25 seconds; everything is in [out.txt](out.txt)). Read
[the hypothesis](hypothesis.md) first.

**The first version of rest was wrong, and was replaced after its first run.** It added every candidate part that
passed the energy rule in one batch, each judged as though it alone would take the savings in every pattern containing
it. So the same savings were counted many times over, memory doubled, and energy rose at every price
([out-batch-rest.txt](out-batch-rest.txt)). That was a fault in the accounting, not a result. The version reported
below adds **one part at a time**, the one that lowers the cost of memory most, its saving worked out exactly
(every pattern containing it re-described with it, and the part paid for), and stops when no part lowers memory. Only
memory is used to decide. The unseen tenth is never learnt from.

## In short

1. **Rest lowers energy, modestly, and how much depends on the link price.** At a link of 2.3 letters, energy (memory +
   the unseen tenth) falls by 2.5 to 3% (*Alice*: 33,256 to 32,433), and the unseen tenth gets 3 to 6% cheaper to
   describe. At 3.2 it falls by under 1%. At 4.0 almost nothing changes (1 to 3 new parts).
2. **What is prime depends on the link price, as predicted.** At 4.0, `hatter` and `matter` are prime. At 3.2, `hatter`
   = `ha` + `[tter]`. At 2.3 on *Alice*, `hatter` = `h` + `[atter]`, and `atter` itself is formed and stored as
   `[atte]` + `r`. So **`atter` is not prime in itself**: whether it, or the patterns around it, can be divided depends
   on how cheap a link is and what else is held.
3. **At the cheapest link, the primes look like a small alphabet of reusable pieces.** On *Alice*, the most used primes
   in the unseen tenth are `the`, `and`, `she`, `ing`, `her`, `jury`, `off`, `him`, `all`, `his`, `turn`, `writ`, `you`,
   `ness`, `for`, `began`, `ers`, `head`, `had`, `est`, `been`. Short words and endings, almost all three to five
   letters. The composites they build include `whiterabbit` = `[white][rabbit]`, `thequeen` = `the[queen]`, `nothing` =
   `no[thing]`, `toherself` = `to[herself]`, `ofcourse` = `of[course]`, `shecould` = `she[could]`.
4. **But much composition is "a letter plus a pattern".** `alice` = `[alic]` + `e`, `about` = `[abou]` + `t`, `ofthe` =
   `o` + `[fthe]`, `atter` = `[atte]` + `r`. A loose letter costs 1 and a link 2.3, so peeling one letter off a held
   pattern is always cheap, whether or not the split means anything. That is a property of the accounting (letters are
   free parts, never paid for as structure), and it makes many "compositions" shallow.

| energy (memory + unseen) before → after rest | link 2.3 | link 3.2 | link 4.0 |
|---|---|---|---|
| *Buster Brown* | 20,585 → 20,029 | 24,514 → 24,406 | 26,904 → 26,901 |
| *Alice* | 33,256 → 32,433 | 40,066 → 39,879 | 44,192 → 44,185 |

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | rest lowers energy at every price, mostly memory | **Yes**, but by little, and almost nothing at 4.0. Both memory and the unseen tenth get cheaper at 2.3. |
| 2 | cheaper link, fewer and shorter primes | **Yes.** At 2.3 the primes are mostly 3 to 5 letters; at 4.0 they run long. |
| 3 | `atter` prime at 4.0 and 3.2, split at 2.3 | **Roughly.** At 4.0 and 3.2 `atter` isn't held at all after this learning, and `hatter` is prime (4.0) or `ha`+`tter` (3.2). At 2.3 `atter` is formed and split as `atte`+`r`. |
| 4 | most used primes look like atoms: endings, short words, rhymes | **Yes at 2.3** (`the`, `and`, `ing`, `ness`, `est`, `ers`). |

## Against the success and failure criteria

**Success, modestly**: rest lowers energy, and at the cheapest price the primes are a small set of reusable pieces
that composites are built from. No explosion once the accounting was right. The size of the effect is small, and the
"letter plus pattern" compositions mean the structure is shallower than the numbers suggest.

## What this says

1. **"Prime" is a working idea, made precise as "no split lowers energy".** It is relative: to the link price and to
   what else is held. `atter` is a good example. Whether it's an atom depends on whether its parts earn their keep
   elsewhere.
2. **The link price is now the most important open number.** It decides how deep structure can go. Here it comes from
   the size of memory (C108), and at realistic sizes (4.0) almost nothing can be divided. A cheaper link, for example
   one that names a part among its likely neighbours rather than among everything held, would allow deeper structure.
   That is a question about the energy accounting itself, for the owner.
3. **Letters need to be paid for like anything else.** As long as a loose letter costs 1 and is never structure, peeling
   letters off patterns is a cheap, meaningless way to "compose".

## Givens to keep in mind

- Learning is C118's "both" on nine tenths. Rest and scoring use the link price; learning doesn't.
- Candidate parts: every split of every held pattern in two (each half at least 2 letters), and the halves of each new
  part. The lists of which patterns contain a candidate are made once and not updated as new parts are added.
- Memory cost: each pattern stored flat (its letters) or as its cheapest description by other patterns and letters,
  whichever is cheaper. The unseen tenth: its cheapest description with everything held.

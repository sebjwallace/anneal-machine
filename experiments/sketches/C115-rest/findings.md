# C115 · Rest: findings

> **Correction ([C117](../C117-no-full-stops/)).** The clean shares below count utterance starts and ends as clean
> edges, as C114 did, so they are inflated by roughly 20 points. The comparison between rest and no rest stands.

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece in reading (fixed by the population size), while a loose letter cost 1. So a familiar
> short piece ("the", say) could cost more to use than to spell out: it was never worth reading on its own, it counted
> as heat each time it appeared, and nothing that judged what pays could keep it as a piece. That is the wrong way round: an
> established piece should be the cheapest thing to reach for. C125 replaced the flat price with cost as surprise (the
> more familiar a letter or piece, the cheaper it is to use), and that fixed it. C115 found that `[tthing]` beat `t` +
> `[thing]` because a flat price favours fewer pieces; under cost as surprise a familiar `thing` is cheap. Read the
> results here with that in mind: some may not depend on it, but anything about short pieces, what pays, or what
> counts as heat may.

Run: `node rest.js <folder>` (about ten minutes; everything is in [out.txt](out.txt)), the same books as C114. Read
[the hypothesis](hypothesis.md) first. The no-rest runs reproduce C114 at N 16384 exactly.

## In short

**Rest helps a little with coverage and doesn't clean the pieces.** Comparing held pieces with each other forms
thousands more pieces (2,000 to 5,800 at rest), and a few more points of the text get read into pieces. But the share
of clean pieces stays flat on *Buster Brown* and falls a little on *Alice*. The slips C114 made are still read
(`[tthing]`, `[denyi]`, `[edthehatter]`, `[thedormouses]`), and a few new ones appear (`[aidthehatter]`,
`[themarchhareinterrupted]`).

| | clean pieces: no rest, rest 100, rest 400 | coverage: no rest, rest 100, rest 400 |
|---|---|---|
| *Buster Brown*, no spaces | 75%, 77%, 74% | 41%, 46%, 45% |
| *Buster Brown*, spaces | 79%, 79%, 79% | 48%, 54%, 53% |
| *Alice*, no spaces | 69%, 67%, 67% | 52%, 56%, 55% |
| *Alice*, spaces | 77%, 74%, 75% | 59%, 63%, 63% |

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | cleaner pieces, a few points | **Wrong.** Flat or down by up to 3 points. |
| 2 | more coverage | **Yes**, by 4 to 6 points. |
| 3 | the catch: reading still takes the slip, since one use is cheaper than a letter and a use | **This is what happened.** |
| 4 | how often it rests barely matters | **Yes**: 100 and 400 within a point or two. |
| 5 | the risk: rest finds overlaps that aren't words | **Some**: `[aidthehatter]`, `[themarchhareinterrupted]`. |

## Against the success and failure criteria

**Neither.** Coverage rose on both books at both R. The clean share didn't. That is closer to "nothing changes" than
to success.

## What this says

1. **The slips are a reading problem, not a forming problem.** Rest does form the clean pieces (`thing` and `nothing`
   are both held). But reading takes the cheapest description, and the cheapest description is the one with the
   fewest uses, so `[tthing]` beats `t` + `[thing]` every time. More forming can't fix what reading picks.
2. So the question is back to **how overlapping pieces compete in reading**. This time the candidates are mostly clean,
   unlike C112, where they were fragments. A clean piece like `thing` has been formed and met in many comparisons. A
   slip like `tthing` comes from one. "Support is ways in", AMP's own rule, might pick the right one here where it
   couldn't before. That is the natural next test.
3. Rest forming more without cleaning is also a cost: memory grows by about half.

## Givens to keep in mind

- At each rest, only the pieces formed by input since the last rest are compared, each with the other held pieces
  (the 40 sharing the most three-letter runs). What rest forms isn't compared again.
- Everything else as C114.

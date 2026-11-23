# C117 · No full stops: findings

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece in reading (fixed by the population size), while a loose letter cost 1. So a familiar
> short piece ("the", say) could cost more to use than to spell out: it was never worth reading on its own, it counted
> as heat each time it appeared, and nothing that judged what pays could keep it as a piece. That is the wrong way round: an
> established piece should be the cheapest thing to reach for. C125 replaced the flat price with cost as surprise (the
> more familiar a letter or piece, the cheaper it is to use), and that fixed it. Read the results here with that in
> mind: some may not depend on it, but anything about short pieces, what pays, or what counts as heat may.

Run: `node nostops.js <folder>` (about a minute and a half; everything is in [out.txt](out.txt)), the same books as
C114, without spaces. Read [the hypothesis](hypothesis.md) first.

## In short

Two findings, and the first matters more.

1. **C114 to C116's "clean pieces" figures were inflated by the scoring.** Those runs counted a piece's edge as clean
   when it fell at the start or end of an utterance, and full stops make those true word boundaries. Scored strictly
   (only real word boundaries inside the stretch count), the same sentence runs fall from 69 to 75% to **48 to 53%**
   (cheapest) and from 52 to 56% to **40 to 45%** (support). That is still far above chance (both edges at a word
   boundary by chance is roughly 6%, an estimate), but it is not "about 70%". **C114's headline numbers should be read
   as these lower ones.**
2. **Without full stops, words still come out, but less cleanly, and the support reading suffers most.**
   - With **fixed** stretches of 60 letters, cut anywhere, cheapest reading is about as clean as with sentences (47%
     against 53% on *Buster Brown*, 49% against 48% on *Alice*). It still learns `that`, `said`, `they`, `inthe`,
     `head`, `alice`, `saidtheking`, `nothing`, `voice`, `thewhiterabbit`. But it also learns pieces from the stretch
     edges (`fthe`, `eking`, `hera`, `nthat`).
   - With **random** stretches (30 to 150 letters, so 90 on average, longer than sentences), cheapest holds on
     *Buster Brown* (50%) but falls on *Alice* (32%).
   - **support** drops more: to 27 to 33% with fixed cuts and 17 to 30% with random ones, against 40 to 45% with
     sentences. Its most used pieces become fragments (`the`, `ing`, `ed`, `to`, `er`, `th`, `en`).

| strict clean share (coverage) | sentences | fixed 60 | random 30 to 150 |
|---|---|---|---|
| *Buster Brown*, cheapest | 53% (41%) | 47% (32%) | 50% (27%) |
| *Buster Brown*, support | 45% (66%) | 27% (65%) | 30% (51%) |
| *Alice*, cheapest | 48% (52%) | 49% (39%) | 32% (25%) |
| *Alice*, support | 40% (77%) | 33% (74%) | 17% (59%) |

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | words still come out with random and fixed cuts | **Yes**, more clearly with fixed cuts and the cheapest reading. |
| 2 | a little worse than sentences, a few points | **For cheapest with fixed cuts, yes.** Otherwise more than a few: support loses 8 to 23 points, and random cuts on *Alice* lose 16. |
| 3 | random and fixed about the same | **No.** Random is worse on *Alice*. Its stretches are longer on average (90 letters against 60), which gives fewer wholes to compare, so the comparison isn't like for like. |
| 4 | strict scoring lowers the sentence rows a few points | **It lowers them by 20 points or more.** The scoring had been doing much of the work. |

## Against the success and failure criteria

**Neither cleanly.** For cheapest with fixed cuts, it succeeds: within 10 points of sentences on both books, and far
above chance. For support, and for random cuts on *Alice*, it fails the "within 10 points" test, though it never falls
to chance and words never disappear from the most used pieces.

## What this says

1. **Full stops aren't what makes it work, but they help.** Comparing wholes finds words even when the wholes are cut
   blindly. Where the wholes are cut matters most for the support reading, which is the one that reads the most text.
2. **Edges of wholes make fragments.** A whole cut mid-word forms the halves of that word as pieces (`fthe`, `eking`).
   Real utterances happen to start and end at word boundaries, which is the real advantage they give.
3. **The honest size of the result is smaller than C114 reported.** About half of the pieces have both edges at real
   word boundaries, against roughly 6% by chance. That is a large signal, but nothing like a finished segmenter.
4. A whole cut at a blind point is itself a given. The open question of what a whole should be stays open: the most
   principled answer is probably not a cut at all, but whatever is held in view at a moment, compared as the stream
   moves on.

## Givens to keep in mind

- Strict scoring: a piece's edge counts only where it is a real word boundary inside the stretch. Word segments cut by
  a stretch edge aren't counted as words to read whole.
- Random lengths use a fixed seed. Everything else is C116's learning (no rest, N 16384) and its cheapest and support
  readings.

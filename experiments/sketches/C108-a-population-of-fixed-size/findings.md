# C108 · A population of fixed size: findings

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece (1 plus naming it among a population of fixed size N), while a loose letter cost 1. So
> a familiar short piece ("the", say) could cost more to use than to spell out: it was never worth reading on its own,
> it counted as heat each time it appeared, and nothing that judged what pays could keep it as a piece. That is the wrong way
> round: an established piece should be the cheapest thing to reach for. C125 replaced the flat price with cost as
> surprise (the more familiar a letter or piece, the cheaper it is to use), and that fixed it. The finding that N is
> robust over a wide range is about this flat price, not about a price set by familiarity. Read the results here with
> that in mind: some may not depend on it, but anything about short pieces, what pays, or what counts as heat may.

Run: `node population.js` (about two minutes; everything is in [out.txt](out.txt)); `node population.js steps` also
prints every step. Read [the hypothesis](hypothesis.md) first. G is the global total of C106 and C107 (the same
results).

## In short

**The prediction was wrong, in the population's favour.** The cuts do **not** swing with N across a wide middle
range. From N = 24 to N = 256 (more than a factor of 10) the pieces are the same, or nearly, on both texts, and the
total stays within 1.4% of G's. The size of the population only matters at the ends:

- **Too small** (8 to 16 on the prose): the population fills, and what got in first stays. Fragments appear (`ng_`,
  `_th`, `ver`, `her`).
- **Too large** (1024): naming is dear, so too little forms; `_the_` itself is lost on the reader.

The reason is that a pointer's cost grows with the **logarithm** of N. Doubling the population adds only a little to
the price of a use, so only N's order of magnitude matters, not its exact value.

In the middle range the pieces differ from G's, but not for the worse. On the prose they swap G's `_and` for `_and_`,
`ing` for `ing_`, add `_and_the_`, and drop G's fragment `_wo`, as well as `er_` and `_she_`. On the reader they keep
all or nearly all of G's pieces and add whole phrases (`sat_on_the_mat`, `sat_on_the_log`, `saw_the_cat`), with the
same total.

| text | N | pieces | G's kept | extra | full | total vs G |
|---|---|---|---|---|---|---|
| reader | 8 | 8 | 7/7 | 1 | yes | +0.0% |
| | 12 | 12 | 7/7 | 5 | | +1.4% |
| | 16 – 128 | 10 | 6 or 7/7 | 3 or 4 | | +0.0% |
| | 256 | 6 | 5/7 | 1 | | +3.6% |
| | 1024 | 5 | 5/7 | 0 | | +9.3% |
| prose | 8 | 8 | 6/12 | 2 | yes | +1.1% |
| | 12 | 12 | 7/12 | 5 | yes | +0.6% |
| | 16 | 16 | 7/12 | 9 | yes | +1.3% |
| | 24 – 256 | 10 or 11 | 7/12 | 3 or 4 | | +1.2 to 1.4% |
| | 1024 | 7 | 5/12 | 2 | | +3.5% |

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | cuts swing with N; only N near G's piece count looks like G | **Wrong.** Stable from 24 to 256 on both texts; N near G's count (8 to 16 on the prose) is where it goes wrong, because the population fills. |
| 2 | N acts as a tuned number | **Mostly wrong.** N is a number, and the extremes break, but within more than a factor of 10 the result barely depends on it. |
| 3 | total closest to G near N ≈ G's piece count, rising on both sides | Partly: it rises at both ends, but the flat middle is far wider than predicted. |

## Against the success and failure criteria

**Success, by the criterion written beforehand**: across more than a factor of 8 (24 to 256), the total stays within
a few percent of G's (1.4% at most), and most of G's pieces are kept (7 of 12 on the prose, 6 or 7 of 7 on the
reader), with a few extras. The pieces that differ are near-equivalents or better, not fragments. A reader comparing the
two lists by eye would call them about as good. That last judgement is mine, not a measure.

## What this says

1. **A fixed-size population can carry the crowding signal.** Each piece prices its uses by the population it lives
   in, which it knows without anything being added up. With that, the local check from C107 stops over-forming.
2. **N is an architectural constant, not a tuned parameter, as long as it sits in the wide middle.** Its effect is
   logarithmic, so getting its order of magnitude right is enough.
3. **There is a cliff below.** A population that fills makes first-come pieces permanent. That is the same lock-in
   C106 found, from a different cause. A population needs plenty of room beyond what it holds.

## Givens to keep in mind

- Two small texts written for the sketch. The flat range is in units of these texts. On a larger text G would keep
  more pieces, and the cliff would move up with it.
- The alphabet sets the scale too (the price is log2(N) / log2(alphabet)).
- G is itself greedy, so it is a reference, not the truth.
- When full, nothing more forms. No piece is swapped out, and nothing is stored to disk to make room.
- The tally of runs is still a table over the buffer, as in C107.

## Open

- Does the flat range hold on much longer text, and where does the cliff sit then?
- When the population is full, should a better piece take the place of a worse one (stored, not broken), rather than
  nothing forming?

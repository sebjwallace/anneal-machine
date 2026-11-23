# C107 · A piece feels its own price: findings

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece (1, or 1 plus naming it among the pieces held), while a loose letter cost 1. So a
> familiar short piece ("the", say) could cost more to use than to spell out: it was never worth reading on its own,
> it counted as heat each time it appeared, and nothing that judged what pays could keep it as a piece. That is the wrong way
> round: an established piece should be the cheapest thing to reach for. C125 replaced the flat price with cost as
> surprise (the more familiar a letter or piece, the cheaper it is to use), and that fixed it. The "missing crowding
> signal" found here was about this flat price. Read the results here with that in mind: some may not depend on it,
> but anything about short pieces, what pays, or what counts as heat may.

Run: `node local.js` (about a minute; everything is in [out.txt](out.txt)); `node local.js steps` also prints every
step. Read [the hypothesis](hypothesis.md) first. G reproduces C106's main results exactly (totals 34.1, 124.7, 447.8),
which checks the two sketches agree.

## In short

**A piece judging itself, with its own naming cost (L+n), keeps every piece the global total keeps, and then forms
extra ones.** On the prose it keeps all 12 of G's pieces and adds 8 (20 in all); on the reader, 6 of G's 7 plus 5. Its
total ends a little above G's (455.0 against 447.8 on the prose, 125.6 against 124.7 on the reader).

The extras are what the hypothesis said a local check can't see: **each new piece makes every other piece's uses a
little dearer to name**, and that cost lands on others. One extra piece is cheap for itself and slightly costly for the
200-odd uses around it. Few pieces, little gap (the two sentences: identical); more pieces, a wider one.

The extras are mixed. Some are good (`morn`, `long`, `_for_`, `_and_`; on the reader whole phrases like
`sat_on_the_mat` and `_the_man_`, which **replaces G's fragment `_the_ma`**, so L+n has no cut inside a word on the
reader where G has one). Some are fragments (`en_`, `rent`, `n_the_`).

**Without the naming cost (L), it falls apart**: 31 pieces on the prose, most of them two-letter scraps (`_w`, `_t`,
`er`, `on`, `in`, `st`, `al`). The naming cost is what holds the local check back.

**Streaming (S) is clearly worse**, as predicted: deciding the moment a piece first pays means deciding on very little
text. It cuts at coincidences (`sat_o`, `at_`, `ds_o`, `_and_th`, `wate`) and keeps only 5 of G's 12 pieces on the
prose, none of G's 7 on the reader.

| text | way | pieces | also G's | total | start or end inside a word |
|---|---|---|---|---|---|
| two sentences | G | 2 | 2/2 | 34.1 | 0 |
| | L | 2 | 2/2 | 34.1 | 0 |
| | L+n | 2 | 2/2 | 34.1 | 0 |
| | S | 5 | 1/2 | 37.9 | 2 |
| reader | G | 7 | 7/7 | 124.7 | 1 |
| | L | 13 | 6/7 | 131.0 | 2 |
| | L+n | 11 | 6/7 | 125.6 | 0 |
| | S | 16 | 0/7 | 140.0 | 4 |
| prose | G | 12 | 12/12 | 447.8 | 5 |
| | L | 31 | 12/12 | 502.7 | 23 |
| | L+n | 20 | 12/12 | 455.0 | 11 |
| | S | 22 | 5/12 | 479.1 | 14 |

"Start or end inside a word" is counted mechanically: at some place in the text the piece starts or ends between two
letters. It counts word endings like `ing` and `er_` too, so it overstates fragments; read the piece lists in out.txt.

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | L+n matches G, give or take one or two pieces | **Not met on the prose** (8 extra); close on the reader (5 extra, 1 swapped for a better one); exact on the two sentences. It never dropped one of G's pieces it shouldn't have. |
| 2 | L forms more pieces than G, total a little higher | **As predicted, more strongly**: 31 against 12 on the prose, total 502.7 against 447.8. |
| 3 | S worse than both, small-buffer cuts, higher total | **As predicted.** |
| 4 | no sentence stored | **As predicted**, in every way. |

## Against the success and failure criteria

Neither cleanly. L+n gives **all** of G's pieces, which is the success half; it **adds** pieces a reader would partly
call worse (`en_`, `rent`, `n_the_`), which is the failure half. So: what lands on others matters, but only as
**over-forming**. The local check never threw away a good piece; it just doesn't know when to stop.

## What this says

1. **The decision can be mostly local.** A piece that knows its own body, counts its own uses and its own naming cost
   finds every piece the global total finds.
2. **What's missing is one shared quantity: how crowded memory already is.** The cost a new piece puts on others is
   the number of uses around it times how much dearer naming gets. That is not something any one piece holds, but it
   is one number shared by everything, not a total recomputed over everything. Adding it to the local check would make
   it the same as G by construction, so there is nothing to test there; the open question is whether a shared
   "how crowded" signal is acceptable under cells first, or what natural thing would carry it.
3. **Streaming makes the small-buffer problem worse**, as C106 suggested: the first time a piece pays is usually too
   early.

## Givens to keep in mind

- The tally of every run in the text is still a table over the buffer. Only the decision was made local.
- L and L+n still pick the biggest saving among candidates that pass (rivals compared); S compares only among runs
  ending at the same moment.
- S reads the tail with held pieces in the order they formed, and tallies runs up to 30 symbols.
- Small texts written for the sketch, as in C106.

## Open

- What carries "how crowded memory is" to a piece, if anything? (A population's own fullness, a region's set point,
  something else.)
- Would S do better if a piece had to pay by some margin before forming, or if forming waited for rest?

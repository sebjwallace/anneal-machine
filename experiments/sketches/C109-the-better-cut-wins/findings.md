# C109 · The better cut wins: findings

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece (fixed by the population size), while a loose letter cost 1. So a familiar short piece
> ("the", say) could cost more to use than to spell out: it was never worth reading on its own, it counted as heat
> each time it appeared, and nothing that judged what pays could keep it as a piece. That is the wrong way round: an
> established piece should be the cheapest thing to reach for. C125 replaced the flat price with cost as surprise (the
> more familiar a letter or piece, the cheaper it is to use), and that fixed it. Under a flat price a good cut and a
> bad cut with the same number of pieces cost the same, which is part of why the better cut never won. Read the
> results here with that in mind: some may not depend on it, but anything about short pieces, what pays, or what
> counts as heat may.

Run: `node compete.js` (under a second; everything is in [out.txt](out.txt)); `node compete.js steps` also prints every
change on the second pass. Read [the hypothesis](hypothesis.md) first. In the code, the uses a piece is credited with
are counted on the reading after anneal (read, anneal, read again, count); that is the order the hypothesis describes.

## In short

**It failed.** The better cut never formed, so there was nothing for it to win against. The bad pieces from the first
buffer (`the_cat_sa`, `t_on_the_`, `_and_the_dog_sa`) are the ones reading still uses on the second pass. "the zebra sat
on the mat" is still read as `[the_zebra_]sa[t_on_the_]mat`. On the second pass **nothing changed at all**: no piece
formed, none was stored, none was brought back. Memory stopped learning once it could describe the text well enough.

The population size made no difference (N = 8, 16, 64 gave identical runs), because only 8 pieces ever formed. Storing
was never tested.

The mechanism itself works. Fed the reader as one buffer, it forms the C106 whole-text pieces (`_the_`,
`_and_the_dog_`, `sat_on_the_`, `_the_cat`, …) plus `sat_on_the_mat`, `sat_on_the_log` and `saw_the_cat`. The failure
is in how evidence arrives a buffer at a time.

## Why: two reasons, both shown by numbers

After both passes, on buffer 1 (described at a cost of 34.74 by the bad pieces), each rival was tried by hand
(`node why.js compete.js`, output in [out-why.txt](out-why.txt)):

| rival | reading with it | its body | total | against 34.74 |
|---|---|---|---|---|
| `sat_on_the_` | 34.74 | 4.47 | 39.21 | worse |
| `_sat_on_the_` | 34.74 | 5.47 | 40.21 | worse |
| `_the_cat` | 31.74 | 5.47 | 37.21 | worse |
| `cat_sat_on_the_` | 34.74 | 8.47 | 43.21 | worse |

1. **The price can't see where a cut falls.** `[the_cat_sa][t_on_the_]` and `[the_cat][_sat_on_the_]` are both two
   pointers, so they cost the same. A good cut beats a bad one only where the bad one doesn't fit: "sat" after
   something other than "cat" or "man". On the whole text there are enough such places, which is why the whole-text
   run cuts well. In one small buffer there aren't, so the good cut saves nothing (`sat_on_the_`: reading stays at
   34.74).
2. **The old piece is already paid for; a rival has to pay in full, from one buffer.** Even `_the_cat`, which does
   make reading cheaper (by 3), can't cover its own body (5.47) from one buffer. The pieces held never pay again. So
   whatever formed first is cheaper to keep, every time. This is incumbency: a sunk cost, not a better fit.

And the place where the good cut would pay ("the zebra sat on the mat") has "sat on the" only once. A piece needs at
least two occurrences in a buffer to form at all.

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | bad cuts form on the first buffer | **As predicted.** |
| 2 | by the second pass reading stops choosing them; better pieces formed from later buffers | **Wrong.** No better piece formed; the bad ones were chosen as often on the second pass as the first. |
| 3 | the zebra sentence no longer cut through "sat" | **Wrong.** |
| 4 | N = 8 too small, churn | **Not tested**: only 8 pieces formed; nothing was stored at any size. |

## Against the success and failure criteria

**Failure**: "the early bad pieces are still the ones reading uses on the second pass." Five of the eight pieces in
use cut inside a word.

## What this says

1. **Competition in reading isn't enough on its own.** For a better piece to win, it has to exist. With evidence a
   buffer at a time, it never earns its place, because each buffer alone shows too little and the incumbent never
   pays again.
2. **The better cut's advantage is spread thin over many buffers.** A good piece saves a little in many places; a bad
   one saves the same in the places it was formed from and nothing elsewhere. Seeing that difference needs evidence
   gathered across buffers.
3. Something has to **carry evidence for a piece that hasn't formed yet** from one buffer to the next, so a rival
   builds up the savings it would have made until they cover its body. That is a new mechanism, and it is not tried
   here (the owner to decide). It sounds close to the owner's latch, or to priming: a tentative piece, not yet
   lasting structure. Alternatively, incumbents could be made to keep paying for themselves (their body charged
   against recent uses), so a piece that stops being chosen stops paying. Either changes what "already formed" means.

## Givens to keep in mind

- Reading by cheapest description is a dynamic program over the buffer: bookkeeping, not cells.
- A candidate must occur twice in one buffer. The candidate list is built from this buffer alone; nothing is carried
  between buffers except the pieces.
- Small texts written for the sketch, as before.

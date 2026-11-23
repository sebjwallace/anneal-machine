# C127 · Spelled pieces: findings

Run: `node spelled.js <folder> <book> 8` (a few seconds a book; everything is in [out.txt](out.txt)). Read
[the hypothesis](hypothesis.md) first. The "C126 as it was" rows reproduce C126's "with the fixes" figures exactly.
`check/check.sh` still gives the same output as the Go engine (1,113 lines).

## In short

**The phantoms are gone. C126's conclusions stand, but *Buster Brown*'s reading figures were a little flattered.**
Held patterns that never occurred fall from 98 to 0 (*Buster Brown*) and from 123 to 0 (*Alice*). Energy falls 12% and
8%, but that fall is mostly bookkeeping: the phantoms were counted in memory and are no longer held as patterns. It is
not better learning. Reading on unseen text barely moves. Loose letters stay at 10% and 8%, and "the" is still read
inside a piece 98 to 100% of the time. On *Buster Brown*, words read whole slip from 46% to 43%, cuts at word
boundaries from 56% to 54%, and unseen cost per letter rises from 0.655 to 0.672. On *Alice* they hold or edge up
(50 to 51%, 56%, 0.670 to 0.668).

## The figures

| | *Buster*: C126 | spelled | + credited once | *Alice*: C126 | spelled | + credited once |
|---|---|---|---|---|---|---|
| held patterns that never occurred | 98 | 0 | 0 | 123 | 0 | 0 |
| letters held | 6,504 | 5,473 | 5,166 | 7,392 | 6,839 | 6,226 |
| different patterns held | 1,357 | 1,158 | 1,094 | 1,650 | 1,510 | 1,387 |
| energy = memory + unseen | 10,231 | 9,278 | 9,051 | 14,987 | 14,306 | 13,802 |
| memory | 6,115 | 5,094 | 4,831 | 7,233 | 6,605 | 6,067 |
| unseen | 4,116 | 4,184 | 4,221 | 7,754 | 7,700 | 7,736 |
| unseen cost per letter | 0.655 | 0.666 | 0.672 | 0.670 | 0.665 | 0.668 |
| letters loose on unseen text | 10% | 10% | 10% | 8% | 8% | 8% |
| words read whole | 46% | 44% | 43% | 50% | 52% | 51% |
| cuts at a word boundary | 56% | 54% | 54% | 56% | 57% | 56% |
| clean pieces | 37% | 35% | 34% | 34% | 36% | 34% |

## What it means

**Phantoms were a bookkeeping error, not a hidden engine.** They were almost never read, so removing them leaves
reading as it was. Their main effect was on the accounts. They took about a tenth of memory's letters. They were
offered as anneal partners, they were counted by the energy rule, and now and then they made a stretch look already
held. Any experiment from C123 to C126 that reported memory size or energy overstated memory by roughly that share.

**The energy fall here should not be claimed as progress.** C126 counted phantoms as patterns. C127 does not count
compositions as patterns at all, since they spell nothing. So most of the 8 to 12% is a change in what is counted. The
honest comparison is reading on unseen text, and that is flat to slightly worse on *Buster Brown* and flat to slightly
better on *Alice*. These differences are about the size of the run-to-run drift any small change causes, because
partner choice reshapes what is learnt. The safe reading is that C126's results do not depend on the phantoms.

**Crediting once makes familiar pieces slightly less familiar.** With the double credit gone, a stretch seen again
adds a use to the piece and takes one from each of its letters. Pieces are a little dearer than before, and fewer
stretches are recognised as seen again (640 to 580 in *Buster*, 1,224 to 991 in *Alice*). Memory shrinks further, but
unseen text costs a little more. The double credit had been a small, unprincipled boost to familiarity. This is the
honest count.

**The two-letter point from the audit is not a bug.** A two-letter hot stretch can never find an anneal partner,
because partners are found by three-letter runs. But a pair cannot be split into anything smaller than letters, so
nothing is lost. Pairs such as "th", "es" and "re" being read often is a real finding about what the engine keeps, not
a fault. It is left as it is.

## What remains open

Memory has no limit: nothing is ever forgotten. Single loose letters never count as heat. Partner choice is still ad
hoc: one partner, the top 40 by shared three-letter runs, then the longest shared run. Fragments such as "bu", "rri"
and "igh" are still among the most read pieces, which is the coverage-against-clean-pieces trade-off seen since C124.

# C162 · Abstraction from competition (a taste): findings

A taste, by agreement: `node taste.js > out.txt 2> frames.txt`, under two minutes. Read [the hypothesis](hypothesis.md)
first. Engine: C159's copy, plus one change to competition (`tieOverlap`, on the program store only).

## In short

**A change in the engine alone, with no overlaps stored, gets a good part of the way.** When tied rivals all agree on
what comes next, that now comes on; what they disagree on stays held. With episodes only (each frame remembered with
its full view, as C159), right answers rose from 7 to 24% with the old competition to **24 to 59% at 8 worked sums**,
and **44 to 63% at 24 sums**. "Nothing recalled" fell from 87% to 63% to 48%. **No wrong or broken frame was ever
recalled** (0 of 960), so the risk named beforehand (walking into a mixture of the two frames) didn't show.

**It's weaker than C160's overlap rule, but it scales the right way.** The rule got 69 to 88% at 8 sums, but by
storing extra structure that grew with the square of what was seen, and its gains flattened. Here nothing extra is
stored, and the gain from 8 to 24 sums is still large. Abstraction is happening in the moment of recall, as the overlap
of what tied memories agree on, rather than being stored in advance.

**Still, half the sums recall nothing at 24 sums.** What's left is likely ties that the overlap can't resolve: an
episode of one frame drawing level with an episode of the other (a multiplication that shared a few digits with the new
page, say), where they disagree on the next part, so nothing passes. That reading wasn't traced sum by sum.

## Results

| arm (80 sums of each kind over 4 seeds) | + | − | × | long row | nothing recalled | wrong or broken frame |
|---|---|---|---|---|---|---|
| old competition, 8 sums (C159) | 7.5% | 7.5% | 23.8% | 13.8% | 86.9% | 0 of 320 |
| **ties pass what all agree on, 8 sums** | 23.8% | 31.3% | 58.8% | 35.0% | 62.8% | 0 of 320 |
| **ties pass what all agree on, 24 sums** | 43.8% | 45.0% | 56.3% | 62.5% | 48.1% | 0 of 320 |
| for comparison: C160's overlap rule, 8 sums | 80.0% | 80.0% | 87.5% | 68.8% | 20.6% | 1 of 320 |

Which frame was recalled, per kind, is in [frames.txt](frames.txt). Every frame recalled was the right one for its kind.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | "nothing recalled" largely disappears; right answers well above C159, comparable to or better than C160's rule | **Partly:** well above C159, and improving with more sums, but "nothing" is still about half at 24 sums, and below C160's rule. |
| 2 | wrong frames stay rare | **Holds:** none in 960. |
| 3 | the risk: where the frames agree on parts, ties let a mixture through | **Didn't happen:** no broken frames. |

## The ledger

**Given:** as C159 (the two frames as already learned, the signs' meanings, binding each frame with its start view).
**The engine:** as C159, plus the competition change: a general rule about ties, nothing to do with arithmetic.
**Disclosed:** one run. The change was not checked against earlier experiments' results (it's off by default, so they
are unaffected), and whether it would break anything there is an open question.

## What it suggests

Abstraction can come out of competition: memories that tie over incidental detail still pass on what they agree on.
It's real, cheap and stores nothing, and it improves with experience. What it doesn't yet do is break ties between
memories that disagree. That needs context to separate them by more than the incidental overlap of digits.

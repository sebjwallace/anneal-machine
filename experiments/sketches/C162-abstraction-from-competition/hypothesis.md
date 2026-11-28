# C162 · Abstraction from competition (a taste): hypothesis

Follows [C159](../C159-context-picks-the-frame/findings.md) to [C161](../C161-more-sums-and-refining/findings.md). Each
of two frames (reading, holding) was remembered with what was in view whenever it worked. Context picked the right
frame whenever it picked at all, but episodes of the same frame tied over their incidental digits and recall gave
nothing. C160 and C161 kept overlaps with a **rule in the binding step**, which helped but was a mechanism designed
piece by piece. The owner asked for one more experiment, on **abstraction coming from competition itself**.

## The idea

A change to the engine's competition, general and nothing to do with arithmetic: **when rivals tie, whatever every one
of them would bring on still comes on, and whatever only some would bring on is held back.** Today a tie brings on
nothing. The owner's earlier idea was that competition between overlapping assemblies pulls activity to their overlap,
so intersection might come almost free. This is that, at the moment of a tie.

Why it should help. Episodes of the reading frame tie because they remember different digits, but every one of them
wants the same next part of the frame. So the part they agree on goes through, the digits they disagree on don't
matter, and the frame completes. Between the reading and the holding frame, the next parts differ, so a tie between
them still brings on nothing. Context still has to separate them by support, as before.

**No overlaps are stored at all.** The binding is C159's (the frame with its full view). The only change is in the
engine.

## Setup

C159's taste (the two frames given as already learned, the signs' meanings given, binding each with its start view),
with three arms: the old competition (C159, for comparison); the new competition at 8 worked sums; and the new
competition at 24 worked sums. 4 seeds; 20 test sums of each kind; recall from the cue plus the page's view.

**Given, declared:** as C159. **The engine:** as C159, plus the change to competition (a flag, `tieOverlap`, on the
program store only).

## Predictions (fixed before running)

1. **"Nothing recalled" largely disappears** with the new competition, and right answers rise well above C159's 7 to
   24%, comparable to or better than C160's overlap rule, with no overlaps stored.
2. **Wrong frames stay rare.** A tie between the two frames still brings on nothing, since they disagree on the next
   part, so context still decides between them.
3. **The risk:** where the two frames agree on a part (they share several parts later on), a tie between them now lets
   those parts through, and recall may walk into a mixture of the two frames. If so, wrong or broken frames will show up.

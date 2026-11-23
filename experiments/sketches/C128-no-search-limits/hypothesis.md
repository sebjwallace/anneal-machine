# C128 · No search limits: hypothesis

Step 1 of distillation [D-03](../../../docs/distillation/D-03-buffer-annealing.md), removing V7.

C127's learning limits its search in two places. When choosing a partner for anneal, it looks only at the 40 held
pieces that share the most three-letter runs with the hot stretch. And it stops annealing what lies before and after
the shared run once it has gone 30 levels deep. Both numbers were chosen for speed, not taken from the world, so they
are crutches (CTR-2 DEF-5) unless the result doesn't depend on them.

**Change:** every held piece sharing a three-letter run is a candidate partner (the one sharing the longest run wins,
the first such on a tie), and there is no depth limit; recursion ends by itself, since each level works on a shorter
stretch. Everything else is as C127's final setting (spelled pieces, a stretch seen again credited once).

**Prediction:** the result survives. Energy and every reading measure within 2% or 2 points of C127 on both books.

**Survives if** both books are within those bounds; **falls if** either is not, which would mean the limits were
shaping what is learnt.

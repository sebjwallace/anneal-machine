# C76 · Composition by binding a sample: hypothesis

The owner's idea (14 November 2026). Parts that fit together, such as the rows and diagonal of a Z, are composed not by
wiring every cell to every other but by binding a small sample of their active cells: each sampled cell grows one new
segment holding links to the other sampled cells. Later, if one part completes, its sampled cells wake the binding,
which wakes the other parts' sampled cells, and each part completes itself. A cell is an OR of its segments; each
segment is an AND of its links.

With segments firing at two active links (the bar from the prices), the sample needs **two cells from each part**: with
one, a part that comes back lights only one sampled cell, and no binding segment ever sees two. **Hypothesis:** two
per part is the smallest binding that completes, and it is also the cleanest, because a segment with fewer links fires
less often by chance. Predictions in [PREREG.txt](PREREG.txt).

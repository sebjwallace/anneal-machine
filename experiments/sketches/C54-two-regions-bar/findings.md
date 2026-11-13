# C54 · Findings (out.txt; 30 questions each)

| pixels missing | visual fixed, abstract fixed | visual moving, abstract fixed | visual fixed, abstract moving | both moving |
|---|---|---|---|---|
| 0 of 5 | 0 routes (no way) | 0 (no way) | **30 of 30** | **30 of 30** |
| 1 of 5 | 0 (no way) | 0 (no way) | **26 of 30** | **26 of 30** |
| 2 of 5 | 0 (not recognised) | 0 (no way) | 0 (not recognised) | **6 of 30** |

**Each region's moving bar does its own job.** The abstract region's is what finds a route never walked: with it fixed,
the answer is always "no way", even when both views are perfectly clear. The visual region's is what recognises a view
too obscured to recognise normally: with 2 of 5 pixels missing, nothing is recognised with it fixed.

**Only with both moving does the whole question get answered** across all three levels of obscuring. No wrong routes
anywhere: when it answered, the route was the true one (bench → gate → fountain → pond → junction → bridge → hill →
meadow → oak).

**Limit.** With 2 of 5 pixels missing, both views were read correctly only 6 times in 30: three pixels often fit
another landmark as well, so the view is misread or ambiguous. Those questions are counted as not recognised.

Visual region: the engine as it is. Abstract region: C53's copy. Nothing in the core.

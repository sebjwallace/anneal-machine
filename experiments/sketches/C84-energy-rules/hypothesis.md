# C84 · Energy rules at the level of cells: hypothesis

Written 15 November 2026, after C82 and C83 and a review of every use of heat in the project. That review reduced heat to
one idea: **heat is where what is active and what is held disagree**, in three shapes: something there that nothing
holds (unheld), something held that isn't there (unthere), something held twice (a tie). The energy rule is the missing
half of that: structure that never earns its keep should go, and nothing says when.

**The candidates (each a copy of the core with C82's loosening, unless the core):**
- **squeeze:** memory is finite (CTR-1 CON-14). When a column needs a fresh cell and all its cells hold segments, clear
  the least-backed cell (fewest links) and reuse it, instead of growing another memory on top of it.
- **used:** squeeze, plus a whole wholly seen again fills in one missing link per cell, up to fully linked. Backing then
  comes from use, with a natural ceiling and no counter.
- **yardstick:** squeeze, choosing the victim by a count of how often each cell has won for a memory. This breaks
  CON-9 on purpose, to show how close the number-free rules get.
- **fade** (added after the first development run, see PREREG): used, plus a segment that brings back a cell that isn't
  there loses one link from the cells that woke it. Links are lost by claims not met and won back by wholes seen.

A third candidate from the conversation, "judged by the arc" (keep a change if the heat there is lower next time), was
dropped before building: it needs a time window, which would be a hand-set number, or it becomes used-or-lost.

**Hypothesis:** recurring objects keep their structure and recall; one-off noise is squeezed out as cells run short, so
structure stops growing; the three shapes of heat fall over the stream.

**What the development seed showed instead (before the PREREG):** no cell was ever cleared. A novel input is never
stored as new: any two of its columns wake an old memory, and the cut and tie rebuild it from fragments of the past. So
the volume never runs short of cells, and growth comes from cutting and tying, not from capacity. Where noise shares the
objects' columns, it is tied from their fragments, and then every object chains to every other.

Predictions in [PREREG.txt](PREREG.txt).

# RM-2 · Segments

**For:** keeping memories apart within a cell, so one cell can serve many memories.
**Serves:**
- CTR-1 CON-9 (evidence counted per memory);
- CAP-3 (auto-associative memory);
- CON-7 (don't guess);
- DEF-13 (segment).

## The idea
A cell is reused by every memory that has the same input in the same context. If it pooled all its links, evidence from
different memories would add up and wake it for memories that aren't there. So a cell's links are split into
**segments**:
- a segment holds one memory's links: an **AND** of those cells;
- the cell is active if any segment fires: an **OR** of its segments.

A segment is not a cell: nothing links to it, and it never shows downstream.

## Data (core)
```
segment:  belongs to one cell; holds links (a set of sources); has no strength and no label
source:   a cell, or what a cell was a moment ago (its "was", RM-1)
feeds:    for each source, the segments that hold a link from it     # so only segments with an active input are touched
```
**What a segment does follows from what it is wired to,** never from a mark on it:
- wired to **cells**, it completes the present (an assembly's segment, RM-3, RM-7);
- wired to **what cells were**, it predicts the next moment.

Counting from what is active now never reaches a segment wired to the moment before, and counting from the moment before
never reaches one wired to now, so prediction and completion keep apart by wiring alone. This is how cortex keeps
context and input apart: by where on the cell they arrive, not by labels. (C81 found they must be kept apart; it did so
with labels, `seq`, `part`, `bind`, on each segment. Those were a patch, CTR-2 DEF-6, and are gone from the core.)

## What it does (core)
```
count(active sources):
    for each active source u:
        for each segment s that holds a link from u:      # via the feeds: work follows what is active
            s.count += 1
    for each active cell c:
        for each segment s on c that an active source reached:
            s.count += 1                                   # the cell is itself one of its memory's members
    a segment fires when s.count >= 2                      # two of its memory's cells active, its own included
    a cell's support = the largest count on one of its firing segments
    a segment's share = s.count / (its links + 1)          # how much of its memory is active (RM-5)
```
- **The cell counts itself** (the "+1 if the cell itself is active" of this model's support, read into firing too).
  So a pair (two cells, one link each) fires when both are seen, and is never completed from one: the bar of two holds
  for pairs as for any assembly. A segment wired to the moment before gets no such count: its cell is no member of that
  moment.

**Growing a segment:** each cell of an assembly being tied grows one segment over a sample of the others (RM-3, RM-7);
a winner the moment before did not predict grows one over what that moment's winners were (RM-1).

## Why two
The bar of two comes from the prices (RM-9). Describing two items as one costs less than two separate items, and one
item saves nothing. So an assembly of one cell can never pay, and a segment fires at two of its memory's cells. It is not
a fraction of the segment's size and not a tuned number. **Caveat:** derived from today's bill over placements (a use of
an assembly costs about 1.5, an unexplained item 1); not yet re-derived in cells and links (RM-9, open).

## Rules a rebuild must keep
- **Counts are per segment, never summed in the cell.**
- **No strengths, weights, decay or labels.** What a segment does is read from what it is connected to.
- **Segments should be kept or removed by the energy rule** (RM-9), not yet defined at the level of cells: today every
  segment grown is kept, except those the cut removes (RM-8). A known gap (CTR-1 CON-1).
- **Only segments with an active input are touched:** work follows activity (CTR-1 CON-18).

## Evidence
- C35: pooling gave about 80% wrong recalls with five things stored; segments with competition never recalled the wrong
  thing.
- C71/C73: strict segments (75% of links) never completed from half a cue; a bar of two plus competition did.
- C81: sequence and completion must be kept apart.
- The core (15 November 2026): a pair is recognised when both its cells are seen and never completed from one; a whole
  made of known pairs is composed from them instead of being stored again as a copy; prediction and completion kept
  apart by wiring, with every result unchanged when the labels were removed. In `src/test/`.
- The visuals [segments](../visuals/segments.html) and [segments-zoom](../visuals/segments-zoom.html).

## Open
- The bar of two in cells and links (RM-9).

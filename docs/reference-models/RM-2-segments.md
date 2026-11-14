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

## Data
```
segment:  belongs to one cell; holds links (a set of other cells); has no strength
          (optional: kind = 'part' or 'bind', see RM-7; a label local to the segment)
index:    for each cell, the segments that hold a link from it     # so only segments with an active input are touched
```

## What it does
```
count(active):
    for each cell u in active:
        for each segment s that holds a link from u:     # via the index: work follows what is active
            s.count += 1
    a segment fires when s.count >= 2
    a cell's support = the most of one memory's cells active =
        max over its firing segments of (s.count + 1 if the cell itself is active else s.count)
```

**Growing a segment:**
- **For a new memory:** each of its cells grows one segment over the memory's other cells.
- **For a binding:** each sampled cell grows one segment over the other sampled cells (RM-7).

## Why two
The bar of two comes from the prices (RM-9). Describing two items as one costs less than two separate items, and one
item saves nothing. So an assembly of one cell can never pay, and a segment fires at two active links. It is not a
fraction of the segment's size and not a tuned number.

## Rules a rebuild must keep
- **Counts are per segment, never summed in the cell.**
- **No strengths, weights or decay.** Segments are kept or removed by the energy rule (RM-9).
- **Only segments with an active input are touched:** work follows activity (CTR-1 CON-18).

## Evidence
- C35: pooling gave about 80% wrong recalls with five things stored; segments with competition never recalled the wrong
  thing.
- C71/C73: strict segments (75% of links) never completed from half a cue; a bar of two plus competition did, without
  blending.
- The visuals [segments](../visuals/segments.html) and [segments-zoom](../visuals/segments-zoom.html).

## Open
- Whether whole-set segments (every member) or sampled segments suit memories best at scale. Sampled segments needed
  strengths to select good samples in the other repository; whole-set segments, and samples taken from comparison, do
  not.

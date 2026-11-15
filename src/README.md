# src

The engine, rebuilt from scratch from the [reference models](../docs/reference-models/README.md) and judged by the
[contracts](../docs/contracts/README.md). Plain JavaScript modules, no dependencies.

```
npm test        # the engine's tests (node:test)
npm run view    # then open http://localhost:8000/view/
```

| file | what |
|---|---|
| `engine/volume.js` | `Volume`: a number of columns (the owner's word; previously "region"). Receives one input per moment: light (RM-1), settle (RM-4, RM-5), compete in each column (RM-5), learn (RM-1), tie (RM-3, RM-7), cut (RM-8). |
| `engine/column.js` | `Column`: the cells over one input; the column is identity, the cell context. A fresh cell is the one with the fewest segments. |
| `engine/cell.js` | `Cell`: holds its segments. `Was`: the cell as it was a moment ago. A cell's output reaches segments by both routes; which one a segment is wired to is what makes it predict or complete. Each knows which segments hold a link from it, so counting follows what is active (CON-18). |
| `engine/segment.js` | `Segment`: one memory's evidence on one cell, a set of links and nothing else; fires when two of its memory's cells are active. `Segment.sampleSize(n)`: how many links each cell of an assembly samples. |
| `engine/sampler.js` | `Sampler`: seeded draws, for sampled links and the handle taken from each part. |
| `engine/tally.js` | `Tally`: one count of segments from a set of active sources (cells now, or as they were); support, firing and competition are read from it. |
| `engine/moment.js` | `Moment`: a report of what one input did, as cells, with each assembly tied and cut made, and its heat in three shapes (`heat`: unheld, unthere, twice; RM-6). The volume never reads it back. |
| `view/` | The viewer: the volume as a grid of columns, run over time, in layers that switch on and off. Everything is drawn as an assembly: an outline round its cells, nested round the assemblies it was tied from. `structure.js` reads that nesting, and which assemblies are shared or cut, from each moment's report (the viewer replays every moment); the volume itself holds no such list. `roles.js` reads what a segment does from its wiring. |
| `test/` | The engine's tests. |

## Against the contracts today
**Clean:**
- No list of assemblies: an assembly is only its cells' segments (CTR-1 CON-19, CTR-2 CON-8).
- Cells carry no numbers. "Fewest segments" is read from a cell's own structure (CON-9).
- Work goes only through segments fed by active cells (CON-18).
- No tuned numbers, no round limit in settling (it ends by itself). Sampling is seeded, so runs repeat exactly.
- Parts are read from which segments fire and what they link, not handed in (RM-7).
- No labels on segments. What a segment does follows from what it is connected to: wired to what cells were, it
  predicts; wired to cells, it completes. A composition's segments are like any assembly's. (The `seq`/`part`/`bind`
  kinds from C81 were removed on 15 November 2026: a patch, CTR-2 DEF-6.)
- One kind of thing, the assembly, and one way of growing it: when a moment's winners are not already one memory,
  they are tied into one, from a handle on each part (two of its cells one of its segments ties; a cell nothing
  explains is its own part). New cells are all taken (an assembly); known parts give a handle each (a composition),
  so a whole costs what its parts number, not what they hold. Composition and decomposition happen to assemblies.

**Declared gaps:**
1. **No energy rule at the level of cells (RM-9; CON-1).** Every segment grown is kept. The largest gap.
2. **The bar of two** is carried over from the bill over placements, not re-derived in cells (RM-2).
3. **One global level of support** in settling (RM-5, open).
4. **Context is the moment before only** (RM-1, open).
5. **The present before the past.** In a column, assembly support is weighed before sequence support (PRN-5). The
   models leave open how the two meet, so this is a choice.
6. **By fit, or fresh.** A cell an assembly supports wins a burst over a fresh one, so the same input after a new
   context can reuse its cells and lose that context (cells first, §3.10, open).
7. **The cut (RM-8)** is made when a memory is wholly read as what fits (won) and what is not there (brought back),
   each can hold an assembly, and the input has a remainder of its own that can too (RM-8 asks this of F and P; it
   is asked of U here because the input is rebound as F + U, and so plain recall from part of a memory never cuts).
   The memories are read from the active cells, grouped through their firing assembly segments. Cutting is
   unconditional until RM-9; RM-8's "keep the cut only if it pays" is the gap.
8. **Cells per column** is fixed architecture (CON-3).
9. **The sample size, 2⌈ln n⌉ links per cell** (random-graph connectivity, doubled for the bar of two), is a proposed
   rule chosen by the owner from a measured comparison (three rules at six sizes, 1,000 samplings each, 15 November
   2026), not yet shown in an experiment. At n ≤ 4 it is every other member. It applies to every tie, over the cells
   tied. **A handle** (two cells a segment of the part ties) is this engine's reading of RM-7's "two of its active
   cells": two drawn freely can fall in different pieces of a part and wake neither (shown on the square of four
   quarters: before, in one run, ABEF brought back 6 of the other 12 cells; with handles, every quarter brings back
   all 12 in 200 of 200 seeds).
10. **Junctions: a cell whose memory is wholly seen wins its column,** whatever else does. Where two memories meet in
    one column (D0 and D1 in the Z), both cells win: taking one does not rule the other out (RM-5's "rivals that can
    both be right", proposed there and untested). "Wholly seen" is a firing segment with every member active and every
    link in a lit column. A true tie, a cue fitting two memories neither wholly there, is still refused (CON-7).
    In recall the same holds: two cells of different memories in one column are rivals only when woken by the same
    active evidence (alternatives, refused); woken by different evidence, both are brought back (a recalled junction).
11. **When to tie** (RM-7, open): here, whenever a moment's winners fall into two or more parts. A partly new input
    (AB known, EF new) is tied as one, so EF gets no assembly of its own until a cut finds it.
13. **Memories compete for a whole (RM-5), read from topology.** A segment's evidence is its members active and seen
    (not brought back: PRN-5). Where that evidence is a whole of its own (each of its cells has a firing segment lying
    within it, as the pair AB), memories holding all of it are alternatives built on it (AB + CD, AB + EF), and a
    segment holds back when an alternative has a larger share of its memory active. Where it is not (A0 B0 as a sample
    of ABCD), it is part of something larger, and nothing competes. RM-5 states the competition for bindings, by their
    label, over one level; this rule is this engine's, to be agreed into RM-5. A part that is exactly a whole of its
    own brings back only that whole when its own alternatives are wholly seen.
14. **Which part wakes an outer whole depends on its handle.** A composition is woken through the handle on each of its
    parts. After AB CD ABCD ABEF GH ABCDEFHG, the outer whole's handle on its big part is F0 A0 (tied by ABEF): ABEF
    brings back GH, ABCD does not (it gives only A0, and ABEF, an alternative to ABCD, is held back). Open.
12. **A completing segment counts its own cell** when it is active (RM-2's "+1 if the cell itself is active", read
    into firing as well as support): the bar of two is two of a memory's cells active, the cell included. So a pair is
    recognised when both are seen and never completed from one. RM-2 states the +1 for support only; reading it into
    firing is this engine's, and should be agreed into RM-2.

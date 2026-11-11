# Findings C21: cells as coordinates (sparse codes on primitive columns)

*Code: `models/codes.js`, built on a learnt C20 model (`models/flow.js`; its learning is unchanged). Runner: `sketches/C21-codes/run.js`. Page: `sketches/C21-codes/viewer.html` (built by `build.js`). Seed 4242, 600 scenes.*

## The design (agreed terms: centre, offset)
- **Columns:** only the primitives (C20's layer-1 parts), 22 of them. Composites are not columns.
- **Cells:** each column's cells form a grid of offsets (23×23 here), stacked in floors.
  - Floor 0: where an instance is, measured from the centre of attention (the middle of the scene). One cell per instance.
  - Floors above: assemblies.
- **Assemblies:**
  - A composite is one cell per part, at that part's offset from the composite's own centre.
  - A composite of composites takes a fixed sample of 3 cells from each child, moved to its own centre and floor (floor = its level).
- **Explaining:** scenes are explained with the best explanation: the strongest few opening placements are each tried first, the rest is filled greedily, and the cheapest whole explanation is kept. This is an option added to `flow.js`, off by default, so C20 is unchanged.

## Results
- **Two sticks side by side:** two cells in the stick column, at (−1,0) and (+1,0), either side of the centre. Before the better explanation, the two sticks were explained as one box with 2 wrong pixels; that is the same greedy fault as the flag + flag case.
- **The same thing anywhere:**
  - A house at 40 random places gives an identical assembly every time (4 cells).
  - Its floor-0 cells differ with position.
- **Two houses side by side:**
  - Both are recognised as the house, with identical assemblies (same kind of thing).
  - Their floor-0 cells share nothing: left house at x −3..−2, right house at x 3..4.
  - So "what" and "where" are kept apart, with no binding problem in this case.
- **Similarity comes from shared cells** (comparing on one shared floor):
  - corner is wholly inside box (1.00);
  - block and box share half (0.50);
  - plus and house share half (0.50).
- **A never-seen object** is held as a new assembly in existing columns:
  - the arrow's closest known assembly is the house (0.50, the shared roof);
  - the tower (two boxes) shares nothing with any learnt assembly.
- **Sampling:** rebuilding pixels from an assembly recovers
  - 68% of the thing with 1 sampled cell per child;
  - 94% with 2;
  - 100% with 3.
- **Sparse:**
  - A scene of about 15 pixels becomes about 5 "where" cells plus 4 assembly cells.
  - Over 300 scenes, 676 distinct cells were used out of 46,552 available.
- **Collisions between levels:** if all composites shared one floor, 3 of 28 pairs at different levels would share cells; with a floor per level, none do.
- **Best explanation vs greedy** on 300 fresh scenes: heat 0.007 → 0.000, and flag + flag is always clean. It costs about 12× more time per scene.

## Notes and open questions
- The primitive set still includes C20's memory residue (odd scattered parts), so some columns are not meaningful shapes.
- Floors per level keep levels apart but stop a house sharing cells with a flag-level thing. A shared floor allows that, with occasional collisions. Which one we want is a design choice.
- Position codes are same-or-different: a neighbouring offset is a different cell, with no overlap. Graded overlap (a small blob of cells) is the next refinement if variation and noise need it.

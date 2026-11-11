# Findings C20: energy with the flow

*Model: `models/flow.js` (a copy of C19's `instances.js`, which stays frozen). Runner: `sketches/C20-flow-energy/run.js` (`MODEL=instances` runs C19 on the same scenes). Viewer in the same folder. 12x12 world, as C19; 600 scenes, rest every 98.*

## What changed from C19
1. **One currency, taken from the world.** A loose or wrong pixel costs 1. A stored pixel costs 1. A placement costs 1 + log2(units+1)/log2(pixels in world), which is the cost of naming which unit, measured against naming one pixel (about 1.6–1.9 here). Nothing is hand-set; the old PART_COST = 1 is gone.
2. **Total energy = structure + flow.**
   - Structure: stored pixels, plus every placement listed in memories and composites.
   - Flow: the cost of explaining the last 100 scenes since the last rest, using what exists now: placements, plus pixels left over, plus pixels wrong.
   - Memories stay exact, so older scenes keep counting.
3. **Every rest move is measured.**
   - Candidates are proposed cheaply from the placement lists.
   - Each one is applied, the flow is re-explained, and the move is kept only if total energy fell. Otherwise it is undone.
4. **Two new moves, the opposites of the old ones.**
   - Dissolve: a composite is folded back into its users.
   - Fuse: a composite becomes one plain part again.
5. **Unused units go**, like duplicates and pass-throughs: they are always-hot structure.
6. **Awake explaining gives the same answers, faster.** It is lazy greedy: a placement's gain can only fall as the scene fills, so only the top candidate is re-scored.

## Results (three seeds; C19 → C20 on identical scenes)
| | seed 4242 | seed 11 | seed 77 |
|---|---|---|---|
| units | 70 → **30** | 93 → **29** | 80 → **19** |
| depth (layers) | 6 → **4** | 6 → **4** | 6 → **4** |
| crumbs (1–2 px parts) | 13 → **4** | 20 → **3** | 14 → **2** |
| description length, 300 fresh scenes (dictionary + explaining) | 1682 → **1407** | 1851 → **1408** | 1755 → **1276** |
| heat on fresh scenes | 0.007 → 0.007 | 0.011 → **0.002** | 0.005 → **0.001** |
| one unit per copy (known things) | 88% → **93%** | 77% → **89%** | 82% → **95%** |
| two copies of a never-seen object, heat | 0.05 → **0.00** | 0.04 → **0.00** | 0.04 → **0.00** |

- **Still no duplicates.** All 8 shapes and 3 objects are recovered as single units, and two houses are the house unit placed twice (heat 0).
- **Shapes sit lower:**
  - chevron, bar, stick and diag are plain parts (L1), not wrappers;
  - house is at L4, not L5–L6.
- **What the moves did (seed 4242):** 257 moves tried, 100 kept, 157 undone.
  - Of the kept moves: 79 decompose, 2 compose, 19 dissolve, 0 fuse.
  - Many compositions that C19 kept were measured here and refused, or later dissolved: they saved a placement on paper but did not pay in the flow.
- **Rest is slower:** 6.2 s in total over 7 rests, against C19's 2.2 s. Each candidate re-explains 100 scenes.

## Notes and open problems
- **Memory residue.** About 12 bottom-layer parts (64 pixels) are odd scattered leftovers that fresh scenes never use. They exist only because memories are kept exactly: the remainder of a stored scene after its known things are factored out. They are cheap, but they are not shapes. A memory that could hold loose pixels (as the flow already does) would let these go. The catch: a thing seen only once would then never become a part. Worth deciding deliberately.
- **Rest cost grows with unrested memories.** After 1,200 scenes with no rest, one rest step takes about 0.8 s. This is the "incremental re-checking" item, later in the order.
- **Layers:** depth now comes only from compositions that pay in the flow, which is the "layers only when they lower heat" principle, measured rather than assumed.

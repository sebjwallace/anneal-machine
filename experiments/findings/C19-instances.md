# Findings C19: multiple instances in one scene

*Model and world: `models/instances.js` (a copy of C18's `shift.js`, which stays frozen). Runner: `sketches/C19-instances/run.js`. Viewer in the same folder. 12x12 world; half the scenes hold 2 or 3 copies of one thing (sometimes with one more). Rest every 98 flashes. 600 scenes.*

## What changed from C18 (each removes a limitation; nothing added)
1. Explaining: a unit may be placed more than once in a scene (C18 allowed each unit once).
2. Composing: a memory is also compared with itself, so an arrangement repeated inside one scene is found.
3. Composing: every occurrence of an arrangement is counted (and replaced), not one per memory.

## Results
- 70 units (layers 23 / 20 / 15 / 8 / 3 / 1), 77 memories, energy 395; rest took 2.1 s in total over 7 rests.
- **No duplicates**; all 8 shapes and 3 objects recovered as single units.
- **Two houses: the same house unit placed twice, heat 0.00.**
- First sight, scenes with 2 or 3 copies of a known thing: heat 0.02; in 88% one unit explains every copy (the rest are explained another way, for example two "twins" as four blocks).
- First sight, two copies of a never-seen object (tower, arrow): heat 0.05; the same known units reused for both copies in every case.

## Notes
- More bottom-layer fragments than in C18 (23 parts), from a bigger world and more memories.
- Everything the machine does is still one of: explain (place units anywhere), store a surprise, and at rest lower energy by collapsing duplicates, factoring shared pixels, or composing recurring arrangements. Nothing in it knows about shapes, objects or copies.

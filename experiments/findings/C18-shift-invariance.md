# Findings C18: learn once, recognise anywhere (shift-invariant decomposition and composition)

*Model and world: `models/shift.js`. Runner: `sketches/C18-shift-invariance/run.js`. Viewer in the same folder. A 10x10 world; scenes of 1 to 3 things at random positions: 8 shapes (block, plus, corner, box, chevron, bar, stick, diagonal) and 3 objects (house = chevron on a box, flag = stick + block, twins = two blocks). Held out: tower (box on a box), arrow (chevron over a stick).*

## Design
- Parts stored once, in their own frame. Memories and composites hold **placements** (unit + offset), so a composite keeps its children's relative positions.
- Awake: units placed anywhere explain a scene; a new memory when more than 10% is left.
- Rest, decompose: parts compared at every shift, including against themselves (repeats inside one memory). The shared piece becomes a part. The original either has its users rewritten, or **becomes a composite of its pieces** (its users unchanged): whichever lowers energy more.
- Rest, compose: arrangements recurring in memories and in the scenes since the last rest (replayed, as the core's rest replays) become composites.
- Energy = pixels stored + 1 per placement listed. No new settings.

## Results (150 awake scenes, then one rest)
| | units per layer | memories | energy | new scenes: heat (units) | scenes with a never-seen object: heat (units) |
|---|---|---|---|---|---|
| awake only | 59 | 59 | 712 | 0.01 (1.77) | 0.08 (2.80) |
| after rest | 7 / 12 / 2 | 59 | 171–177 | 0.01 (1.84) | 0.06 (2.80) |

Rest: 47 steps, about 0.6 s. With 2% noise: 136 memories, energy 1,891 → 596, all shapes and objects still recovered, new scenes heat 0.00; rest took about 20 s.

**Recovered as single units: all 8 shapes and all 3 objects.**
- flag = stick + block (layer 2); twins = block + block three columns apart (layer 2); **house = box + chevron (layer 3**, because the box is itself a composite).

First round (users always rewritten, composition over stored memories only): all 8 shapes recovered as parts, but flag and twins stayed whole parts and house was not found. Two fixes: let a part become a composite of its pieces; let composition count the replayed awake scenes.

## What it showed
1. **Shift invariance is solvable by comparison at rest:** every shape learnt once and recognised anywhere, including twice in one scene.
2. **Objects become composites with relative positions**, and composites build on composites (house at layer 3).
3. **Composition needs what happened since the last rest,** not only stored memories: scenes explained while awake leave no memory, so their recurring arrangements must be replayed.
4. **The bottom gets crumbly:** with cheap wrapping, shapes split further into shared fragments ("##", single pixels); the hierarchy is fragments → shapes → objects.
5. **Rest cost grows fast** with memories (every pair at every shift): 0.6 s for 59 memories, 20 s for 136, longer in the browser; frequent short rests keep it small.

## Duplicates (found by the owner in the viewer), and the fix
With rests every 98 flashes (as the page does), 1,200 flashes left **8 shapes held by more than one unit**, the house three times: the same shape built by different routes in different rests (compared only part with part, never across layers or composite with composite), and composites wrapping a single child. One more "house" was a stored scene (house + fragments) that recurred: not a duplicate.
Fix, the existing rule applied to every unit: at the start of every rest step, single-child composites dissolve into their child, and units that look the same (up to position), from any layer, collapse into the most used one; layers are recomputed from structure. Both always lower energy. After the fix: **0 duplicated shapes**, one house (used by 11 memories). Layer numbers now follow real depth: fragments → stick → corner → box → house → scene (up to 6 layers).

## Next
- Make rest incremental (only re-compare what changed), so it scales.
- Consider whether fragments below shapes should be kept or folded back (a shape is the natural unit for recognition).

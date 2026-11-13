# C32 · A kind that nearly fits; completion's invented pixels: findings

Done by a helper on a separate branch. Only the bug fix went into the engine.

## 1 · A kind that nearly fits (table + peak)
- **Move tried:** where a kind's version explains a flow picture with pixels wrong or missing, rest proposes what is actually there as a new version. The kind's base gives up any pixels that version lacks, and they move into every other filler. Code: `sketches/C32-near-fit/see.js` (`nearMisses`, `applyVersion`).
- **It works when applied by hand** (every object then reads exactly), **but energy rejects it, and rightly so.** Table + peak is in only 2 of 100 episodes. The one rest whose 100-picture flow holds it sees just 6 of its pictures. The new version would save about 10 in the flow but cost about 13 in structure. Storing table + peak as its own thing would also cost about 1.5 more.
- **With every picture as the flow** (no window), the unchanged engine already predicts 100%. So the 90% comes from thin evidence plus the flow window (decision 008), not a missing move.
- **Bug found and fixed in the engine:** a kind's cached version could point at the wrong filler after an undone move (ids are reused).

## 2 · Completion's 4 invented pixels
These are not a fault. Twins can be recalled from just its two outer bars, 4 apart. In one scene the cue kept two corners' legs, which are the same bar, standing exactly 4 apart. Twins is then the only completion that describes both cells as one thing, so by completion's rules it is taken. The pre-C30 world does the same with another cue seed (6 pixels). The earlier 0 was luck.

## 3 · "Remember one thing" at rest (`o.nearThings`)
This proposes what is actually there as a new plain part, for any near miss. On the 12×12 world it gives a lower bill (1,161 vs 1,172, 11 units vs 12) and no invented pixels. Damaged-picture completion gets slightly worse (invented 16/50 vs 15/49, heat 0.27/0.53 vs 0.23/0.44), because block and corner become plain parts instead of composites. It's left out of the engine; it's the owner's call whether to pursue it.

## Tests
All five engine tests give the same numbers with the helper's changes.

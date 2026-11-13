# C36 · The abstract region (name provisional)

A second copy of the engine, unchanged, whose input is not pixels but what the visual region recognised.

**Set-up.** The visual region (the engine at 32 × 32) learns the five objects from simple pictures, then reads forest and
city scenes (C33 world) and passes on only the outermost things it settled on. Position is dropped. The abstract region
(the engine at 20 × 20, separate process) sees one row per kind of thing, with how many were seen drawn as a bar.

**Goals.**
1. Regularity: the same engine, unchanged, learns from abstract input.
2. Scene types: it learns "forest" and "city" as things, which the visual region can't learn from busy scenes (C33).
3. Recall: from part of a scene (some rows shown, the rest hidden) it fills in the rest of the scene type, and stays
   undecided when the cue fits both.

Run: `node visual.js` (writes visual-out.json), then `node abstract.js`.

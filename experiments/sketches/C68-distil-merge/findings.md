# C68 · Distillation D-01, step 1: the merge into the engine · findings

Run: `node run.js` (out.txt). Removes violation V3 of D-01 (`docs/distillation/D-01-text.md`): C67's hand-written rule
for joining groups into types. Each group C67's engine found is given to the unchanged branch engine as an assembly
across word columns (one column per word), held and compared at rest; groups whose explanations use a part the engine
kept are one type (the shared part is the type's overlap).

| Sentences | Types whole and alone: engine compares (C68) | hand-written rule (C67) |
|---|---|---|
| 4 | 1/4 | 1/4 |
| 8 | 4/4 | 4/4 |
| 12 | **2/4** | 1/4 |
| 16 | 3/4 | **4/4** |
| 24 | 4/4 | 4/4 |

## What it shows
- **The result survives removing the hand-written rule.** At 8 and 24 sentences the engine's own comparison gives the
  same four types. So the hand rule was not doing the work.
- **The engine is stricter, for a reason.** An overlap of only two words between two groups doesn't pay for itself in
  energy (keeping it as a part costs more than the four words it would save), so the engine joins groups only where
  the overlap is bigger or recurs. That leaves one type split at 16 sentences (cooks: "baker, chef" and "baker, chef,
  cook" stay apart), but it also carries fewer mistakes along at 12 (2/4 against 1/4): it merges less and errs less.
- **No new rule was needed.** The merge is now the energy rule comparing assemblies, as everywhere else.

## Violations left (D-01)
V1 words as items, V2 the second region's view, V4 persistence outside the engine, V5 keep-at-once by the threshold
option, V6 where the eye goes, V8 the rest schedule. And one used here: the group pictures are built by run.js from
C67's groups (the hand-over between the two regions is still wiring given by hand, part of V2).

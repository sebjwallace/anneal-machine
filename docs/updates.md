# Updates

What changed with each bundle, newest first. If you build on the docs or the engine (for example, the sandbox), read this first.

## 7 · Since the handover (not yet bundled)
- **Fix (found in C40):** rest could hang forever. When two kinds already share one set of versions, the "share" and "widen" moves checked only the kinds directly involved. So a version could be added that contains another kind using the same set, which then contains itself, and the layer count never settles. Both moves now check every kind that uses the set. All engine tests give exactly the same output as before the fix.
- Experiments C36–C40 (abstract region, imagination, routes, park map, tiny map): experiments only, engine otherwise unchanged.

## 6 · Handover and sandbox
- New `docs/state.md`: where everything stands, with lessons and open decisions. Read it first.
- New `docs/principles.md`: the rules every change is held to.
- C33: the scaling check and the forest/city scene world (experiments only).
- `sandbox/`: Sandkit set up, with a notebook on the basics (chapter 1).

## 5 · Small fixes (C32)
- **Fix:** a kind's cached version is remade if its filler has changed. Ids are reused after an undone move, so a stale version could otherwise stand in for a new filler.
- **Explained, not changed:** completion's 4 invented pixels are the twins assembly, legitimately recalled. One energy's 90% on the moving world is too little evidence in the flow window (100% with every picture).
- Tried and kept out of the engine (energy rejects them on the test worlds): a rest move that adds a kind's missing version, and "remember one thing" at rest. See `experiments/findings/C32-near-fit.md`.

## 4 · Remembering by energy, the flow kept across rests (C30)
- The 90% threshold is gone. A picture is remembered only if that lowers total energy (decision 003, retired).
- The flow (pictures rest weighs against) is now a window of the most recent 100, not cleared at rest (decision 008, a compute limit).
- Milestone 10's numbers have been corrected. The earlier gap between seeing only and one energy (43% against 100%) was mostly caused by a too-short final rest.
- `o.threshold` replaced by `o.remember` ('energy', or a number for comparison) and `o.window`.

## 3 · Kinds and one energy (milestone 10)
- The engine (`src/engine/see.js`) now has **kinds**: one form with a slot whose piece varies, plus rest moves to make, widen, share and undo them.
- **Energy can include change.** `m.step(x, prev)` adds the cost of describing what moved between pictures. `m.measure()` now also returns `change`.
- Composites keep their own frame (their pixels are not shifted to start at 0,0). If you draw them, normalise first.
- New world `src/worlds/moving.js` and test `src/test/kinds.js`. Every earlier test gives the same results or better.
- New decision 007, new milestone note 10, and glossary entries marked to confirm (kind, slot, filler, change).

## 2 · Docs for the sandbox
- Added `docs/checkpoints/`: notes 01–09 (Smelt, Heat, Pattern, Cast, Grain, Mould, Transition, Stamp, Fettle), all in one template.
- Added `docs/glossary.md`: words to use, marked owner's or to confirm.
- Added `docs/philosophy.md`: a draft, for the owner to correct.
- Added `docs/engine-api.md`: what the engine exposes.
- Added `docs/sandbox-brief.md`: the starting brief for the sandbox session.
- Added this file.

## 1 · First import
- `src/`: the engine (see, cells, complete, change), its worlds, its milestone tests and baselines.
- `experiments/`: experiments C02–C27 as they were.
- `docs/`: principles, architecture, decisions, research index, ideas, backlog.

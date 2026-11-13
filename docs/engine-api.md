# Engine API

What the sandbox (or anything else) may use. Build only against what's listed here. When the engine changes, this file changes with it, and `docs/updates.md` says so.

Plain JavaScript (CommonJS), no dependencies. Every file also works in a browser as a `<script>`, as long as its dependencies are loaded first in this order:
1. `worlds/catalogue.js`
2. `worlds/scenes.js` / `worlds/bumpers.js`
3. `engine/see.js`
4. `engine/complete.js`
5. `engine/cells.js`
6. `engine/change.js`

A bigger picture can be used by setting `globalThis.WORLD_SIZE` before loading (default 12, meaning 12×12).

## Worlds (`src/worlds/`)
| | |
|---|---|
| `catalogue.js` | `CATALOGUE` (designed 5×5 patterns), `rng(seed)` (a seeded random function). |
| `scenes.js` | `new SceneWorld(CATALOGUE)`, with: `.shapes` and `.objects` (name → points); `.heldObjects` (never shown in training); `.next(rng, noise)` → `{ x, name }`, a random scene (`x` is a `Uint8Array` of 0/1, row by row); `.place(rng, [[name, points], …])`; `.held(rng)`. |
| `bumpers.js` | The moving-squares world (side branch): `step`, `picture`, `start`, `meeting`, `cfg`. |

## Seeing (`src/engine/see.js`)
`const { Model, SW, SH } = require('./engine/see.js'); const m = new Model();`

| | |
|---|---|
| `m.step(x, prev)` | **Awake.** Explains picture `x` (`prev`, optional: the picture just before it in a sequence, so the change between them joins the energy), and stores it if more than 10% is unexplained or wrong. Returns `{ claims, left, misses, recon, ownerPx, missPx, heatShare, born, cost }`: `claims` = `[{ c: unit, dx, dy }]`; `left` = pixel indices unexplained; `misses` = wrong pixels; `recon` = the rebuilt picture; `ownerPx[i]` = which claim explains pixel `i`; `heatShare` = share left over or wrong. |
| `m.rest()` | **Rest** until settled; returns the number of changes kept. `m.restStep()` does one change at a time (for animating) and returns `{ type, saving, pieces, A, B, made }`, or `null` when settled. `type` is one of `decompose`, `compose`, `dissolve`, `fuse`, `unpack`, `relook`, `kind`, `widen`, `share`, `unkind`, `dissolve kind`. |
| `m.read(x, hidden)` | Explains without learning; `hidden` (optional, 1 = unknown) marks hidden places. Same fields as `step`. |
| `m.units` | Everything learnt: `{ id, layer, pts (layer 1) or place: [{ u, dx, dy }] (composites), loose }`. Skip units with `loose: true` (memory leftovers, not things). |
| `m.parts`, `m.layers` | Parts (layer 1) and units by layer. |
| `m.exp(u)` | A unit's pixels in its own frame. |
| `m.items` | Memories: `{ place, scene }`. |
| Kinds | A unit with `kind: true` has `place` (what the versions share), `slot: { set: { fillers: [{ u, dx, dy }] }, sx, sy }`. Its versions are made on demand by `m.inst(K, filler)` (`virtual: true`, `K`, `place`); claims can name them. `m.exp(u)` works for all. |
| `m.measure()` | `{ E, structure, flow, change, pc }`: energy and its split, and the price of a placement (exact; slow). `m.glance()` is cheap, for display. |
| `m.st` | Counters (stored pictures, splits, composites, …). |

## Cells (`src/engine/cells.js`)
`const C = new Codes(m)`
| | |
|---|---|
| `C.encode(x)` | `{ q, where, things }`: `where` = floor-0 cells `[{ col, f: 0, x, y }]` (`col` = the primitive unit; `x, y` = offset from the middle); `things` = `[{ unit, dx, dy, where, code }]`, where `code` = the thing's assembly. |
| `C.code(u)` | A composite's assembly (the smallest set of cells completion rebuilds it from). |
| `C.whole(u)` | All of a composite's cells. |
| `C.draw(cells)` | Pixels the cells stand for. |
| `C.cen(u)` | A unit's centre. |

## Completion (`src/engine/complete.js`, via `C.K`)
| | |
|---|---|
| `C.K.picture(x, hidden)` | Completes a picture with hidden places (same fields as `read`; `recon` is the completed picture). |
| `C.K.settle(cells)` | From some floor-0 cells: `{ cells, found, rounds }`. `cells` = all cells after settling (each with `from: 'cue'` or `'filled'`); `found` = assemblies found `[{ u, cx, cy, cells }]`; `rounds` = per round `{ found, added }`. |

## Change (`src/engine/change.js`)
`const T = new Change(C)`
| | |
|---|---|
| `T.now(x)` | A picture's "where" cells, as now cells. |
| `T.state(nowCells, wasCells, context)` | A state (`context` is an optional string). |
| `T.learn(state, nextNowCells)` | Remembers a transition. `T.rest()` finds shared changes (returns how many changes are kept). |
| `T.predict(state, cue)` | The next now cells. `cue` is optional: cells of the next state. |
| `T.changes` | What's remembered: `{ bef, off, on, n, place }` (`place` is set only for exact memories). |

Tests (`src/test/*.js`) are working examples of every call above.

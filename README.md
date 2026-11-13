# Anneal machine

**A machine that learns by heating and settling: structure forms where it lowers energy, and cools into memory.**

**New here? Read [`docs/state.md`](docs/state.md) first:** where everything stands, what works, what doesn't, and why.

## The idea, plainly
Anneal learns from what it sees with one rule: **keep whatever makes the whole description cheapest.**
- A picture it can't explain is heat. To cool it, the machine stores what it saw, then at rest compares memories with each other: what they share becomes a part, recurring arrangements of parts become bigger things, and anything that doesn't pay its way is taken apart again.
- Everything is priced in one currency taken from the world (a pixel, a placement), so there are no hand-set weights.
- No backpropagation, no optimiser, no training set: it learns online, from nothing, on a CPU.

So far, from pictures alone, it can:
- learn shapes and objects;
- recognise them anywhere and in any number;
- hold them as sparse cells (assemblies);
- rebuild a whole thing from part of it;
- learn how things change from one moment to the next, and apply a change it learnt in one place to places it has never seen;
- hold one form with a piece that varies (kinds), so one change covers every version.

Not yet: busy scenes, and whole scenes as one memory (see `docs/state.md`).

## The parts
The **engine** is the inner mechanism, in `src/engine/`:
| | |
|---|---|
| `see.js` | Learns parts from pictures and explains pictures with them. |
| `cells.js` | Primitives are columns; positions are cells; composites are assemblies (the smallest set of cells that brings the whole thing back). |
| `complete.js` | Recognises a thing from part of it and fills in the rest. |
| `change.js` | States and transitions: what changes into what, and where it applies. |

The **machine** is the engine acting in a world. That part is still to come.

## Layout
```
src/          the main line: the engine, the worlds it learns from, and its tests
experiments/  rough experiments (C02-C33), kept as they were, code copies and all
sandbox/      a user-facing workbench, built with Sandkit, to see how it works
docs/         principles, architecture, decisions, research, ideas, backlog
```

## Running the tests
Needs Node 18 or later; there are no dependencies.
```
npm test            # all five
npm run test:see    # learning the scene world (about 10 s)
npm run test:cells
npm run test:complete
npm run test:change
npm run test:kinds  # kinds and one energy on the moving world (about 1 min)
```
Expected results are in `src/test/baseline/` and `docs/architecture.md`.

## Status
Early research, in the open. What's solid and what's still a choice is written down in `docs/`.

## Licence
- Code: Apache 2.0 (`LICENSE`).
- Writing in `docs/` and the READMEs: CC BY 4.0 (`LICENSE-docs`).

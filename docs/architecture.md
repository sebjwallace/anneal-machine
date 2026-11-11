# Architecture: the engine

One engine, built from its own principle: **keep whatever makes the whole description cheapest.**
- Prices come from the world: a loose or wrong pixel costs 1; a stored pixel costs 1; a placement costs 1 plus the cost of naming which unit.
- Earlier experiments (C02–C27) stay in `experiments/` as records.

## Files (`src/engine/`)
| file | what it does |
|---|---|
| `see.js` | **Seeing.** Learns parts from pictures and explains pictures with them, by the cheapest description (every opening placement tried). Hidden places can be marked as unknown. Memories may hold loose pixels. Rest tries every candidate change and keeps it only if total energy (structure + the flow since the last rest) falls: pull apart at the best shift, group, fold back, fuse, unpack, re-describe memories. |
| `cells.js` | **Cells.** Only the primitives are columns; cells are a grid of offsets, in floors. Floor 0 is where each instance is; the floors above hold assemblies. **An assembly is the smallest set of cells completion brings the whole thing back from.** |
| `complete.js` | **Completion.** Pictures: it is seeing, with hidden places. Cells: cells vote for assemblies; an instance is taken if it describes two or more items as one placement; the biggest saving goes first; on equal savings, the one that claims least that wasn't seen; **if the evidence fits two completions equally well, neither is taken.** It repeats until settled. |
| `change.js` | **States and transitions.** A state is where things are now, where they were a moment ago, and any held context. Every transition is remembered with full detail, including where it happened. At rest, transitions whose whole change lines up are compared, and what they share becomes a change without its position. To predict: the most detailed change that fits wins (an exact memory, at the place it was seen, is the most detailed of all); then one a cue agrees with; then the one seen most. Every change applies wherever it fits, unless it touches cells already changed. |

## Tests (`node src/test/<name>.js`)
| test | checks | result |
|---|---|---|
| `see.js` | learning the 12×12 world, against C20 | 13 units (C20: 30); none unused; heat 0.000; description cost 1,191 (C20: 1,407); all 8 shapes and 3 objects |
| `cells.js` | C21: same thing anywhere, two sticks, two houses, similarity, assemblies | identical house assembly at 40/40 places; two sticks = two cells either side of centre; two houses share no "where" cells; assemblies keep 2 of 2.6 cells and completion rebuilds 100% |
| `complete.js` | C22: hidden patches, removed pixels, recall from a few cells | same as C22 (told where: 98 / 93 / 67 / 3%); recall like C22, and **no invented pixels** (was up to 16) |
| `change.js` | C23 (trained places), C24 (new places) | all worlds as good or better; bouncing without context 100% / 93% (C23/C24: 59% / 47%), because history now carries direction; one moving and one staying 100% for real (C24 was luck) |

## Crutches removed (and what replaced them)
- **Memory scraps:** memories hold loose pixels; unused parts are unpacked or dropped.
- **Pulling apart at the biggest overlap only:** every shift is priced.
- **Search budgets:** every opening and every candidate change is tried.
- **"Sample 3 cells per child":** an assembly is the smallest set completion rebuilds the thing from.
- **Completion picking between equal options:** it doesn't.
- **"Pair nearest with nearest":** not needed; changes are compared as whole sets.
- **"Exact memory beats shared change" and "apply a shared change once":** one rule (most detail wins, where it happened counts as detail) plus history in the state.
- **Duplicate explain code in completion:** completion of pictures is seeing.

## Still a choice (declared, not hidden; one note each in `docs/decisions/`)
- **Compute limit:** at rest, the flow is re-explained with the quick greedy search; awake uses the full search. This is about speed, not a rule about the world.
- **Search order at rest:** candidates are tried best-estimate-first, and the first one that lowers energy is kept (not necessarily the one that lowers it most).
- **The 90% threshold for remembering a picture** (the owner's, C14).
- **One floor per level** for assemblies (owner's decision pending: a shared floor allows similarity across levels, with some collisions).
- **"Seen most" as the last tie-break** in change (the frequency of what happened).
- **Tests use designed demonstrations** (curricula).

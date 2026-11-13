# Architecture: the engine

One engine, built from its own principle: **keep whatever makes the whole description cheapest.**
- Prices come from the world: a loose or wrong pixel costs 1; a stored pixel costs 1; a placement costs 1 plus the cost of naming which unit.
- Earlier experiments (C02–C27) stay in `experiments/` as records.

## Files (`src/engine/`)
| file | what it does |
|---|---|
| `see.js` | **Seeing.** Learns parts from pictures and explains pictures with them, by the cheapest description (every opening placement tried). Hidden places can be marked as unknown. Memories may hold loose pixels. Rest tries every candidate change and keeps it only if total energy (structure + the flow since the last rest) falls: pull apart at the best shift, group, fold back, fuse, unpack, re-describe memories. **Kinds:** one form with a slot whose piece varies; made, widened, shared or undone at rest like any move. **One energy:** when pictures come in sequence, the cost of describing what changed between them joins the total (structure + flow + change). |
| `cells.js` | **Cells.** Only the primitives are columns; cells are a grid of offsets, in floors. Floor 0 is where each instance is; the floors above hold assemblies. **An assembly is the smallest set of cells completion brings the whole thing back from.** |
| `complete.js` | **Completion.** Pictures: it is seeing, with hidden places. Cells: cells vote for assemblies; an instance is taken if it describes two or more items as one placement; the biggest saving goes first; on equal savings, the one that claims least that wasn't seen; **if the evidence fits two completions equally well, neither is taken.** It repeats until settled. |
| `change.js` | **States and transitions.** A state is where things are now, where they were a moment ago, and any held context. Every transition is remembered with full detail, including where it happened. At rest, transitions whose whole change lines up are compared, and what they share becomes a change without its position. To predict: the most detailed change that fits wins (an exact memory, at the place it was seen, is the most detailed of all); then one a cue agrees with; then the one seen most. Every change applies wherever it fits, unless it touches cells already changed. |

## Tests (`node src/test/<name>.js`)
| test | checks | result |
|---|---|---|
| `see.js` | learning the 12×12 world, against C20 | 12 units (C20: 30); none unused; heat 0.000; description cost 1,172 (C20: 1,407); all 8 shapes and 3 objects; 8 memories; 9 s |
| `cells.js` | C21: same thing anywhere, two sticks, two houses, similarity, assemblies | identical house assembly at 40/40 places; two sticks = two cells either side of centre; two houses share no "where" cells; assemblies keep 2 of 2.6 cells and completion rebuilds 100% |
| `complete.js` | C22: hidden patches, removed pixels, recall from a few cells | same as C22 (told where: 98 / 93 / 67 / 3%); recall like C22; invented pixels 0 to 4 per 300 scenes (C22: up to 16); the 4 are the twins assembly, legitimately recalled from two corners' legs standing where twins' two outer bars would (C32) |
| `kinds.js` | C28/C29: kinds and one energy on the moving world | seeing only: 14 things, 2 kinds, 7 changes, 100% of next pictures exact on seen objects; one energy: 11 things, 3 kinds, 4 changes, 90% (table + peak, in only 2 of 100 episodes, is read as table + dots: too little evidence in the 100-picture flow to pay for storing it; with every picture as the flow, 100%); never-seen objects 87% overlap for both |
| `change.js` | C23 (trained places), C24 (new places) | all worlds as good or better; bouncing without context 100% / 93% (C23/C24: 59% / 47%), because history now carries direction; one moving and one staying 100% for real (C24 was luck) |

## Crutches removed (and what replaced them)
- **The 90% threshold for remembering a picture:** a picture is remembered only if that lowers total energy (C30, decision 003).
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
- **The flow window** (decision 008): rest weighs against the most recent 100 pictures, kept across rests; ideally every picture. A compute limit.
- **One floor per level** for assemblies (owner's decision pending: a shared floor allows similarity across levels, with some collisions).
- **Pairing things nearest first** when pricing change in the energy (decision 007). This is the same idea that was removed from `change.js`. It's declared here because it's back in a new place; the energy-derived alternative is in the note.
- **"Seen most" as the last tie-break** in change (the frequency of what happened).
- **Tests use designed demonstrations** (curricula).

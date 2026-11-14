# Reference models

How to build each part of the machine, written as plain documents and pseudocode rather than shared code. Any rebuild,
in any language or style, can borrow from them. A rebuild is judged by the contracts ([system](../contracts/system.md)
and [practice](../contracts/practice.md)), not by matching any code. These models are the best current description of
how to meet them. They replace the idea of a library of versioned components: there is no code to manage, only an
agreed description to build from. The [column guide](../guides/the-column.md) was the first of this kind; these
supersede it for the cells-first design ([cells first](../theories/cells-first.md)).

**Each model says:**
- what the piece is for, and which contract clauses it serves;
- the data it holds;
- what it does, in pseudocode;
- the rules a rebuild must keep;
- the evidence (experiments) behind it;
- what is still open.

**Pseudocode conventions:**
- plain words and indentation;
- a `set` has no order;
- `for each` runs over what is named and nothing else;
- nothing ever loops over "all assemblies" or "all memories". If a step seems to need that, it is bookkeeping and is not
  part of the model (CTR-1 CON-19, CTR-2 CON-8).

**Status words:**
- **shown:** tested in experiments;
- **core:** in `src/engine/`;
- **proposed:** written from agreed reasoning but not yet tested;
- **open:** not settled.

| Model | About | Status |
|---|---|---|
| [RM-1 · Cells and columns](RM-1-cells-and-columns.md) | Input cells, the column of cells over each, which cell becomes active. | shown (C74, C76-C78); what picks the cell is open |
| [RM-2 · Segments](RM-2-segments.md) | One memory's evidence on one cell: AND on the segment, OR at the cell; firing at two. | shown (C35, C73-C78) |
| [RM-3 · Assemblies](RM-3-assemblies.md) | What an assembly is (cells and links, never an entry), how one is stored. | shown |
| [RM-4 · Waking and completion](RM-4-waking-and-completion.md) | Settling from a cue: segments fire, cells join, round by round. | shown (C73, C74, C76) |
| [RM-5 · Competition](RM-5-competition.md) | Within a column; between whole memories through one shared level of support; when it helps and when only more cells do. | shown (C74, C77, C78) |
| [RM-6 · Fitting](RM-6-fitting.md) | Explaining an input: competition, local heat, re-settling where heat is left. | core (C75, over placements); cell form proposed |
| [RM-7 · Composition](RM-7-composition.md) | Binding a sample of the active cells: two cells per part. | shown (C76, C77) |
| [RM-8 · Decomposition](RM-8-decomposition.md) | The cut between fit and misfit; the shared part on the same cells; rebinding. | shown (C78) |
| [RM-9 · Prices](RM-9-prices.md) | The one currency: what the bill counts today, how it reads in cells and links, where the bar of two comes from. | core (placements); cell form partly shown, partly open |
| [RM-10 · Frames](RM-10-frames.md) | Frames as a pattern of decomposed memories, not a mechanism; holding a variable open. | proposed; holding a variable open is open |

**How the models fit together:**
1. An input lights cells (RM-1).
2. Segments fire (RM-2) and memories wake and complete (RM-4).
3. They compete (RM-5), and the input is fitted (RM-6), leaving local heat.
4. At rest or from replay, what recurs is composed (RM-7) and what partly fits is cut (RM-8).
5. Everything is kept only if it pays (RM-9).

Frames are what that leaves behind (RM-10).

**Changing a model:**
- A model changes when evidence changes it: an experiment that shows a better way, or shows a rule wrong.
- The change is recorded in the [ledger](../ledger/README.md).
- A model never gets ahead of the evidence without saying so (the status words).

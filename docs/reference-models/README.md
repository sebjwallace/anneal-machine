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
| [RM-1 · Cells and columns](RM-1-cells-and-columns.md) | Input cells, the column of cells over each, which cell wins its column: wholly seen, then the present, then the past, else fresh. | core; shown (C74, C76-C79) |
| [RM-2 · Segments](RM-2-segments.md) | One memory's evidence on one cell: AND on the segment, OR at the cell; firing at two of its memory's cells, its own included; what a segment does read from its wiring, never a label. | core; shown (C35, C73-C78) |
| [RM-3 · Assemblies](RM-3-assemblies.md) | One kind of thing, all the way up: cells and links, never an entry; links sampled 2⌈ln n⌉ per cell. | core |
| [RM-4 · Waking and completion](RM-4-waking-and-completion.md) | Settling from a cue: segments fire, cells join, round by round; rivals only where the same evidence wakes them. | core; shown (C73, C74, C76) |
| [RM-5 · Competition](RM-5-competition.md) | Within a column (junctions); in settling; between memories built on the same whole, by share; all read from topology. | core; shown (C74, C77, C78) |
| [RM-6 · Fitting](RM-6-fitting.md) | Explaining an input: competition, local heat, re-settling where heat is left. | core without re-settling (re-settling shown in C75) |
| [RM-7 · Composition](RM-7-composition.md) | Tying: one rule for every assembly, a handle of two tied cells from each part. | core; shown (C76, C77); when to tie open |
| [RM-8 · Decomposition](RM-8-decomposition.md) | The cut between fit and misfit; the shared part on the same cells; tying again. | core; shown (C78) |
| [RM-9 · Prices](RM-9-prices.md) | The one currency: what the bill counts today, how it reads in cells and links, where the bar of two comes from. | open at the level of cells: the largest gap |
| [RM-10 · Frames](RM-10-frames.md) | Frames as a pattern of decomposed memories, not a mechanism; holding a variable open. | proposed; holding a variable open is open |

**How the models fit together:**
1. An input lights cells (RM-1).
2. Segments fire (RM-2) and memories wake and complete (RM-4).
3. They compete (RM-5), and the input is fitted (RM-6), leaving local heat.
4. What is not yet one memory is tied into one (RM-7), and what partly fits something else is cut (RM-8): awake in
   the core, and at rest or from replay when rest exists.
5. Everything should be kept only if it pays (RM-9). At the level of cells that rule is not yet defined: a known gap.

Frames are what that leaves behind (RM-10).

**What the models do not yet cover cleanly (read before building):**
1. **The energy rule at the level of cells (RM-9).** No model yet says how a segment or an assembly is kept or dropped
   because energy falls. Until it does, growth in these models is unconditional, which falls short of CTR-1 CON-1. A
   rebuild must keep that gap visible, not fill it with a hand-set rule.
2. **Settling competes through one global level of support (RM-5),** not a local one.
3. **Which part wakes a whole above it depends on its handle (RM-7),** and when to tie is open.
4. **Boundaries in a stream, letting go of context, recognising a stored word, and wiring regions together** (as in
   C80 and C81) are not described: the experiments did them in their own code, partly by bookkeeping. They are not part
   of any model until they are done by the region's own state.

**Where these models came from:** written 14 November 2026 from the experiments; brought up to date on 15 November 2026
from the core rebuilt from them (`src/engine/`, with its tests in `src/test/` and viewer in `src/view/`), which showed
where they were wrong or silent: pairs, labels, junctions, handles, one rule for every assembly. The ledger records it
(PRO-6 to HYP-31).

**A standing rule:** where a model is silent or marked open, a rebuild says so and leaves the gap. It does not fill it
with a list, a scan over everything, a number set by hand, or the truth (CTR-2 CON-2, CON-8).

**Changing a model:**
- A model changes when evidence changes it: an experiment that shows a better way, or shows a rule wrong.
- The change is recorded in the [ledger](../ledger/README.md).
- A model never gets ahead of the evidence without saying so (the status words).

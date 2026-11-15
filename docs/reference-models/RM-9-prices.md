# RM-9 · Prices

**For:** the one currency in which everything is decided: whether to keep, cut, bind or wake.
**Serves:**
- CTR-1 CON-1 (one rule: keep a change only if energy falls);
- CON-2 (one currency, from the world);
- CAP-6 (thresholds from prices).

## The bill today (in the core, over placements)
```
using an assembly (a placement)    1 + log2(assemblies known + 1) / log2(cells in the world)    # about 1.5
an input cell left unexplained     1
a cell claimed but not there       1
storing a cell of an assembly      1, once
total energy = structure (what is kept) + flow (the cost of explaining recent inputs) + change (what moved)
```
The naming cost grows slowly with how many assemblies are known: picking one from a thousand takes more saying than
picking one from ten. It is measured against naming one cell's position in the world, so it is never a setting.

**What follows from these prices:**
- **The bar of two.** Using an assembly costs about 1.5 and explaining one cell saves 1, so an assembly of one cell never
  pays; two is the first that saves. In cells: a segment fires when two of its memory's cells are active, its own cell
  included (RM-2), so a pair is the smallest assembly, recognised when both are seen.
- **Recurrence.** An assembly is worth storing once it has recurred enough to repay its cells. For a wall of 13 cells,
  that is twice.

## In cells and links (partly shown)
- **Structure is links:** a segment costs its links.
- **A whole costs what its parts number, not what they hold** (RM-7): tied by a handle of two cells on each part, each
  level of the core's square of four quarters costs 12 links, against 120 to wire its 16 cells together.
- **A whole costs the links of its tie** (RM-7): 30 for three parts tied by two cells each, against 132 for
  wiring everything (C76).
- **A decomposition pays when one shared part plus two small bindings costs fewer links than the wholes it replaces**
  (C78: 114 against 264).

## Open
- **The whole bill restated in cells and links.** What an unexplained cell and a prediction not there cost, against the
  links of the structure that would explain them, so that one currency covers fitting, keeping, binding and cutting.
- **The naming cost** ("which assembly, out of how many") counts every assembly known: a global count over a list, so
  it is bookkeeping (CTR-1 CON-19) and cannot be carried into the cell form as it is. Its cell-level equivalent is open.
- **This is the largest gap in the models.** Without a rule for keeping and dropping at the level of cells, every
  model's "kept only if it pays" is unbacked, and growth is unconditional (CON-1).

## Rules a rebuild must keep
- **One currency, taken from the world; no hand-set weights.**
- **A change is kept only if energy falls.**

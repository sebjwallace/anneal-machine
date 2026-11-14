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
  pays; two is the first that saves.
- **Recurrence.** An assembly is worth storing once it has recurred enough to repay its cells. For a wall of 13 cells,
  that is twice.

## In cells and links (partly shown)
- **Structure is links:** a segment costs its links.
- **A composition costs the links of its binding** (RM-7): 30 for three parts bound by two cells each, against 132 for
  wiring everything (C76).
- **A decomposition pays when one shared part plus two small bindings costs fewer links than the wholes it replaces**
  (C78: 114 against 264).

## Open
- **The whole bill restated in cells and links.** What an unexplained cell and a prediction not there cost, against the
  links of the structure that would explain them, so that one currency covers fitting, keeping, binding and cutting.
- **The naming cost** ("which assembly, out of how many") has no direct meaning when nothing lists assemblies. Its
  cell-level equivalent is open.

## Rules a rebuild must keep
- **One currency, taken from the world; no hand-set weights.**
- **A change is kept only if energy falls.**

# RM-3 · Assemblies

**For:** what a memory, a part or a composite is, at the level of cells.
**Serves:**
- CTR-1 DEF-14 (assembly);
- CON-19 (cells and segments first);
- CAP-4 (binding what happens together).

## The idea
An assembly is a set of cells, across columns, that stands for a thing. It is **nothing but those cells and the links
between them**. It is not an entry anywhere: no list of assemblies exists, nothing looks one up, and nothing loops over
them. An assembly "exists" only in that its cells' segments hold each other.

## Data
None of its own. An assembly is stored as segments on its cells (RM-2):
```
store assembly A (a set of cells):
    for each cell c in A:
        c grows a segment holding links to (A without c)
```

Assemblies of assemblies (super-assemblies, composites) are not stored as one big set. They are parts bound by a sample
(RM-7).

## Shared cells
- Two assemblies share a cell only when they genuinely share a part: the same input in the same context.
- Such a cell holds one segment for each assembly, so their evidence stays apart (RM-2).
- The shared cells are the **abstraction** (RM-8).
- Assemblies that don't share a part use different cells in the same columns (RM-1).

## Rules a rebuild must keep
- **No list of assemblies.** A test of this: deleting every record about an assembly except its cells' segments must not
  change what the machine does.
- **An assembly is kept only if it pays** (RM-9).

## Evidence
C74, C76, C77, C78: completion, competition, composition and decomposition done with assemblies held only as segments.

## Note on the core today
The engine in `src/engine/see.js` holds units (parts, composites, kinds) as a list and memories as lists of placements.
That is bookkeeping (CTR-2 DEF-11), a violation to distil out ("Today against the contract" in CTR-1).

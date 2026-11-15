# RM-3 · Assemblies

**For:** what a memory, a part or a whole is, at the level of cells.
**Serves:**
- CTR-1 DEF-14 (assembly);
- CON-19 (cells and segments first);
- CAP-4 (binding what happens together);
- OPZ-3 (minimality: one kind of thing).

## The idea
An assembly is a set of cells, across columns, that stands for a thing. It is **nothing but those cells and the links
between them**. It is not an entry anywhere: no list of assemblies exists, nothing looks one up, and nothing loops over
them. An assembly "exists" only in that its cells' segments hold each other.

**There is one kind of thing, the assembly, all the way up.** A pair (AB), a part (ABCD), a whole made of parts (the Z),
a whole made of wholes (a square of four quarters): each is an assembly. What used to be called a composition, a
super-assembly or a binding is an assembly whose cells already belong to smaller ones. Composition and decomposition
are things that happen to assemblies (RM-7, RM-8), not other kinds of thing. They are made by one rule, tying (RM-7).

## Data
None of its own. An assembly is segments on its cells (RM-2), one per cell it ties:
```
tie cells into an assembly:
    n = how many cells
    for each cell c:
        c grows a segment holding links to a sample of the others, of size sampleSize(n)
sampleSize(n) = the smaller of n - 1 and max(2, 2⌈ln n⌉)
```
| cells tied | links per cell | |
|---|---|---|
| 2 (AB) | 1 of 1 | fully linked |
| 4 (ABCD) | 3 of 3 | fully linked |
| 12 | 6 of 11 | about half |
| 96 | 10 of 95 | about a tenth |

**Why that size.** A random sample holds a set together once each member has about ln n links (the connectivity
threshold of a random graph, Erdős–Rényi); a segment needs two active links where a connection needs one, so twice
that. It grows with what is active but far more slowly, so small assemblies are fully linked and large ones sparse.
Chosen by the owner (15 November 2026) from a measured comparison of three rules (log₂ n, ln n + 1, 2 ln n) at six
sizes, 1,000 samplings each: 2⌈ln n⌉ brought a whole back from half of itself 100% from 4 cells up, and from two of its
cells 92-97% up to 24 cells (52% at 96).

## Shared cells
- Two assemblies share a cell only when they genuinely share a part: the same input in the same context.
- Such a cell holds one segment for each assembly, so their evidence stays apart (RM-2).
- A whole holds its parts' cells, not new ones: each level adds a segment on a few of them (RM-7).
- The shared cells are the **abstraction** (RM-8).
- Assemblies that don't share a part use different cells in the same columns (RM-1).

## Rules a rebuild must keep
- **No list of assemblies.** A test of this: deleting every record about an assembly except its cells' segments must not
  change what the machine does. (The core's moments report what was tied, for whoever watches; the volume never reads
  them back.)
- **No kinds of assembly.** Nothing in the machine tells a part from a whole; only what is connected to what.
- **An assembly should be kept only if it pays** (RM-9). At the level of cells that rule is not yet defined: today an
  assembly, once tied, is kept unless cut. A known gap (CTR-1 CON-1).

## Evidence
- C74, C76, C77, C78: completion, competition, composition and decomposition with assemblies held only as segments.
- The core (15 November 2026): a twelve-cell assembly, links sampled, comes back whole from half of itself in 200 of 200
  seeds (and 16 from 8, 12 from 4); the same tie makes pairs, parts and wholes. In `src/test/`.
- The core's viewer (`src/view/`) draws every assembly the same way, nested round those it was tied from.

## Note on the old core
The engine that was in `src/engine/see.js` held units as a list and memories as lists of placements: bookkeeping (CTR-2
DEF-11). It was removed when the core was rebuilt from these models (15 November 2026).

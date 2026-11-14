# RM-8 · Decomposition

**For:** taking a whole apart where it differs from something it resembles, so the shared part is held once (analysis),
and is the abstraction.
**Serves:**
- CTR-1 CAP-1 (learning by comparing);
- OPZ-3;
- CON-19.

## The idea
Decomposition is the cut along the line between fit and misfit. The comparison is not a search over pairs: a new input
partly wakes the memory it resembles, and the cells' states draw the cut.

## What it does
```
when an input arrives whose columns light all their cells (RM-1):
    count segments (RM-2); support includes the cell itself if active
    memory = cells at the top level of support (RM-5)        # the memory that fits best
    if rivals tie at the top level (RM-5): no cut          # it is not clear which memory the input resembles
    F = cells of memory that are lit          # fits: the shared part
    P = cells of memory that are not lit      # predicted but not there: the memory's own remainder
    U = lit columns with no cell in F         # unexplained: the input's own remainder
    if F and P can each hold an assembly (at least two cells):
        cut:
            F becomes its own assembly (RM-3), on the same cells     # the abstraction, really shared
            P becomes its own assembly, on the same cells
            remove the memory's old whole-memory segments: the firing segments that put its cells at the top level
            U gets fresh cells (RM-1) and becomes an assembly
            rebind the old whole as F + P, and the input as F + U (RM-7)
        keep the cut only if it pays (RM-9)          # not yet defined at the level of cells: a known gap
```

## Rules a rebuild must keep
- **Read the cut through the top level of support.** Without it, chance predictions from other memories join the parts.
- **The shared part stays on the same cells.** That is what makes it shared rather than copied.
- **A shared part needs competition between whole memories at recall** (RM-5); otherwise it wakes every whole it belongs
  to.

## Evidence
- C78:
  - the cut found the right shared part and both remainders in every family;
  - 114 links against 264 for both wholes;
  - with bindings competing, each remainder brought back its own whole (the other came back in 0-4%; 96-97% clean at 64
    cells per column, 200 families);
  - without the top level, the cut was right in 9-38%.
- The visual [decomposition-cut](../visuals/decomposition-cut.html).

## Open
- Rest as replay, so that cuts happen when nothing new arrives.
- Shifts: for pictures, the same part at another place is different cells.
- The cut made in steps rather than at once, so recall works throughout.

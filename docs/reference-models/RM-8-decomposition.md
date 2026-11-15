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

## What it does (core)
```
after settling and choosing winners:
    memories = the active cells, grouped through their firing segments (RM-7's grouping)
    for each memory:
        F = its cells that won                    # fits: the shared part
        P = its cells brought back, not seen      # predicted but not there: the memory's own remainder
        U = lit columns with no cell in F         # the input's own remainder
        no cut if:
            some cell of the memory neither won nor was brought back    # a tie or a loss: not clear which (RM-5)
            F, P or U cannot hold an assembly (fewer than two cells)
            F and P are each already held by segments of their own      # already a whole of those two parts
        cut:
            remove the segments that span F and P                       # what held the whole as one
            tie F into an assembly, on the same cells                   # the abstraction, really shared
            tie P into an assembly, on the same cells
            tie the old whole again from F and P (RM-7)
        keep the cut only if it pays (RM-9)                             # not yet defined at the level of cells
the input itself, F with U, is tied by the moment's tie (RM-7)
```
- **Why U must hold an assembly.** The cut compares the memory with something else that shares F: the input, which is
  tied as F with its own remainder. When the input is only part of the memory (AB after ABCD), there is nothing to
  compare with: that is recall (RM-4), and nothing is cut.
- **Why no cut where F and P are held on their own.** Then the whole is already made of the two (it was tied from them),
  and the cut has nothing to make.
- U gets fresh cells through the column's choice (RM-1), and is tied with F as one assembly: it gets no assembly of its
  own until a later cut finds it.

## Rules a rebuild must keep
- **Read the cut through the top level of support.** Without it, chance predictions from other memories join the parts.
- **The shared part stays on the same cells.** That is what makes it shared rather than copied.
- **A shared part needs competition between whole memories at recall** (RM-5); otherwise it wakes every whole it belongs
  to.

## Evidence
- C78: the cut found the right shared part and both remainders in every family; 114 links against 264 for both wholes;
  with wholes competing, each remainder brought back its own whole (the other in 0-4%); without the top level, the cut
  was right in 9-38%.
- The core (15 November 2026), in `src/test/`: ABCD, then ABEF: ABCD's four segments are removed, AB and CD become
  assemblies on the same cells, ABCD is tied again from them and ABEF from AB with E and F; both are recognised
  afterwards with nothing more grown or cut; AB alone after ABCD is recall, not a cut.
- The visual [decomposition-cut](../visuals/decomposition-cut.html); the core's viewer, `src/view/`, draws the old whole
  dashed in red at the moment it is cut.

## Open
- Rest as replay, so that cuts happen when nothing new arrives.
- Shifts: for pictures, the same part at another place is different cells.
- The cut made in steps rather than at once, so recall works throughout.

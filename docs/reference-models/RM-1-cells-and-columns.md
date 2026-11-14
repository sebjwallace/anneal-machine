# RM-1 · Cells and columns

**For:** keeping memories apart across cells, by expanding each input into a population.
**Serves:**
- CTR-1 CAP-2 (sparse distributed representations);
- CON-9 (cells carry no numbers);
- OPZ-5 (scale);
- DEF-12 (cell).

## The idea
An input cell (a pixel, a letter, whatever the world gives) does not stand for itself alone. Above it stands a **column**
of cells. When the input is on, cells in its column become active, and which cell carries the meaning depends on
context. Two memories that share inputs can then use different cells, so they don't collide. A classic Hopfield network
lacks exactly this: each input is one unit, and memories sharing inputs blur.

## Data
```
column:  one per input cell; holds C cells (C is fixed architecture, the same everywhere)
cell:    belongs to one column; is active or not (no number, CON-9); holds segments (RM-2)
active:  a set of cells, for the current moment
```

## What it does
```
when input cells arrive:
    for each input cell that is on:
        its column is lit
        if some cell in the column is predicted (one of its segments fires, RM-2):
            the predicted cell(s) are the candidates           # context has chosen
        else:
            every cell in the column is a candidate            # nothing predicts: the whole column lights
    candidates compete within each column (RM-5)
```
A whole column lighting when nothing predicts one of its cells is what lets an old memory be woken by a new context:
it is how comparison happens by itself (RM-8).

## Which cell a new memory uses (open)
- **Pictures:** the cell is chosen by where the input sits (an offset). This works, but doesn't generalise.
- **Context alone fails:** cells encode the frame, not the individual (the other repository's sketch 20: recall 52%).
- **Identity alone** (one cell per word) keeps individuals apart (88%) but not contexts.
- **Best rule so far, by fit or fresh:** reuse a cell when one of its segments already fits; give a fresh cell (least
  used) to whatever nothing explains. That is the energy rule: pay for a new cell only when the old ones can't explain
  it.
- **Open:** a choice using both context and identity.

## Rules a rebuild must keep
- A cell is active or not, and carries no strength or level.
- C is fixed architecture, not tuned per world (CTR-1 CON-3).
- Columns are separate: nothing in one column reads another's cells except through segments.

## Evidence
- C21 and checkpoint 05: which cell says where, in pictures.
- C77: with 64 cells per column, recall stayed 96% clean at 500 compositions, against 45% at 16. More cells, fewer
  collisions by chance.
- The visual [columns](../visuals/columns.html).

## Open
- What picks the cell for a new memory (above).
- How large C must be, and whether it can grow.

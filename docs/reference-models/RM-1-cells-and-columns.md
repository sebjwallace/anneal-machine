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
was:     each cell's output also arrives a moment later; segments wired to it predict (RM-2)
active:  a set of cells, for the current moment
```
A **volume** is a number of columns (CTR-1 DEF-10; previously called a region).

## What it does (core)
```
when an input arrives:
    predicted = cells whose segments wired to the moment before fire (RM-2)
    for each input that is on, its column is lit:
        if some cell in the column is predicted:  those cells light            # context has chosen
        else:                                     every cell in the column lights (a burst)
    settle the present (RM-4)
    in each lit column, choose its winners (below)
```
A whole column lighting when nothing predicts one of its cells is what lets an old memory be woken by a new context:
it is how comparison happens by itself (RM-8).

## Which cell wins its column (core)
```
in each lit column, of its active cells:
    any cell whose memory is wholly seen wins                    # every member active, every link in a lit column
        (several such: all win; two memories meet here, a junction: RM-5)
    else the cell with the most support from the present wins    # what its assemblies say (RM-2)
    else the cell with the most support from the moment before   # what was predicted
    else nothing explains this input: the cell with the fewest segments wins, fresh
    a tie at the top, of the present or of the past, is refused: the column has no winner (CON-7)
```
- **What is seen outranks what was expected** (CTR-1 PRN-5). The present's support and the past's are evidence for
  different memories, so they are never compared on one scale (CON-9): the past decides only where the present says
  nothing.
- **By fit, or fresh.** A cell that an assembly supports wins a burst over a fresh one, so a memory recognised in a new
  context keeps its cells (the cost: those cells no longer say what came before; see Open).
- **Learn from winners** (C79), in its core form: a winner that the moment before's winners did not predict grows a
  segment over what they were (RM-2). One rule covers a burst, a cell predicted only through a burst, and a cell
  recognised from the present alone.

## Rules a rebuild must keep
- A cell is active or not, and carries no strength or level. "Fewest segments" is read from the cell's own structure
  (how many segments it holds), not from a counter kept beside it (CON-9). Among cells equally empty, any will do: that
  breaks a symmetry between interchangeable cells and is not a choice between explanations.
- Growth here is unconditional until the energy rule exists at the level of cells (RM-9): a known gap (CON-1).
- C is fixed architecture, not tuned per world (CTR-1 CON-3).
- Columns are separate: nothing in one column reads another's cells except through segments.

## Evidence
- C21 and checkpoint 05: which cell says where, in pictures.
- C77: with 64 cells per column, recall stayed 96% clean at 500 compositions, against 45% at 16.
- C79: Numenta's scheme for text: the column is identity, the cell is context.
- The core (`src/engine/`, 15 November 2026): ABCD, DGJM, MNOP learnt on the first pass and every input predicted from
  the second; D and M take different cells in different contexts; a failed prediction is heat, and MNOP is read with
  its own cells when DGJM was expected (PRN-5); junctions in the Z (RM-5). In `src/test/`.
- The visual [columns](../visuals/columns.html); the core's viewer, `src/view/`.

## Open
- **The creep.** An input with too little context to be predicted learns a fresh cell every time (C79).
- **How long context is held.** One moment in the core; two words in C79.
- **Context and identity together.** By fit, or fresh, lets a recognised memory keep its cells in any context, which
  loses what came before it. Using both is open.
- How large C must be, and whether it can grow.

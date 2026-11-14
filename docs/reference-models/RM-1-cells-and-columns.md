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

## Which cell a new memory uses (shown for text, C79)
**The column is the identity; the cell is the context** (Numenta's scheme, on our cells and segments):
```
for each input that is on, with context = the winner cells of the recent inputs:
    predicted = cells in its column with a firing segment (RM-2)
    if predicted:
        those become active
        if they were predicted only through cells lit by a burst (not by the context's winners):
            the predicted cell with the fewest segments grows a segment over the winners      # learn from winners
    else:
        the whole column lights (every cell active)                           # nothing predicts: compare widely
        the cell in the column with the fewest segments grows a segment over the winners    # a fresh cell
```
- **Evidence.** In C79, after one reading, the next word was predicted right and sharply every time, where one cell per
  word predicted every word that ever followed. A word never seen in a context still predicted only valid continuations,
  because its whole column lit.
- **What was tried before:** cells chosen by context alone (without the column) encoded the frame, not the word; one
  cell per word kept the word but lost its context; pictures use offsets.
- **Open:**
  - **The creep.** An input with too little context to be predicted (one cell, against a bar of two) learns a fresh cell
    every time.
  - **How long context is held.** Two words in C79.

## Rules a rebuild must keep
- A cell is active or not, and carries no strength or level. "Fewest segments" is read from the cell's own
  structure (how many segments it holds), not from a counter kept beside it (CON-9).
- Growth here is unconditional until the energy rule exists at the level of cells (RM-9): a known gap (CON-1).
- C is fixed architecture, not tuned per world (CTR-1 CON-3).
- Columns are separate: nothing in one column reads another's cells except through segments.

## Evidence
- C21 and checkpoint 05: which cell says where, in pictures.
- C77: with 64 cells per column, recall stayed 96% clean at 500 compositions, against 45% at 16. More cells, fewer
  collisions by chance.
- The visual [columns](../visuals/columns.html).

## Open
- The creep, and how long context is held (above).
- How large C must be, and whether it can grow.

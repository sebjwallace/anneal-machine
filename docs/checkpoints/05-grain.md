# 05 · Grain: what's inside, as cells

## In one paragraph
Inside the machine, things are held as **cells**. Only the basic parts (the **primitives**) get a **column**. Each column has many cells, laid out like a grid of positions. A cell in a column means "this primitive, at this offset". Where something is in the picture is a cell on the bottom **floor** of its column, measured from the centre of attention (the middle of the picture). A composite, like a house, isn't a column. It's an **assembly**: a few cells across the primitive columns, each at its offset from the house's own centre. So a house anywhere is the same assembly, and two houses side by side are told apart by their bottom-floor cells.

## Why it matters
- **This is the language of the machine.** Sparse cells, rather than pointers, are what assemblies are made of, and what similarity and memory are built on.
- **Position comes for free** from which cell is active. That was the owner's insight: treat the column's cells as a coordinate system.
- **No explosion of columns.** Columns stay few (only the primitives); everything bigger is an assembly over them.
- **Similar things share cells,** so similarity is just overlap.

## How it works
1. **Columns:** one per primitive. Cells form a grid of offsets, in **floors**: floor 0 for where things are, and one floor per composite level for assemblies (decision 004).
2. **Where:** each primitive in the picture gives one cell on floor 0, at its offset from the middle.
3. **An assembly** is the **smallest set of a composite's cells from which completion brings back the whole thing** (see 06 · Mould). How much of a thing an assembly keeps is decided by completion, not set by hand.
4. **Similarity** is the share of cells two things have in common.

## What it showed
- **Same thing anywhere:** a house at 40 random places gave the identical assembly every time.
- **Two sticks side by side:** two cells in the stick column, one each side of the centre (the owner's picture, exactly).
- **Two houses side by side:** the same assembly for both, with no "where" cells in common. *What* and *where* stay separate.
- **Similarity:** "twins" shares half its cells with "block" (twins is two blocks). A never-seen arrow is closest to the house, because they share the roof.
- **Assemblies are small:** on average, 2 of a thing's 2.6 cells, and completion rebuilds every thing from them (100%).
- **Sparse:** a picture of about 15 pixels becomes about 4 "where" cells and 2 assembly cells.

## What to show people
- A column drawn as a grid, with the active cells lit: two sticks become two dots either side of the centre.
- One house moving around the picture: its assembly stays the same while its "where" cells move.
- Two houses: the same assembly, different "where".
- An assembly's few cells, and completion filling in the rest.

## Limits and open questions
- **Positions are same-or-different:** a cell one step away shares nothing. Graded positions, where nearby offsets overlap, may be needed for variation and noise.
- **One floor per level vs a shared floor** (decision 004): the owner's call.
- **The machine is the sensory side for now.** An abstract region, where nearness comes only from shared meaning, is a later idea.

## Where it lives
- Code: `src/engine/cells.js` (`encode`, `code`, `whole`). Test: `src/test/cells.js`.
- Experiment: C21. Findings: `experiments/findings/C21-codes.md`.

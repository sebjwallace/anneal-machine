# C02 Explain and grow (exploration, written before running)

*An exploration, not a test: no pass marks yet. Pass marks come when something is worth confirming.*

## The idea
Columns don't compete to **win** a flash; they compete to **explain** it. Each column has a field of pixels it stands for. The column that best explains what's still unexplained claims those pixels, then the next best, and so on.
- **What's left unexplained is heat.** Only heat grows structure: the leftover becomes a new column, so new columns are born from leftovers, not from whole patterns.
- **Misfit changes, fit keeps.** A column that claims while some of its pixels are off loses those pixels fast (heat). Pixels that are on strengthen slowly (cooling). So a whole that keeps being used for only part of itself should shed the rest, and the shed part becomes leftover elsewhere, then a column of its own. **Splitting with no split rule.**
- **Cells say which whole.** Inside each column, cells work like the core's entities: a flash's cells settle together, and a whole that nothing completes gets fresh cells ("new thing, new cells").
- **Rest prunes by replay.** A column whose removal leaves everything it explained explained just as well adds nothing, so it goes. Columns and cells unused for RETIRE flashes retire.

## Experiments run side by side
1. **Mechanism** (5% noise): **A** grow only (a column claims only near-whole fits, no shedding), **B** grow and split (claims partial fits, sheds misfit), **C** like B, but a leftover must recur once before it becomes a column (a guard against noise).
2. **Noise:** B at 0%, 5% and 15%.
3. **Order:** B with random order, parts first (bars, half bars, blocks, corners, diagonals for 5 passes), and wholes first (letters, boxes, crosses and the like for 5 passes).

All arms hold out the 6 **bar triples** from training, to see how new compositions of known parts are met on first sight.

## What we're curious about
- Which parts does it find? Bars, half bars, corners, or something we didn't expect?
- Does B really split wholes into parts, without a split rule?
- How many columns for 98 patterns? Does every pattern still get its own code?
- How does noise behave: junk columns, or leftover that stays as a noise residue?
- Does the order things arrive in change what it learns?
- Are the held-out triples explained by known columns, with nothing left over?
- Do cells keep each whole's identity under noise?

## Constants
Core values: CUT 0.5 (connected line, fit cut), ETA_M 0.02 (cooling), ETA_HOT 0.2 (heat), PMAX 33 (rest pressure), ROUNDS 5, RETIRE 1000, THETA 0.1 (link floor).
New for this sketch (rising heat, to report): claim threshold for arm A (0.8), a new link's starting strength (0.6), and the rule that a part binds at least 2 pixels.

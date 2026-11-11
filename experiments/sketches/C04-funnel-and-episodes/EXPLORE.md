# C04 The funnel, and columns plus episodes (exploration, written before running)

## Why
C03 showed a trade: fewer columns always cost heat, and exact detail needs crumbs. The owner now sees it as a **spectrum**, not compression alone: specific at one end, generic at the other, and the whole spectrum together keeping heat low. Two experiments.

## Experiment 1, the owner's: the funnel
- Five layers of **fixed size: 100, 50, 25, 12, 6 columns.** Each layer explains the flash with its own columns (compete to explain, as in C03, with economy). A layer that's full can't add columns: its winners grow towards the leftover instead (they generalise). If nothing in a full layer fits, the nearest column moves towards the flash.
- **Cells link across all layers:** each flash's active columns, from every layer, settle one set of cells together, so one assembly runs from the most specific to the most generic.
- Two readings of "layers":
  - **FP (parallel):** every layer sees the flash directly; only its size differs.
  - **FS (stacked):** each layer sees the layer above's cleaned-up picture (what it rebuilt plus what it left over).
- **Spectrum heat:** all layers' columns compete together to explain the flash.

## Experiment 2, Claude's: X1, columns for the common, episodes for the specific
- C03's best (economy plus pay its way). A flash's leftover after the columns is first offered to **episodes**: the best-fitting stored snapshot (fit as in the core: shared / (its size + cue pixels it lacks), at least FLOOR 0.55, the core's stand-in) explains the leftover pixels it contains.
- What's still left (2 or more pixels) is a **surprise**: store the flash as a new episode, and offer the leftover as a candidate column. Because a pattern's repeats are now caught by its own episode, **only a leftover that recurs across different patterns becomes a column.**

## Measures (same for all)
- Structure: columns (plus episodes for X1), cells.
- Heat (left over + wrong, as a share of ink): clean, under 5% noise, held-out triples.
- Funnel: each layer's heat on its own.
- **Completion:** remove 30% of a pattern's pixels; how close is what comes back to the full pattern? For the funnel, the cross-layer assembly may switch on further columns (any column whose cell is linked to at least half of the assembly); the most specific layer's picture is read before and after. For X1, the best episode fills in.
- Assembly stability under noise.

## Curious about
- Does the funnel's spectrum heat beat any single layer, and come out lower than C03 at similar structure?
- Do the narrow layers find generic parts while the wide layers keep detail?
- Do cross-layer assemblies bring back detail from a partial cue?
- Does X1 get low heat with far fewer columns than C03, and how many episodes does noise cost?

## New settings (rising heat)
The layer sizes (the owner's design), FLOOR 0.55 (the core's existing stand-in), the completion rule's "half of the assembly" (reuses CUT).

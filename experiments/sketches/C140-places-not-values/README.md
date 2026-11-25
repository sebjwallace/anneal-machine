# C140 · Places, not values

Variables as places relative to a frame. Single-digit subtractions ("a − b = ?") are written at random positions in an
8 by 16 space full of random digits. From worked examples, the memory learns which places to read, relative to the "−"
or as absolute cells, and is tested with new numbers at positions training never used.

Relative places: learned from one or two examples in every seed, recalled by the engine from "−" alone, 100% right.
Absolute places: one bound procedure read the wrong cells (93% wrong); several jammed (no answer). The relative
coordinates were declared, and a side probe shows why: the engine can't combine where it is with which way it moves
(0 of 30 next columns exact), because arriving at a column and leaving it tie.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C139's copy, unchanged) · `space.js` (the world, the arms, the side probe; GIVEN and ENGINE marked in the
  code). Run: `node space.js > out.txt`.

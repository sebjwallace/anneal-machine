# C133 · Prices on assemblies: hypothesis

Distillation [D-03](../../../docs/distillation/D-03-buffer-annealing.md), V3: cost as surprise read from a table of
uses kept over all of memory (each text's uses, the total of all uses, and the number of kinds).

## The change

The contract allows evidence counted per memory (CTR-1 CON-9). What it rules out is a central table worked over (CTR-2
DEF-11). So:

- a piece's uses are counted on its own state, each time it is read;
- a letter's uses are counted on its own population, each time it is read loose;
- the whole is the engine's own clock: the moments the memory has lived, one a letter as letters arrive.

A letter or a piece costs log2((moments + 1) / (its uses + 1)), in letters of the alphabet. There is no table, no
total of uses and no count of kinds. The energy rule's pointer is priced the same way. A stretch seen again moves one
use from its letters to the piece that covers it, as before.

## The yardstick

The two ways of pricing measure in different units (uses against a total of uses, or against the clock), so each
learner's own energy can't be compared with the other's. A neutral yardstick is added. The whole book is described
with each final memory, and each unit is costed by how often it occurs in that description; memory is costed the same
way. It doesn't depend on either learner's prices.

## Prediction

Neutral energy over the whole book within 2% of C132's, and reading within 3 points, on both books.

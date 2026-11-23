# C134 · Count from what is active: hypothesis

Distillation [D-03](../../../docs/distillation/D-03-buffer-annealing.md), V4: the energy rule counts the held patterns
that contain a new piece through a three-letter index over all of memory.

## The change

The energy rule asks whether pointing to a new piece from every pattern that contains it costs less than spelling it
out in each. Without an index, the patterns it can know about are the ones in front of it:

- the two wholes being compared (the hot stretch, or the part of it being annealed, and its partner);
- the held chains this reading saw running over the letters being annealed (the runs reported by reading by bonds,
  C131), each different pattern once.

A piece that only the partner holds, outside this sentence, is counted only through the comparison. Nothing else
changes: prices from own evidence (C133), uses from reading, partner from reading, reading by bonds with carried
support.

## Prediction

The count from what is active is smaller than the count over all memory, so somewhat fewer pieces pay. Neutral energy
within 2% of C133 and reading within 3 points, on both books.

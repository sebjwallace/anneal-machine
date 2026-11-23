# C136 · Holding what fits: hypothesis

Distillation [D-03](../../../docs/distillation/D-03-buffer-annealing.md), step 7b, V11: every hot stretch held as one
assembly. A stretch can need more members of a letter than its population has. The engine copy wrapped round and
reused members, and the Go engine refuses (found by the Go port, PRO-8).

## The owner's caution

How individuals become members is still being worked out. So whatever is done here follows the engine's rule as it
stands, and is provisional: if that rule changes, this changes with it.

## The change

The engine copy is made faithful: declaring an assembly that needs more of a letter than its population has is
refused, and nothing forms, as in the Go engine. A hot stretch too long to hold in one go is held as consecutive
parts, each the longest the populations can hold, from the start of the stretch. Each part is raw experience and is
annealed as before. The cut falls exactly where the engine's own limit falls, and no number is added. Recorded as
[decision 011](../../../docs/decisions/011-holding-what-fits.md).

## Prediction

Few stretches are long enough to need it (the first sentences of a book, read before anything is held), so the result
barely moves: neutral energy within 2% of C135 with both sentence and paragraph encoders, on both books.

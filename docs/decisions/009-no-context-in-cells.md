# 009 · No context carried in cells through time

**What (the owner's decision):** time is not handled by carrying context in which cell fires. In that scheme, borrowed
from HTM's temporal memory, a letter's column is its identity and the cell that fires in it is chosen by what came
before: the "a" in "cat" and the "a" in "bat" are different cells, so each cell stamps its whole history into the state.
The machine does not do this. A letter (or any input) is its own assembly, the same cells wherever it turns up, and
context is something held: assemblies that stay active alongside it because nothing has changed them (transition memory,
the owner's: a state persists until an input or a neighbouring state changes it).

**Why:** it is brittle, in the owner's earlier work (why he stopped using temporal memory) and in this repo's own
experiments, which are kept as the evidence:
- **It multiplies cells with every history.** C79 used 104 cells where one cell per word used 24 (323 against 58 in its
  larger world), and more with every reading (170 and 525 after three); C96 used five times the cells of one per letter (100 against 20); C81 found about seven different chains of
  cells for one word, one per preceding context.
- **It breaks identity.** The same word after a different context is a different chain, so it isn't recognised as the same
  thing: C81 had to let go of context at word boundaries to get one chain per word, and C96's context-first rule failed 12
  of the core's 17 tests, because anything seen again after something else got fresh cells and was never recognised.
- **It breaks reading a variable.** A bond made with x's cell in one context isn't reached by x in another, so x can't
  bring back its value (raised in conversation; not built).
- **It looked like success where it only predicted.** C96's exact next-letter prediction (one column per letter, a
  one-cell transition bar) came from context in cells; it predicts well and knows nothing as a thing. Later sketches
  built holds and wholes on it and failed (piling up; letters with many equal cells, refused); they were not kept.

**What replaces it:** held states. What came before stays active as its own assemblies; a transition reads what is held
together with what has just arrived ("held plus new"), and a held state is let go when a rival of the same kind takes its
place, or when an input changes it. Cells in a column are then free for other uses, such as several instances of one
thing at once (two different "5"s; x's value and y's value). First tested in C101.

**Read with:** C79, C80, C81 (context cells, the Numenta scheme) and [C96](../../experiments/sketches/C96-context-in-cells/)
(context picking the cell, its 'min' bar, and two volumes). Their findings stand as measurements, but none of them is a
direction to build on for time.

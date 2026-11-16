# C96 · Context in cells: hypothesis

Rough sketches, not preregistered; two merged (formerly C96 and C97). Until here every experiment of the session used
spatial wholes: all of a lesson's letters at once. Text arrives in order, so this asks what the machine does with letters
one at a time, before taking frames and warmth onto ordered input.

**Question 1: columns per letter.** In the core each label is one column. One letter at a time is then one active cell,
and a transition learnt from a one-cell context has one link, so it can never reach the bar of two. Expected: with one
column per letter nothing is learnt.

**Question 2: what picks the cell.** In a letter's column, which cell fires? The core weighs the present first: a letter
seen in a new context reuses a cell its own assembly already supports ("by fit, or fresh", the core's declared gap 6),
so where it came from is lost. Numenta's scheme, tried in C79, does the opposite: the column is the letter's identity and
the cell is its context, chosen by what came before. Expected: context picking the cell predicts the next letter from the
whole word so far, at a cost in cells, and may break what the present gives (recognising and composing wholes), so the
core's 17 tests are run under each rule.

**Question 3 (formerly C97): can one rule do both jobs?** Identity (the same thing is the same wherever it turns up) and
context (where you are in a sequence) seemed to pull against each other. Tried: a hybrid rule; a transition bar of one;
a bar of "two links, or all of a one-cell context" ('min'); boundaries of words from the breadth of what is predicted;
and two volumes, a letters volume below and a words volume above that holds the current word and lets go at word starts.

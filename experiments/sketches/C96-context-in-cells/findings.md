# C96 · Context in cells: findings

> **How not to do time ([decision 009](../../../docs/decisions/009-no-context-in-cells.md)).** These results are kept as
> the evidence that carrying context in which cell fires is brittle. They are measurements, not a direction.

Runs as listed in the [README](README.md). Ten words (cat car cup cot dog dot dug tug tap cap), and a larger list of 25,
read one letter at a time, five or three seeds; with a space after each word unless said otherwise.

## 1. One column per letter learns nothing

| columns per letter | pick | next letter among predicted | predicted exactly the ideal set | cells used |
|---|---|---|---|---|
| 1 | either | 0% | 0% | 160 (every cell, fresh) |
| 2 | present (the core) | 100% | 75% | 20 |
| 2 | context | 100% | **100%** | **100** |
| 3 | present | 100% | 75% | 30 |
| 3 | context | 100% | 100% | 150 |

A one-cell context can't reach the bar of two, so with one column per letter there is no prediction at all and a fresh
cell for every letter. With two columns or more, the core learns transitions at once.

## 2. Context picking the cell: exact prediction, at the price of identity

With context picking the cell, every next-letter set is exactly right ("co" → t; "do" → g, t; "cu" → p), and a start never
seen ("go") still generalises through the letter's column. With the present picking, "o" after "c" and after "d" is one
cell, so "co" also predicts "g". **But context first breaks 12 of the core's 17 tests:** a whole seen again straight
after something else is a new context, so it gets fresh cells and is never recognised, composed or cut. And it costs five
times the cells (100 against 20), one per letter per context.

## 3. The bar, and one rule for both jobs (formerly C97)

| transition bar | columns per letter | pick | next among predicted | exact | cells | core tests |
|---|---|---|---|---|---|---|
| 2 | 2 | hybrid | 76% | 50% | 38 | 11 |
| 1 | 1 | any | 100% | 100% | 47 | 13 |
| 'min' | 1 | present (the core's rule) | 100% | 100% | 47 | **17** |

With one column per letter and a transition allowed to fire on a one-cell context ('min'), the core's own rule predicts
exactly and passes all 17 tests: a single letter has no assembly of its own, so the present is silent and the moment
before picks the cell. This looked like one rule doing both jobs. **It wasn't:** the moment before picking the cell *is*
context in cells, only reached by another route. It predicts, and it knows nothing as a thing.

## 4. Word starts and two volumes (formerly C97)

Without spaces, the breadth of what is predicted peaks at word starts: precision 83-85% and recall 70-73% (ten words),
57-61% and 85-87% (25 words); surprise alone finds 3-7%. Two volumes (letters below, a words volume above that holds the
current word, each letter paired with the one before it, and lets go at a start): with the true starts given, every word
is recognised whole and, one letter before the end, exactly its endings are brought back (ten words; 51% for 25); with the
starts from breadth, 42-66% and about 28%. This was C81's design and C81's wall.

## Why this is the lesson (decision 009)

- **Cells multiply with every history** (five times here; likewise in C79 and C81).
- **Identity breaks:** the same word after a different context is a different chain (C81 found about seven per word), so
  it is never the same thing twice, unless context is let go at a boundary, which then has to be found.
- **Variables can't be read:** a value bonded to "x" in one context isn't reached by "x" in another.
- **It looks like success where it only predicts.** Exact next-letter prediction came out of it every time. Later sketches
  that built holds and wholes on it (not kept) piled up and failed.

**What replaces it** (decision 009): each thing is the same cells wherever it appears, and context is held: what came
before stays active as its own assemblies until a rival takes its place. First tested in [C101](../C101-held-states/).

## Violations (CTR-2 CON-7)

| | Violation | Kind | Clauses |
|---|---|---|---|
| V1 | Each letter given fixed columns of its own | fixed encoding, declared | CTR-1 CON-3 |
| V2 | The 'min' bar (a transition from a one-cell context fires on its one link) | change to RM-2, declared | CTR-1 CON-2 |
| V3 | The words volume's input (each letter with the one before it) and its letting go, given by the run code | given by hand | CTR-2 CON-2 |
| V4 | True word starts in the ceiling arm | given by hand, measured as a ceiling, no claim rests on it | CTR-2 CON-2 |
| V5 | Growth unconditional | inherited | CTR-1 CON-1 |

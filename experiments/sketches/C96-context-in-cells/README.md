# C96 · Context in cells: a lesson in how not to do time

> **How not to do time ([decision 009](../../../docs/decisions/009-no-context-in-cells.md)).** This experiment carries
> context in which cell fires, as HTM's temporal memory does. The owner has ruled that out: it is brittle. This folder is
> kept as the evidence, so that no later agent goes back to it. Read the numbers as measurements, not as a direction.

Two sketches merged into one folder (formerly C96, ordered letters, and C97, two jobs). Words read one letter at a time;
the question was what should pick the cell in a letter's column. With context picking it, next-letter prediction becomes
exact, but the machine stops knowing anything as a thing: the same word after a different context is a different chain
of cells, cells multiply with every history, and recognising, composing and reading a variable all break.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md)
- `ordered-letters.js` (`out-ordered-letters.txt`): present against context picking the cell (formerly C96).
- `part-ab.js` (`out-ab.txt`), `part-c.js` (`out-c.txt`), `part-d.js` (`out-d.txt`), core tests (`out-tests.txt`):
  the bar, one rule for both jobs, word starts, two volumes (formerly C97).
- `engine/`: a copy of the core with sketch options (`pick: 'present' | 'context' | 'hybrid'`, `C97_TBAR` = 2, 1 or `min`,
  and the warm-layer options from C92 and C93, with others from sketches not kept); `test/`: the core's 17 tests.
- Run: `node ordered-letters.js`; `C97_TBAR=min node part-ab.js` (and `part-c.js`, `part-d.js`);
  `C97_TBAR=min C96_PICK=context node --test test/volume.test.js`.

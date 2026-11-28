# C174 · Heat and pieces (a recount, no new runs)

C172's search for the second-row way of working, recounted under two proposing rules from the owner's picture
(pieces from what's known, fitted where the heat is). Every circuit run is deterministic, so each candidate's outcome
is C172's recorded one. **This was a desk check: no hypothesis was written beforehand.**

| proposing | stage 1 tries | stage 2 tries | total tries | settled the page |
|---|---|---|---|---|
| blind (C172) | 34,170 | 102,752 | 136,922 | 6 (3 right, 3 coincidences) |
| heat first: the first write goes where the heat is | 9,996 | 102,752 | 112,748 | the same 6 |
| heat first, then pieces: the carry write and the move placed only by a relation they had in the first row to a part already placed | 9,996 | 5,650 | 15,646 | the same 6 |

- Blind reproduces C172's totals exactly (a check on the recount).
- Heat cut stage 1 by about 3.4 times. It didn't change which candidates were kept, because every keeper already wrote
  on a hot place.
- Pieces cut stage 2 by about 18 times. The carry write has at most five places a known relation puts it, rather than 26,
  and the move is the known one. Nothing right was lost.
- In all, about nine times fewer tries, with the same result.
- What's left (about 10,000 tries) is choosing what feeds the write: the reads. The first row's pieces can't place the
  second row's reads, because on this page the second row is written several rows below its operands, while the first
  row's are just above it.
- Files: `recount.js`, `out.txt`; `c172-learn.js`, `stage-*.json`, `engine.js`, `circuit.js`, `teacher.js` (C172's).

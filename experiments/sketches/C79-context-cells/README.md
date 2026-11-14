# C79 · Which cell: Numenta's scheme in a text world

The column is the word, the cell is its context: a predicted cell is used when context predicts one; otherwise the whole
column lights and the least-used cell learns this context, from the previous words' winner cells. On cells and segments
firing at two. Hypothesis, predictions, findings: [hypothesis.md](hypothesis.md), [PREREG.txt](PREREG.txt),
[findings.md](findings.md).

**Run:** `node run.js` (seconds; `NS`, `NV`, `NO` set the world, `REPS` the readings, `SEEDS=1` the development seed).

**In short:** after one reading, the next word is predicted right and sharply every time, where one cell per word
predicts every word that ever followed (5.6 and 14.9 words); a word never seen in a frame still predicts only valid
continuations through its column. Watch: the word after a sentence's first word keeps learning fresh cells.

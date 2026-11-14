# C80 · Reading from letters, one region

The first experiment on the new [cells engine](../../cells-engine/). Characters are the input cells; words are never
given. One region reads 400 short sentences once, as a stream, with and without spaces. Hypothesis, predictions,
findings: [hypothesis.md](hypothesis.md), [PREREG.txt](PREREG.txt), [findings.md](findings.md).

**Run:** `node run.js` (about a second; `SEEDS=1` is the development seed; `NSENT` sets the sentences).

**In short:** it learns to predict the next letter inside words (98% right, alone two times in three, against about one
in three with one cell per letter). Without spaces, it finds where words begin from where its predictions are broadest
(83% of boundaries, 76% of guesses right). Surprise alone doesn't find them; the breadth of prediction (predicted but
not there) does.

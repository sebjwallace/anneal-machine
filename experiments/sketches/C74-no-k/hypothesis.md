# C74 · Answers without K: hypothesis

[C73](../C73-anneal-segments/) read C71's whole-set segments with Anneal's rule (fire at two active links, compete in each
column, refuse a tie) and kept memories apart, but only because an answer was capped at K = 8 columns, given by hand.
Without the cap, everything blended: competition inside columns is not enough; something has to make an answer's cells
hold together against rival answers.

The other agent's answers ([learnt logic: questions and answers](../../../docs/theories/learnt-logic-qa.md)) pointed at
whole answers competing. Here that needs no list: every cell of one stored memory has a segment holding that memory's
units, so when a cue arrives, all of the best-matching memory's cells reach the same support, the highest. **Hypothesis:**
taking only the column winners at the top level of support (one shared level of inhibition) sizes the answer by itself,
with no K, and lets whole memories compete. Predictions in [PREREG.txt](PREREG.txt).

# C163 · The second row (a taste): findings

A taste, by agreement: `node taste.js > out.txt`, about two minutes. Read [the hypothesis](hypothesis.md) first,
including what's given: the second-row frame is written by hand, and the restart is done by hand. Engine: C162's copy
(with its tie rule on). Lanes: one fix, below.

## In short

**A third way of working lives alongside the other two, and context alone picks it.** The second-row frame (hold the
multiplier's other digit, read the top number one place to the right, write one row down) settled every worked second
row and nothing else. Recall from the cue plus what's in view brought it back only for second rows, where the cue is
that the first row is already written above, and never for anything else. Across both sizes, **3 wrong frames were
recalled in 846 recalls.**

**Whole two-row long multiplications came out right for the first time** (first row recalled and run, the restart
given, then the second row recalled and run on the same page): 2.5% at 8 worked passes, 7.5% at 24. That's roughly
what you'd expect from multiplying the two rows' own rates (35% and 25% at 24 passes). Each row is right whenever its
frame is recalled. The losses are all "nothing recalled".

**"Nothing recalled" is now the brake on everything.** It's 64 to 75% of recalls here, higher than in C162 with two
frames, as more frames means more ways for memories to tie. Every kind of sum is limited by it, and a whole long
multiplication, which needs two recalls in a row, is limited by it twice over.

**A built-in assumption found and fixed.** The first run had the second-row frame settle nothing, though it was right
in the test circuit. The trial lanes let their clock go on to the next column only if the cell in row 3 (the usual
answer row) had cooled, an assumption from the first experiments that answers are always written there. The
second-row frame writes in row 6, so every trial stopped after one column. Now the clock goes on if the frame's own
answer place cooled. Earlier experiments are unaffected, as their answers were all in row 3.

## Results

| worked passes | + | − | first row | second row | both rows | wrong frame | nothing recalled |
|---|---|---|---|---|---|---|---|
| 8 | 36.3% | 36.3% | 23.8% | 7.5% | 2.5% | 1 of 421 | 315 of 421 |
| 24 | 46.3% | 43.8% | 35.0% | 25.0% | 7.5% | 2 of 425 | 272 of 425 |

Training (seed 1): every addition and subtraction settled by the reading frame alone, every first row by the holding
frame alone, every second row by the second-row frame alone. Frames recalled at 24 passes: second rows, the
second-row frame 20, nothing 60. Whole multiplications, holding 25, second-row 6, nothing 74 (of 105 recalls). The
first run, before the fix, is described above. Its numbers aren't counted.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | each worked pass settles with exactly its own frame | **Holds** (after the fix). |
| 2 | recall picks the second-row frame for second rows, never for anything else; wrong frames near zero | **Holds:** 3 wrong in 846. |
| 3 | "nothing recalled" stays high, about half at 24 passes | **Holds, and higher:** 64%. |
| 4 | whole multiplications right whenever both rows recall, about the product of the two rates | **Holds:** 7.5% against about 9%. |

## The ledger

**Given:** the second-row frame (by hand), the other two frames (as learned before), the signs' meanings, binding a
frame with what was in view, the restart (the focus at the second row's start, a 0 carried in, the cue given), the
wider reach (21 places). **The engine:** settling with all three frames tried, binding, recalling with the view (with
C162's tie rule), running every test. **Disclosed:** the taste was run twice; the first exposed the lanes' row-3
assumption and isn't counted.

## Where this leaves long multiplication

Every movement of a two-row long multiplication now exists in one memory: the first row, the second row, and adding
(the rows' own addition hasn't been tested on this layout). The pieces still given are clear: the second-row frame
(the proposing crutch, too costly to search at this reach), the restart, and the tie problem that makes recall come back
empty most of the time. The last one now limits everything else, and it's the gap C162 named: separating memories
that disagree by what matters (the sign, the row already written) rather than by incidental overlap.

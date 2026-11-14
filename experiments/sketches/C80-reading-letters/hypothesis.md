# C80 · Reading from letters, one region: hypothesis

Every text sketch so far was given its words as items: the first violation in the distillation of the text result
(D-01 V1). Here the input cells are characters, and nothing says where a word begins. A single region of the new cells
engine (built from the reference models) reads a stream of short sentences once, learning as it reads. The column is a
character's identity; the cell is its context (RM-1, C79).

**Hypothesis:**
- inside words the next letter becomes predictable, and sharply, because context cells keep "ca" in "cat" apart from
  "ca" in "car";
- at the start of a word, many letters are possible, so the region's predictions are broad;
- where that breadth peaks, words begin, with no spaces needed. The breadth is the second kind of local heat: cells
  predicted that won't all light.

Predictions in [PREREG.txt](PREREG.txt).

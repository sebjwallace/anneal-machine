# C170 · The whole long multiplication, by hand

A complete long multiplication from one cue to the final answer, inside the memory: the first row, a jump to one left
of the start latch, the second row, a jump back to the start, adding the rows, then letting go. 200 of 200 final sums
equal to the product, and quiet at the end. All written by hand (frames, procedure, hand-overs, relations). Control:
starting the adding one column left gave no sum at all.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C169's) · `circuit.js` (two more rows, reach five rows down) · `whole.js` (the circuit for this test).
- Run: `node whole.js > out.txt` (about twenty-five seconds).

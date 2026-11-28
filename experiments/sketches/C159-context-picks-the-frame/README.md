# C159 · Context picks the frame (a taste)

A quick taste: the two frames as already learned (reading, holding), each bound with what was in view at the start
when it settled a worked sum, then recalled from the cue plus a new page's view. Whenever a frame was recalled it was
the right one (0 wrong of 320), but most sums recalled nothing: episodes of the same frame contend over their
incidental digits and tie. Points to keeping what a frame's episodes share (their overlap, the sign) as an abstraction.
Also found and fixed a leak in how holds ran in the lanes (shared attention); notes added to C157 and C158.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C158's) · `circuit.js` and `lanes.js` (the leak fix; binding and recalling with a view) · `taste.js`.
- Run: `node taste.js > out.txt` (about fifteen seconds).

# C171 · Learning the hand-overs

The composition of long multiplication (which way of working follows which, and where each starts relative to the
start latch) learned from worked examples, judged by the memory's own Settled gate. With the working readable on the
page, two orders settled every example ("second row then add", "add then second row"), because a finished page doesn't
show order, so nothing was learned. With the working held as a target to agree with (do it yourself, check against the
solution), exactly one pair settled, C170's composition. Learned from one example, it did 200 of 200 new long
multiplications right from the cue. Candidates are still proposed by the experiment's code.

- [hypothesis.md](hypothesis.md) (with the part added after the first run) · [findings.md](findings.md) ·
  [out.txt](out.txt) · [which.txt](which.txt)
- `engine.js`, `circuit.js` (C170's) · `teacher.js` (C170's procedure, used only to write out worked pages) · `learn.js`
  · `which.js`.
- Run: `node learn.js > out.txt` (about four and a half minutes).

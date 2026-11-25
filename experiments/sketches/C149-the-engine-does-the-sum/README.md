# C149 · The engine does the sum

The milestone: arithmetic performed by associative memory, with the experiment's code only writing the numbers into
the space at the start and reading the answer out at the end. In one engine run, the space is read by completion,
digits are routed into a fact by gates, the fact completes, the units digit and the carry are written as new
associations, the focus moves, and the cycle repeats until nothing is left to read, when it stops by itself. With the
step each seed learned (as C148): 4,000 of 4,000 sums of 4 to 8 digits exactly right, every run stopping by itself.
Without the write rule, or with the wrong step, nothing works. The circuit's architecture (clock, gates, write rule) is
fixed; the encoder pads each number with a leading 0.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C148's copy plus a hook for fixed binding rules) · `circuit.js` (the circuit) · `more.js` (C148's
  learning, unchanged) · `run.js` (learning, binding into the circuit, the tests). Run: `node run.js > out.txt`
  (about seven minutes).

# C154 · The sign carried along

C153's one step, with the sign written once (under the starting column) instead of under every column. The step gets
a sign write, done by the same write rule as digits. Nothing in the worked examples shows the carried sign, but a
candidate that doesn't leave it where the next column reads it finds no sign there and stops. Every seed learned the
step that writes the sign under the next column to the left, from two examples, and it added and subtracted 4 to 8
digit numbers 100% right with the sign written once. When training pages carried the sign in every column, nothing
needed carrying, every sign place settled alike, and the store gave nothing.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C153's copy) · `circuit.js` (the sign held one phase and written on) · `lanes.js` (sign writes into a
  lane's own copy of empty places) · `learn.js` (stages A, B1, B2, the arms, the test; shards) · `smoke.js` (a build
  check) · `rows-*.json` (every seed).
- Run: `ARMS=learn SEEDS=10 SHARD=0/2 node learn.js` and `SHARD=1/2` side by side (about twenty-five minutes on two
  cores), the same with `ARMS=full SEEDS=4` (about an hour), then `REPORT=1` with each arm's `ARMS` and `SEEDS`.

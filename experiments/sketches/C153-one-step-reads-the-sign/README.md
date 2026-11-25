# C153 · One step reads the sign

C152 found that addition and subtraction couldn't live together as two procedures sharing parts. Here the sign is
written on the page (under every column) and read like a digit, the step has a sign read instead of a family, the
meaning of each sign (which facts) is a learned link, and every step is bound under one cue. Every seed learned a single
step from two examples (the reading order that fits both kinds wins by repetition) and the right links, and in one
circuit it added and subtracted 4 to 8 digit numbers 100% right. With addition proposed in one order only, the two
steps differ and the store gives nothing. No separate states were needed here: the difference lives on the page.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C152's copy) · `circuit.js` (a fifth row for the sign; a sign read routed through learned links into a
  family of facts) · `lanes.js` (sign reads and candidate links in the lanes; binding the step under "=" and the link
  under the sign) · `learn.js` (stages A and B, the arms, the test; shards) · `smoke.js` (a build check) ·
  `rows-*.json` (every seed).
- Run: `ARMS=learn SEEDS=10 SHARD=0/2 node learn.js` and `SHARD=1/2` side by side (about twenty-five minutes on two
  cores), the same with `ARMS=unordered SEEDS=4` (about forty), then `REPORT=1` with each arm's `ARMS` and `SEEDS`.

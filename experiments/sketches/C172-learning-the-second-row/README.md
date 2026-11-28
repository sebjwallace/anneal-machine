# C172 · Learning the second row by doing and checking (a taste)

The second-row way of working of long multiplication (what it holds, reads, writes, where carries go, which way it moves,
where it starts) searched for on a page showing only the question, with the worked example's working as a target to
agree with (C171's principle), judged by the memory's own Settled gate. After two worked examples, three candidates were
left: the hand-written frame with each of three equivalent sign places. Each did 200 of 200 new second rows right.
Nothing was bound, because the binding rule needs a single winner. One example alone also let through coincidences.
The search cost about 137,000 circuit runs.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt) · [filtercheck.txt](filtercheck.txt)
- `engine.js`, `circuit.js`, `teacher.js` (C171's) · `learn.js` · `filtercheck.js` · `stage-0.json`, `stage-1.json`
  (the shards' stage results) · `log0.txt`, `log1.txt`.
- Run: `SHARD=0/2 node learn.js` and `SHARD=1/2 node learn.js` (about seventy-five minutes on two cores), then
  `SHARD=0/2 REPORT=1 node learn.js > out.txt`; `node filtercheck.js > filtercheck.txt`.

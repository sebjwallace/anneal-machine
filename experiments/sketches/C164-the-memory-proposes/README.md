# C164 · The memory proposes

My replay of every stored step removed: what's tried first is what the memory offers (what it recalls with the page in
view, or the frames it couldn't choose between when recall stalls, then those varied), with search only when nothing
offered settles; everything learned in one continuous run. The memory's own offers settled 31 of 48 worked examples.
But search still ran 17 times, and at test recall gave nothing for about 90% of sums. Binding every memory to its page
makes every memory unique, so repetition can no longer pool and winnow the many variants each search settles. The
tastes hid this by handing over one frame. Suggests keeping each frame as one structure with contexts pointing to it.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js`, `circuit.js` (C162's) · `lanes.js` (`recallOffers`) · `learn.js` (offers before search; test with the
  page in view; shards) · `rows-*.json`.
- Run: `SEEDS=4 SHARD=0/2 node learn.js` and `SHARD=1/2` side by side (about fifty minutes), then
  `SEEDS=4 REPORT=1 node learn.js > out.txt`.

# C73 · Anneal's segment rule on sketch 38's worlds: findings

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after smoke runs on development seed 1. C71's numbers are
from its own runs on the same seeds. Runs: `run-anneal1-c*.txt`, `run-anneal2-c8.txt`.

## Results (M = 400 unless shown; C71 for comparison)

| cells per column | 2 | 4 | 8 | 16 |
|---|---|---|---|---|
| **episode, strict** (C71 segments-all / summed raw) | **69** (68 / 0) | **86** (85 / 18) | **95** (94 / 86) | **93** (92 / 94) |
| episode, blend | 19 | 7 | 2 | 5 |
| **partial, 4 of 8 cells, strict** (C71 segments-all / summed raw) | **42** (0 / 5) | **31** (0 / –) | **31** (0 / 81) | **28** (0 / 86) |
| split: both answers (a blend) | **0** | **0** | **0** | **0** |
| split: one / neither | 40 / 60 | 35 / 65 | 31 / 69 | 27 / 73 |
| fact "c is in" → room, strict (C71 segments-all: 89-93) | 100 | 100 | 100 | 100 |
| seen object → container (C71 segments-all: 12-24) | 68 | – | 83 | – |
| new container → room (C71 segments-all: 0) | 20 | – | 33 | – |

Partial completion was highest at M = 100 (45-55%) and fell as memory filled. The control without K (`ANNEAL=2`, 8 cells
per column) blended every probe: episode blend 100% at M = 100 and 400, and a split cue took about 365 extra cells.

## Predictions

| | prediction | result |
|---|---|---|
| P1 | episode recall within 5 points of C71's segments-all at 4, 8, 16 cells per column | **Holds:** 86 / 95 / 93 against 85 / 94 / 92. |
| P2 | partial completion ≥ 30% at 8 and 16 cells per column | **Holds at 8 (31%), just misses at 16 (28%).** Against 0% for C71's segments; well short of summed links (81-86%). |
| P3 | no blend on a split cue (≤ 5%) | **Holds:** 0% everywhere (C71 at θ 0.6: 53-62%). |
| P4 | without K, blends ≥ 90% | **Holds:** 100%. |
| P5 | at 2 cells per column, episode recall ≥ 50% | **Holds:** 69%. |

## What it means

- **A low bar plus competition keeps the sharpness and gets part of the tolerance back.** The same storage as C71, with
  only the reading changed, recalls episodes as well as whole-set segments, never blends a split cue, and completes from
  half a cue about a third of the time, where C71's segments never did. It also answers facts better (100%) and kinds a
  little (seen objects 68-83% against 12-24%; new containers 20-33% against 0).
- **The separating is done by competition, not by the bar.** Two active links is a bar almost anything reaches. What
  keeps it clean is the column's competition and the refused tie: most split cues give no word at all rather than a
  mixture.
- **But K is doing real work, and K is given.** Without the cap of 8 columns, competition inside each column isn't enough:
  every column has some winner, and everything blends. What K stands in for is competition *across* columns: the
  answer's cells holding together as one assembly against the rest. That is the open part of fitting by competition, now
  shown by a measurement. It is also why C35's competition was between whole assemblies, not columns.
- **Not sparse in work here.** About 98% of stored segments were checked per probe, as in C71, because every stored
  sentence holds the frame words ("the", "is", "in"), so every segment has an active input. In Anneal, the frame would
  be decomposed out as one shared assembly (a constant), and memories would hold only what varies. Sparse work depends
  on that.
- **Still well short of summed links on completion** (28-42% against 81-86%), and completion fell as memory filled.

## Given by hand (declared)
K = 8, the world, its words and column codes, and the probes, all C71's. Nothing else was changed.

serves: CTR-1 CAP-3, CAP-2, CON-7; CTR-2 PRN-2. Violations: K given (CTR-2 CON-2); world as items (as in all text sketches).

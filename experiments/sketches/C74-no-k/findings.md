# C74 · Answers without K: findings

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after smoke runs on development seed 1. Runs:
`run-top-c*.txt` (the top level), `run-half-c8.txt` (within half of the top: the comparison).

## Results (M = 400; C73 with K, and C71's summed links, for comparison)

| cells per column | 2 | 4 | 8 | 16 |
|---|---|---|---|---|
| answer size: new cells per episode probe (an assembly is 8) | 7.6 | 7.6 | 7.6 | 7.6 |
| **episode, strict** (C73 with K / summed links) | **70** (69 / 0) | **80** (86 / 18) | **87** (95 / 86) | **83** (93 / 94) |
| episode, blend / no answer | 16 / 22 | 7 / 18 | 2 / 12 | 4 / 17 |
| **partial, 4 of 8 cells, strict** (C73 with K / summed links) | **71** (42 / 5) | **80** (31 / –) | **87** (31 / 81) | **83** (28 / 86) |
| split: both answers (a blend) | 3 | 2 | 1 | 2 |
| split: one / neither | 89 / 8 | 84 / 14 | 81 / 18 | 81 / 17 |
| fact, strict | 98 | 96 | 96 | 96 |
| seen object → container | 45 | 65 | 69 | 62 |
| new container → room (15 probes per cell of the table) | 40 | 40 | 60 | 33 |

Within half of the top (`ANNEAL=4`, 8 cells per column) blended every probe, taking about 360 cells per answer.

## Predictions

| | prediction | result |
|---|---|---|
| P1 | answers size themselves: 6-10 new cells per episode probe | **Holds:** 7.6 at every size. |
| P2 | episode strict ≥ 60% at 8 and 16 cells per column | **Holds:** 87, 83 (with K: 95, 93). |
| P3 | partial strict ≥ 50% at 8 and 16 | **Holds:** 87, 83, as good as summed links (81, 86). |
| P4 | split, both answers ≤ 5% | **Holds:** 1-3%. |
| P5 | new container → room ≥ 40% at 8 | **Holds:** 60% (but few probes, and 13-60% across M). |
| P6 | within half of the top blends ≥ 90% | **Holds:** 100%. |

## What it means

- **The cap given by hand is gone, and answers size themselves.** With no K, every answer came out at about 7.6 cells, the
  size of an assembly. Nothing set it: the best-matching memory's cells reach the top level together, and nothing else
  does.
- **This is whole memories competing, with no list.** No memory is stored as a thing or looked up. Each cell only knows its
  own best segment's count, and one shared level of inhibition lets through only the top. Whole answers win or lose
  together because a memory's cells share its count.
- **Sharp and tolerant together.** Sketch 38 found that segments were sharp and summed links tolerant, and that a cell
  needed both. Read this way, the same segments complete from half a cue as well as from the whole (71-87%), as well as
  summed links do at 8-16 cells per column, while keeping segments' advantage where cells are scarce (70-80% at 2-4 cells,
  where summed links gave 0-18%), and almost never blend a split cue.
- **What it costs.** Episode recall is a few points below the capped version (87 against 95 at 8 cells), as answers are
  refused more often (12-22% no answer). And the other agent's rule, within half of the top, blended everything here:
  the gap between the best memory and the rest is not a fraction.
- **A split cue mostly gets one answer (81-89%).** Half of one memory and half of another rarely tie exactly, so the one
  with slightly more support wins. Exact ties are refused; near-ties are not. Whether a margin should be needed is an open
  question for Anneal's prices.
- **Not yet in Anneal's terms.** The top level works here because whole-set segments give every cell of a memory the same
  count. In Anneal, memories are composed of parts, so the top level might pick the strongest part rather than the whole
  memory. The shared level of inhibition is one number over the candidates, cheap, but global. And the work is still not
  sparse (98% of segments checked), for the reason C73 found.

## Given by hand (declared)
The world, words, column codes and probes (C71's). K is gone. The comparison rule's 1/2 is a chosen number.

serves: CTR-1 CAP-3, CAP-2, CON-7, GOL-1; CTR-2 OPZ-1 (less given by hand). Violations: the world as items (as in all text
sketches).

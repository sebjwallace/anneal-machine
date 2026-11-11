# Findings C16: factoring at rest (decomposition by comparing memories)

*Model: `models/factor.js`. Runner: `sketches/C16-factoring/run.js`. Viewer in the same folder. Awake: snapshot a flash as a new memory unless the existing parts explain at least 90% of it. Rest: heat = pixels two parts both store; the pair whose factoring (overlap + differences, a difference reusing an existing part that covers it) lowers energy most is factored; identical parts collapse; repeat until nothing lowers energy. Energy = pixels stored + 1 per part used by each memory (C03's economy cost; no new settings). From the owner's idea in IDEAS.md (1).*

## Results (98 patterns, one awake pass, then one rest)
| | parts | pixels stored | parts per memory | energy | heat on training | held-out triples | new overlaid pairs | missing 30% | 15% noise |
|---|---|---|---|---|---|---|---|---|---|
| before rest | 76 | 483 | 1.0 | 559 | 0.00 | 0.00 | 0.01 | 2.38 | 2.09 |
| **after rest** | **57** | **171** | 2.1 | **328** | **0.00** | **0.00** | **0.01** | 2.84 | 3.19 |

Rest: 37 steps (26 factorings, 11 collapses) in 0.3 seconds. Awake again afterwards: 1 of 98 patterns needed a new snapshot. Yardstick (C03, offline greedy): 40 parts.

5% noise (two awake passes): 172 → 120 parts, energy 1,418 → 821, training heat 0.03, new pairs 0.06, missing 2.15; rest took 108 steps in 8.5 s; 15 of 98 patterns needed new snapshots afterwards.

Already while awake, only 76 memories were needed for 98 patterns: flashes made of earlier snapshots (bar pairs, for example) were explained by composing them.

## Parts and compositions (no noise)
The most used parts are whole bars and bar halves (col 0, row 2, col 4, col 3, row 4, the halves of row 0), diagonals and the centre column pieces. Examples:
- "X" = diagonal \ + diagonal /
- "row 1 + col 3" = col 3 + row 1
- "corner tl" = top of col 0 + left half of row 0
- "row 0" stays whole; "plus" = row 2 + top of col 2 + bottom of col 2
- some odd pieces remain where a difference was covered by an existing part that happened to fit (for example col 0 with one extra pixel, used in "E" and "H").

## What it showed
1. **Logical decomposition, not crumbs:** bars, halves and diagonals emerge from comparing memories, and memories become compositions of them.
2. **Composition works on first sight:** held-out triples and new pairs of known shapes are rebuilt exactly from the parts (heat 0.00 to 0.01).
3. **Fast and clean:** one rest of 37 exact steps in 0.3 s, against tens of thousands of flashes of nudging in earlier designs. Structure stored drops almost three times (483 → 171 pixels).
4. **Heat drives it and stops it:** every step resolves duplicated structure; it settles when nothing lowers energy.
5. **Parts compose but don't complete:** filling in missing pieces got worse after rest (2.38 → 2.84) and seeing through heavy noise too (2.09 → 3.19); whole memories were better at recall (C15).
6. **Noise:** still works (energy almost halved, training heat 0.03), but rest is slower (8.5 s for 172 parts) and more memories are needed.

## Next
- Keep whole-memory recall alongside the parts (the memories already exist as compositions: recognising one could recall all its parts, as the episodic layer).
- Look at the odd pieces: the "cover" rule sometimes takes an existing part that fits by accident.
- Speed rest up for larger memories (only re-evaluate pairs touched by the last step).

# C76 · Composition by binding a sample: findings

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after development seed 1. Output: `out.txt`. A
simulation of cells, columns and segments only; no list of assemblies is consulted when recalling.

## Results (no competition; recall from one whole part; full / clean, %)

**16 cells per column**

| binding per part | links per composition | M = 10 | 50 | 200 | 500 |
|---|---|---|---|---|---|
| 1 cell | 6 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| **2 cells** | **30** | **100 / 100** | **100 / 92** | **100 / 74** | **100 / 45** |
| 3 cells | 72 | 100 / 98 | 100 / 88 | 100 / 63 | 100 / 30 |
| every cell to every other | 132 | 100 / 96 | 100 / 86 | 100 / 47 | 100 / 17 |

Other cells intruding per recall at M = 500: 68 with two cells per part, 1,273 with every cell wired. Segment checks per
recall at M = 500: about 2,400 against 122,000.

**4 cells per column:** the same order (two per part cleanest: 94% at M = 10 against 84% for every cell), but everything
blends from M = 50 on: 400 cells can't hold hundreds of parts apart.

**Competition within columns** (the most-supported cell wins, a tie refuses the column) lowered full recall and did not
raise clean recall at either size.

## Predictions

| | prediction | result |
|---|---|---|
| P1 | one cell per part: full ≤ 5% at 16 cells per column | **Holds:** 0% everywhere. |
| P2 | two per part: full ≥ 95% at 16 cells per column | **Holds:** 100% everywhere. |
| P3 | two per part at least as clean as every cell wired | **Holds:** at every size and load (e.g. 45% against 17% at M = 500). |
| P4 | 30 binding links against 132 | **Holds** (by design). |
| P5 | two per part falls below 60% clean by M = 500 | **Holds:** 45%. |
| P6 | competition within columns adds ≤ 5 points | **Holds:** it lowered it. |
| P7 | two per part does ≤ half the work of every cell wired | **Holds:** about 2% of it. |

## What it means

- **The bar of two sets the size of a binding.** One sampled cell per part never brings the rest back; two always does.
  Nothing chose that number: it follows from segments firing at two active links, which follows from the prices.
- **The smallest binding is also the best.** Two cells per part uses under a quarter of the links of wiring everything,
  recalls the whole composition just as reliably, intrudes far less (45% clean against 17% at the heaviest load) and does
  about a fiftieth of the work. More links don't make memory more reliable here, only noisier: every extra link is
  another way to fire by chance. That is the energy rule's preference (the cheapest description that still completes)
  and a cleaner memory at once.
- **This gives composition a price at the level of cells:** the links in its binding segments. That is something the
  engine's old price (a placement plus the cost of naming which unit) can't express.
- **Load is the limit.** As more compositions are stored, cells get reused by chance, bindings overlap, and recall starts
  spreading into other compositions (clean 100% → 45% from 10 to 500 compositions at 16 cells per column; everything
  blends at 4). Competition within columns didn't stop it. What should stop it is competition between whole memories,
  as in C74, not tried here.
- **Not shown here:**
  - which cells to sample (the first two of each part were taken; any two would do the same here);
  - when a binding should be kept (the experience store, or paying over repetition);
  - binding from a part only partly seen;
  - a Z whose parts share a junction cell.

## Given by hand (declared)
The world (random parts and compositions); which cells were sampled (the first K of each part); the number of rounds (6).

serves: CTR-1 CAP-3, CAP-4, CAP-11, OPZ-3, CON-18.

# D-02 · Energy and bonds (C82-C85): what can go into the core

A review at the owner's request (15 November 2026), before bringing the results of C82-C85 into the core: each change
read against the reference models and both contracts. The owner decided on the two open questions (below).

| Change | From | Core tests on it | Models | Contracts | Decision |
|---|---|---|---|---|---|
| **Heat meter:** the moment reports heat in three shapes (unheld, unthere, twice) | C84 | 16 of 16, and a test of its own | RM-6 names two of the shapes as local heat; the third is RM-5's refused tie | Reporting only: changes nothing the machine does. Serves CTR-1 OPZ-4 | **In the core** (`Moment.heat`) |
| **Loosen:** a joint that brings back what the input has replaced loses one segment per cell | C82 | 16 of 16 | Beyond RM-8, which leaves a composition of the two pieces alone | Towards CON-1, but unconditional. On its own it forgets any whole built from parts when its first rival arrives, however often it was seen (C83: 0% at every k), a loss against CAP-3 that no core test checks. Symmetric (QST-15) | **Kept out** (owner): to come in with a clean way to harden lasting wholes |
| **Harden:** a whole seen again is tied again from its parts | C83 | 15 (test 9) | Not in any model | Reads a whole's parts from each cell's first segment (a declared reading, a violation); grows on every repetition, unconditionally (CON-1) | Kept out: not distilled |
| **Squeeze:** a full column clears its least-backed cell for reuse | C84, C85 | 16 of 16 | RM-1's fresh cell grows a memory on top of a used one when none is free; open | CON-14. In C84 it never acted; in C85 it mattered only with the bill at the fit | Kept out: no evidence of its own |
| **Densify:** a whole wholly seen again fills in a missing link | C84, C85 | 15 (test 12) | Not in any model | Made no difference in C84 or C85 | Kept out |
| **Fade:** a segment that brings back a cell not there loses a link | C84 | 13 | Not in any model | Frayed the objects and tripled growth in C84; untried with the bill at the fit (backlog) | Kept out |
| **The bill at the fit:** a memory explains an input only if it explains as many cells as it claims that aren't there | C85 | 11 (tests 9, 12, 13, 14, 16) | Fills RM-6's gap ("support stands in for saving") with RM-9's prices | Serves CAP-6 (thresholds from prices) and CON-1, but breaks CAP-3 (a few active pieces bring back the whole): a quarter of the square no longer brings back the whole | **Kept out** (owner): until "not there" can be told from "not seen yet" (QST-16) |

**What stays open:** the energy rule at the level of cells (RM-9) is still the largest gap. C85 gives the strongest lead
so far (the bill at the fit, with somewhere for one-offs' heat to go), and it waits on QST-16. The next experiment is in
the [backlog](../backlog.md): pruning by heat rather than by capacity.

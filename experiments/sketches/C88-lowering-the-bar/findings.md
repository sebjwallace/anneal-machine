# C88 · Lowering the bar (primitive): findings

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after development seed 1 (`dev.txt`). Output: `out.txt`.
The rule: [model.md](model.md). Serves: CTR-1 CAP-1, CAP-11, CON-18 (work only where something is active); CTR-2 CON-2,
CON-7. Theory: [flow and heat](../../../docs/theories/flow-and-heat.md), section 7.

## Results

| link | met | step (mean, range) | shared at the meeting | woken by then (the link's first end) | woken settling to the end |
|---|---|---|---|---|---|
| "cat mammal" (true) | 5 of 5 | 2.0 (2-2) | 3.8 cells; all of "walks" in 3 seeds | 1 thing | 8 things |
| "fish mammal" (false) | 5 of 5 | 2.6 (2-3) | 3.2 cells; no whole thing | 1 thing | 8 things |
| "cat flies" | 0 of 5 | | | | 8 and 1 |
| "bird walks" | 0 of 5 | | | | 1 and 8 |

Seed by seed: "cat mammal" met no later than "fish mammal" in 5 of 5 (sooner in 3); it shared more cells in 3 of 5,
and more whole things in 3 of 5.

## Predictions

| | prediction | result |
|---|---|---|
| P1 | connected links meet in every seed, unconnected in none | **Holds.** |
| P2 | "cat mammal" shares more cells than "fish mammal", ≥ 4 of 5 seeds | **Fails:** 3 of 5. |
| P3 | "cat mammal" shares more whole things, ≥ 4 of 5 seeds | **Fails:** 3 of 5. |
| P4 | at the meeting, ≤ 2 things woken from the first end, against ≥ 7 to the end | **Holds:** 1 against 8. |
| P5 | "cat mammal" meets no later than "fish mammal" in every seed | **Holds:** 5 of 5. |

## What it means

- **Lowering the bar gives the deep locality.** At the moment the fronts meet, each end has lit about one thing in
  the deep, where settling to the end lights eight. The aha happens in a small, lit region, not across the whole
  world. That is what C87 lacked.
- **Connected or not still decides, cleanly.** Connected links met in every seed; "cat flies" and "bird walks" never
  did.
- **A hint of near and far, no more.** "Cat mammal" never met later than "fish mammal" and met sooner in three seeds
  of five. That's the direction the owner's picture predicts, but it's weak.
- **The size of the aha isn't graded yet.** I expected "cat mammal", with three walking mammals behind it, to meet on
  more at once. In three seeds it met on the whole of "walks", and "fish mammal" never met on anything whole. But in two
  seeds there was no difference, so the predictions on breadth fail. Two reasons are visible. First, the core's rounds
  are counted in cells, not things, and the fronts are compared at the first cell they share, which can be a single
  handle cell. Second, the "mammal" front spreads fast (to four or five things by the meeting), so it does most of the
  travelling, and what "cat" has behind it matters less. In this primitive form the bar is lowered evenly on both
  fronts. A primed deep, as the owner expects, or a bar that drops more slowly where there is more support, could change
  both.
- **Primitive, as intended.** Nothing here notices the meeting by itself, holds both ends, or turns the aha into a
  sink. The experiment shows that the signal and the locality are there.

## Violations (CTR-2 CON-7)

- **Given by hand (CON-2):** the world and its teaching; a blank before every input.
- **The test** is run by the experiment: two fronts settled separately, one round at a time, compared after each. The
  deep doesn't hold both ends or detect the meeting itself.
- **Engine change:** `Volume.spread`, the core's settling reported round by round. It learns and changes nothing.
- **Measured by our code:** fronts, meetings and things are read from the cells.

# C01 The pattern catalogue (setup, not a test)

**What:** 104 designed 5x5 black-and-white patterns in 15 families, plus a noisy flash stream and a viewer.
**Source of truth:** `world/catalogue.js` (plain Node, no dependencies; also inlined into `viewer.html`).

## Families
bars 10 · diagonals 6 · half bars 12 · corners 8 · big Ls 4 · Ts 6 · crosses 7 · boxes 6 · blocks 7 · letters 8 · brackets 2 · chevrons 4 · steps 2 · bar pairs 16 · bar triples 6

## Built in on purpose
- **Shared parts:** everything is drawn from bars, corners, boxes and blocks. 33% of pairs share 3+ cells. 68 patterns sit whole inside at least one other; half bars are the most shared (inside up to 17 others).
- **Same shape, different place:** 18 shapes appear in more than one position (rows, columns, small corners, small Ts, small pluses, small boxes, blocks, bar pairs).
- **The bars problem:** 22 patterns made only of full bars laid over each other (bar pairs, bar triples), plus Ts, plus, frame, U, H, E, F, which are also bar compositions. Each carries its `parts` for later composition scoring.

## The stream
Random order, with a fresh shuffle each pass so every pattern is seen equally often. Each flash flips every cell independently with chance `noise` (5% means about 1.25 flips per flash; checked). Seeded.

## Checks (`node check.js`)
104 patterns, 0 duplicates, ink 3 to 17 cells (mean 7.3), noise 1.25 flips per flash at 5%, each pattern seen exactly 100 times in 10,400 flashes.

## Open choices for the owner
- Hold-out set for experiment 3 (new patterns from known parts): bar triples are the natural candidate, never shown in training.
- Ink varies a lot (3 to 17 cells). Fit-based measures cope with this; raw-overlap ones (the spatial pooler) favour big patterns. Worth watching.

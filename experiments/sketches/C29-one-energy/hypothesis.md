# C29 · One energy across seeing and change: hypothesis

## Question
C28 showed that kinds rarely pay for themselves when energy only counts seeing. A kind saves a little structure, but every
use must name its filler. Change memory is priced separately, so the fact that a kind lets one change cover every
variant is never counted.

What happens if seeing and change are priced in **one** energy? Total = structure + flow + change, where change is the
cost of the different changes remembered plus the cost of naming which change each step used.

## Prediction
- Kinds that make one change stand for several variants will now lower total energy and be kept.
- Fewer distinct changes are remembered than with the plain engine.
- Next-picture prediction improves on variants it has seen, because one change learned from any variant applies to all.
- On variants it has never seen, prediction improves only as far as the kinds' filler sets already cover the new part.

## Setup
- World: 16×16 episodes of 6 pictures. Three bases, each with its own motion: table → right, frame → down, cart → left.
  Each base carries a top piece (cap / peak / dots).
- Shown combinations as listed in `world.js`. Held out: frame+dots and cart+peak.
- Three versions on the same 100 episodes, resting every 98 pictures:
  1. the plain engine (`src/engine/see.js`);
  2. kinds with seeing-only energy (C28);
  3. kinds with one energy (`c29.js`).
- Test: predict the next picture from the remembered changes. Report exact matches, pixel overlap (IoU), and the
  "staying put" baseline.

## Purity
There are no new numbers. The change costs use the same placement price and the same naming cost as seeing (see
`changeCost` in `c29.js`).

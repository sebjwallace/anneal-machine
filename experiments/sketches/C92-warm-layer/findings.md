# C92 · The warm layer: findings

Run: `node run.js` (`out.txt`). Engine: `engine/`, a copy of `src/engine` with the one change described in
[hypothesis.md](hypothesis.md) (in `tally.js` and `volume.js`, marked "C92 sketch"). Twenty seeds per arm; every seed
gave the same outcome, so the numbers below are 20 of 20 or 0 of 20.

## Results

| probe | core | warm layer |
|---|---|---|
| "AB" then "E" | "E" takes a fresh cell, nothing brought back | **"E" reuses its learnt cell, "F" brought back** (but also "ABCD", see below) |
| "AB" then "C" | fresh cell, nothing | "C" reuses its cell, "D" brought back (also "ABEF") |
| nothing, then "E" | fresh cell, nothing | **the same: nothing** |
| "AB", a gap, then "E" | fresh cell, nothing | **the same: nothing** (warmth gone) |
| "AB" then an unrelated "X" | nothing | **nothing** |
| three alternatives ("CD", "EF", "GH" on "AB"), "AB" then "G" | fresh cell, nothing | "G" reuses its cell, "H" brought back (also the rest) |
| same world, "AB" then "X" ("XY" was never warm) | nothing | **nothing** |

## What it shows

- **One cell is enough when the place is warm.** After "AB", a lone "E" finds its own learnt cell every time and brings
  "F" back with it. In the core, the same "E" takes a fresh cell every time: the creep RM-10 lists as open ("an input
  with too little context keeps learning fresh cells"). The warm layer stops that creep here, with no new structure
  grown for it.
- **Warmth tops up but never wakes.** Nothing comes back without a cue, nothing comes back after a gap, and an input
  that lands outside the warm patch ("X") wakes nothing extra. "XY" stays quiet even with "CDEFGH" all warm.
- **The variable was held open and closed by the cue.** "AB" held "CD", "EF" and "GH" warm, none surfaced, and the
  next letter picked which one surfaced. That is RM-10's "holding a variable open", done with cells and one moment of
  carry-over, with no list of fillers and no new mechanism beyond the warmth.

## What didn't go as hoped, and why

- **"CD" came back with "EF".** This is the core, not the warmth. Shown "EF" fully seen, with no warmth at all, the
  core already brings back all of "ABCD": "EF" completes its whole "ABEF", which brings back "AB", and "AB", being only
  brought back and not seen, isn't evidence for the competition between alternatives (RM-5, PRN-5), so it brings back
  every whole it belongs to. The warm "E" does exactly what a seen "EF" does. The leak is the core's (it sits with
  declared gaps 13 and 14) and would show up whenever a part of a composition wakes the whole.
- **Warmth refreshes itself while input keeps coming.** Each moment brings back the rest, and what is brought back is
  next moment's warmth, so in "AB", "C", "D" the warm set grew to nearly everything ("ABCEFGH"). It only fades on a gap.
  Together with the leak above, that is the "never fades" risk in a mild form: one moment of warmth is a given that
  hides it, not a rule that solves it.

## Honesty

- The one-moment lifetime, and taking warmth from what was brought back, are given by hand (declared). Nothing in the
  sketch prices warmth (RM-9 is still missing), so nothing yet says why some warmth should stay and some go.
- No puppeteering of which assembly surfaces: that falls out of the counts.
- Tiny world, clean inputs. It shows the mechanism exists, not that it scales.

## Next

1. **Fix the leak first, in the core** (done in [C93](../C93-brought-back-competes/findings.md)): a whole brought back through a part should still compete with its alternatives
   once the cue has picked one ("EF" picked, so "ABCD" held back). Without that, warmth will spread through every
   shared part.
2. **Then how warmth fades,** by something other than a clock: e.g. warmth that keeps being brought back but never
   seen is heat ("unthere"), and the energy rule should be what lets it go.

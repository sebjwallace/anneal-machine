# Findings C28: kinds

*Hypothesis: `experiments/sketches/C28-kinds/hypothesis.md`. Model: `experiments/sketches/C28-kinds/kinds.js` (a copy of `src/engine/see.js` with kinds added). Runner: `run.js` (`WORLD=rich` for the richer world).*

## What was added (pure: nothing but structure and moves, every move judged by energy)
- **A kind** is a composite with one **slot** that holds any of a **set** of fillers. A set can be shared by several kinds.
- **Costs, in the one currency:**
  - the slot is one placement;
  - each filler in a set is named once;
  - every use names which filler: log₂(fillers) ÷ log₂(pixels).
- **Moves at rest:** make (from two composites that differ in one placement), widen (add a filler), share (two kinds use one set), and fold back (a kind into separate composites).
- **No thresholds, no new numbers.**
- **One change to the copy, for kinds' sake:** a composite keeps its own frame, rather than being shifted to the top-left corner. For ordinary composites this changes nothing.

## Results
**Simple world** (two-piece objects: a box or post with something on top):
- **No kind forms.** Energy says it doesn't pay. Each object is only two placements, so there's no shared structure to save, and naming the filler on every use costs more than it saves.
- Identical to the plain engine. *Predictions 1 and 2 were wrong here; prediction 4 held.*

**Rich world** (three-piece bases, four fillers):
- **One kind forms, at the real difference,** which is finer than predicted. The machine had already split the fillers: "cap" and "hook" share a three-pixel bar and differ by one pixel. The kind is "frame + bar + one pixel in one of two places".
- **Never seen, frame + dots:**
  - recognised as the kind in one placement, with a slight mismatch (heat 0.11, cost 3.73);
  - the plain engine explains it as two unrelated composites (cost 4.18).
- **Explaining 200 new pictures:** 530 with kinds, 556 without.
- **No filler sharing between kinds** (table and frame). Energy doesn't support assuming that the frame can take every filler the table takes.

**A few sightings of the new combination (frame + dots):**
- With kinds, after 2 sightings and a rest, it's recognised exactly in one placement (heat 0, cost 1.60).
- **The plain engine never absorbs it** (still two placements, heat 0.06, after 4 sightings). It's explained well enough that it's never stored, and nothing at rest takes it in.

## What it says
1. **Kinds are real, but energy is stingy with them.** They form only where the shared structure outweighs the cost of naming the variation on every use. That's Occam's razor, in the engine's own currency.
2. **The engine finds the true difference,** not the one we drew. Variation sits wherever comparison puts it.
3. **Kinds help absorb new variants quickly:** two sightings, against never.
4. **Generalising beyond the evidence (sharing fillers) isn't rewarded** by an energy that only counts what has been seen. Whether that's right (don't assume what you haven't seen), or whether the energy should also count how well structure predicts, is an open question for the owner.

## Not yet in the main line
Kinds stay in `experiments/` until the open question is settled and kinds show value in a world where variation matters more.

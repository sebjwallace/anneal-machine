# Findings C25: learning the rules of moving things, then imagining them

*World: `world/bumpers.js` (the true rules; the machine only ever sees pictures). Rules: `models/rules.js`, on C21's cells and the C20 model (which can now take a bigger world through `globalThis.WORLD_SIZE`; default unchanged). Runner: `sketches/C25-bumpers/run.js` (`SIZE`, `DEMOS`, `R`, `WALL` from the environment). Page: `viewer.html`, built by `build.js`.*

## The world (owner's idea; rule table agreed)
- There are squares (2×2) and diamonds (4 pixels). Everything moves one cell a step, up, down, left or right.
- At a wall, an object turns round and steps back.
- When two objects come within one cell of each other, both turn round and step back:
  - the one hit from below flips (square ↔ diamond);
  - the one hit from above becomes a square;
  - from the side, nothing else changes.

## How the machine learns it
- **Shapes from pictures (C20):** exactly two units, the square and the diamond, and nothing else.
- **Each object is one cell (C21),** followed from one picture to the next by nearest.
- **Per object, per step, one observation,** all relative to where the object is now:
  - before: where it was a moment ago, what it is now, anything within 5 cells (now and a moment ago), and walls within 2 cells;
  - after: what it is next.
  - The "moment ago" is the history that the backlog said would tell a moving thing from a still one. Each object carries its own direction this way.
- **At rest:** observations with exactly the same after are compared, and what their before shares becomes a rule (the C24 decomposition, per object).
- **Predicting:** the rule that fits and has never been wrong, with the most detail; otherwise the least wrong. Every object gets a prediction every step, so many objects run in parallel.
- **Imagining:** given the first two pictures, predict everything's next state, make that "now", and repeat with no input. Drawn back onto the grid.

## Results (24×24 world, 1,875 two-object demonstrations, rest about 4 s)
- **Next step, new two-object meetings:** 97% of whole scenes right. Moving on 99%, turning round 97%, changing shape 97%.
- **Next step with FIVE objects (never shown more than two):** 85% of whole scenes right. Moving on 100%, turning round 78%, changing shape 67%.
- **Imagining five objects with no input** (30 starts), objects where the truth has them:
  - at step 1: 99%;
  - at step 5: 83%;
  - at step 10: 72%;
  - at step 20: 57%;
  - at step 40: 27%.
  - Median first difference from the truth: step 8. A rule always fitted (never stuck).

## What it took (and what it says)
1. **Coincidences.** At first, rules picked up walls and objects that happened to be nearby, for example "a still diamond with walls at these distances stays put", which had never been wrong by chance. Looking less far (5 cells for objects, 2 for walls) and more varied demonstrations fixed most of this.
2. **Crowding.** In 16×16, six objects pile into three-way bumps that two-object demonstrations never show, so 24×24 gives a fairer test. Rules learnt from pairs can't know what a three-way pile-up does.
3. **Coverage.** Rules are tied to exact relative positions, so every way of meeting has to be seen: each side, each offset, each pair of directions, each pair of shapes. Head-on-only demonstrations gave 39% on roaming bumps; adding off-centre meetings and more demonstrations raised that a lot. This is the main limit now.

## Next
- **Rules that don't depend on exact offsets** (graded positions, or a comparison that also finds what's shared across offsets), so one bump learnt generalises to nearby geometries. This is the coverage problem above, and is on the backlog.
- **Self-correction (owner's idea, separate experiment):** imagination drawn out to the grid comes back in as input, and surprise corrects it. Learning would need to be off, or marked as imagined, so it doesn't learn from its own fiction.
- **Walls:** the machine is told the distance to the border as context, not learnt from pixels. Learning it from pixels needs the "keep position when it matters" fix.
- **Three-way bumps:** genuinely new situations; what should a machine do with no rule for them? Today it falls back to the least-wrong rule.

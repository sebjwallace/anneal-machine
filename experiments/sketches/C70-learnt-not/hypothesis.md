# Hypothesis 05: NOT as learnt inhibition

*Hypothesis for sketch 37, November 2026. Not yet tested.*

---

## Why

Everything the automaton learns so far is positive. Links strengthen when things fire together. The only inhibition is competition, which is blunt: symmetric, unlearnt, and able only to say "fewer things win". It can't say "*this* should suppress *that*".

A system with only positive feedback reinforces itself. We hit that repeatedly:
- sketches 15 and 16 locked into the relations they used most;
- sketch 26 learnt from its own decisions and locked in its early mistakes;
- exceptions could only be handled by out-voting a general rule.

A homeostat needs a negative feedback loop as well as a positive one.

## The claim

Inhibition can be learnt from misfit, as locally and as unsupervised as everything else.

- **Learn:** when context C is active, X is driven (predicted), and X does *not* happen, that is heat at X. Cells of C grow or strengthen an **inhibitory link** to X. Its meaning is "when C, not X".
- **Unlearn:** if X happens while C is active, the inhibition weakens.
- **Balance:** inhibition is kept in check by a homeostatic rule, of the kind shown by Vogels and colleagues (2011), in which inhibitory synapses adjust to keep each cell's activity near a target. Without balance, learnt inhibition could silence everything.
- **Placement:** on a whole cell, it means "C suppresses X". On a segment (hypothesis 04), it gives AND NOT: "A and B, unless C". This sketch tests the cell-level form. Segment-level NOT comes after both work.

## Predictions

1. **Exceptions without collateral damage.** "white bird flies", "black bird flies", … and "penguin bird" doesn't. With learnt NOT, the exception holds while the general rule stays intact for other birds. With positive links only, either the exception fails or the rule weakens for everyone.
2. **Identity by inhibition.** Two entities seen together (co-presence) learn mutual inhibition between their identity parts. That separates "grey cat" from "grey dog" without the hand-written bookkeeping of sketches 27–28.
3. **It breaks self-reinforcing loops.** Rerun sketch 26's setting, where learning from its own decisions locked in early mistakes. Learnt inhibition from its own wrong predictions acts as the counterbalance, and the lock-in breaks.
4. **It stays balanced.** Inhibition doesn't grow without bound. Activity stays near its usual level, and nothing is permanently silenced.

## The test (sketch 37)

Three parts, run in order of difficulty:

1. **Exceptions:** a small world of kinds with a general property and a few exceptions, including exceptions introduced late (a rule learnt first, the exception arriving afterwards). Compare positive links only against learnt inhibition. Measure:
   - the exception honoured;
   - the general rule intact for the rest;
   - recovery if an exception later stops being one.
2. **Identity:** the entity world of sketch 27, with co-presence feeding learnt inhibition instead of bookkeeping. Measure wrong-entity rate and duplicates against sketch 27.
3. **Lock-in:** sketch 26's setting with and without learnt inhibition. Measure whether the learnt changeability comes out the right way round (activity changeable, colour and animal not), and the wrong-entity rate.

For all three: settings fixed before running, fresh seeds, a sweep of the balance strength chosen in advance, and anything changed after looking marked post hoc.

## What would count against it

- Inhibition only works with hand-placed links, or with a strength tuned per world.
- It silences more than it should: the general rule breaks, or activity collapses.
- It doesn't break sketch 26's lock-in, which would mean negative feedback isn't the missing counterbalance after all.

## Ways it could fool us

- If inhibition is learnt from the *correct* answer rather than from the automaton's own failed prediction, it is supervision.
- A late exception tests unlearning; an early one only tests learning. Include both.

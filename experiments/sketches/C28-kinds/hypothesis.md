# C28 · Kinds: hypothesis

## Question
Can the engine learn that several slightly different things are **one kind with a variation**, using only what it already has (comparing, and energy deciding)? And does that let it recognise combinations it has never seen?

## World
Small pictures of objects built from a **base** and a **filler** on top.
- **Base "box":** seen with fillers *cap*, *peak* and *dots*.
- **Base "post":** seen with *cap* and *peak* only.
- **Held out:** *dots* on a post, never shown in training.

## Mechanism (nothing new except one structure and the moves that make and unmake it)
- **A kind** is a composite with one place, a **slot**, that holds any of a list of fillers.
- **Cost, in the engine's one currency:**
  - its placements once, plus naming each filler once (structure);
  - every use names which filler, costing log₂(number of fillers) ÷ log₂(pixels in the world);
  - placing the kind costs the same as placing anything.
- **Forming:** at rest, two composites identical except for one placement are compared. The candidate "one kind with these fillers" is kept only if total energy falls.
- **Widening:** a composite matching a kind's shared part plus one other placement adds that placement as a filler, if energy falls.
- **Sharing fillers:** two kinds whose filler lists overlap can use one shared list, if energy falls. This is the generalising step.
- **The reverse moves** (fold a kind back into separate composites) exist too, and are kept only if energy falls.

## Predictions
1. **Kinds form:** one kind for "box + something" (3 fillers) and one for "post + something" (2 fillers), instead of 5 separate composites, with total energy lower than without kinds.
2. **Sharing:** the two filler lists overlap (cap and peak), so they share one list, provided energy says so. Then *dots on a post* is recognised as a single placement with no heat, though it was never seen.
3. **Without kinds** (the current engine), dots on a post is explained as post + dots, two placements, recognised as nothing in particular.
4. **Nothing else gets worse:** the same shapes are recovered, and no new numbers or rules are needed.

## How we'll know
Compare with the engine as it is (`src/engine/see.js`) on the same pictures:
- units;
- total energy;
- kinds formed and their fillers;
- placements and heat for held-out pictures;
- the original 12×12 world still learnt as well.

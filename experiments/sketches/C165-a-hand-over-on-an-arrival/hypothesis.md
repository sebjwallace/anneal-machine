# C165 · A hand-over on an arrival: hypothesis

The first small step from [schema and spatial memory](../../../docs/theories/schema-and-spatial-memory.md) (§9, step
1): **can one way of working, on reaching its end, hand over to another, inside the memory, with nothing outside it
saying when?** Everything is written by hand, and nothing is learned. This tests the representation, not learning, as
[procedures from states and transitions](../../../docs/theories/procedures-from-states-and-transitions.md) §10 advises.

## The pieces

- **Frame A**, the reading frame as learned in earlier experiments: works a written sum column by column, right to
  left, carrying the sign along, until it runs past the sum's left end.
- **Frame B**, a second, deliberately simple way of working, written by hand: walks back to the right, one column at a
  time, copying each answer digit onto the row below (with a copying family of facts: a digit gives itself), until it
  runs past the sum's right end. It exists only to be something different that has to follow A.
- **The arrival.** When a step finds nothing (phase 5 with no units digit), the fixed machinery switches on a
  **Stalled** cell for that moment. This is architecture, of the same kind as the existing cell that marks a lane as
  settled. It's what turns "nothing left" into something the memory can respond to, since the memory can't see an empty
  place.
- **Frames are held by their own running.** Each frame's parts are kept on by the clock while it runs, and fade when the
  clock stops. Earlier, the circuit held its single step as a state for ever. Holding by the clock is what lets one frame
  give way to the next. This is a change to the fixed architecture, declared.
- **The procedure.** A cell P, brought on by the cue to begin along with frame A, and held. Its hand-over is one gate:
  **P, Stalled, and a sparse sample of frame A's parts open a hand-over cell**, and the hand-over cell brings on frame
  B's parts and starts the clock. The extra moment lets A's parts fade before B's arrive. Also architecture: after a
  hand-over, the focus stays where it is.

## Arms

1. **Procedure held**, as above.
2. **No procedure** (control): the same frames and machinery, but P is never brought on.
3. **Hand-over keyed without A's sample** (control): P and Stalled alone open the hand-over. This shows what the sample
   of A is for: without it, B's own ending would trigger B again.

Test: 200 written additions, 3 to 6 digits.

## The ledger

**Given:** both frames, the procedure and its hand-over gate (all by hand); the Stalled cell, holding frames by the
clock, and the focus staying put after a hand-over (fixed architecture); the page (the encoder); the facts. **The
engine:** everything that happens once the cue is given.

## Predictions (fixed before running)

1. **Procedure held:** in every sum, A works the sum right (100%), then exactly one hand-over, then B copies the answer
   onto the row below (100%) and ends with the focus back under the column where the sum started, and the whole run stops
   by itself.
2. **No procedure:** A works the sum, then everything stops. Nothing is copied, in every sum.
3. **Hand-over without A's sample:** after B ends, the hand-over fires again (B is brought back on), so the run doesn't
   stop by itself, or stops only at the step limit.

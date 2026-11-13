# C30 · The memory threshold: hypothesis

## Question
Awake, a picture is remembered whole (a snapshot) when more than 10% of it is left unexplained or wrong (threshold 0.9,
the owner's number from C14, decision 003). Otherwise it goes into the flow for rest to deal with. Is 0.9 a good value,
could it be adaptive, or can it be replaced by something that follows from the energy rule, with no number at all?

## Prediction
- **Fixed values.** Low thresholds (0.5, 0.7) remember only pictures that are mostly new, so early learning is slower
  but structure ends about the same, because rest pulls snapshots apart anyway. High thresholds (0.99, 1.0) remember
  almost everything at first, which makes more memories and longer rests, but rest should cut them down to the same
  parts. Expect the units and energy to change little between 0.7 and 0.99; the main difference is run time.
- **0 (never remember awake).** Rest's moves only rearrange parts that already exist (split, group, fold, fuse, unpack,
  re-describe). With no parts at all, nothing can start: expect **no structure learnt**.
- **"Store only if it is cheaper now" (picture on its own).** Storing a picture costs its pixels plus one placement;
  leaving it in the flow costs at most its pixels (every pixel loose). So storing can never be cheaper for one picture
  taken alone: this rule should be the same as 0, and learn nothing. A memory only pays because the same thing comes
  back, which a single-picture comparison cannot see.
- **"Store only if total energy falls" (structure + the whole flow).** Measured against the flow, a snapshot pays only if
  it explains enough of earlier pictures in the flow. Whole pictures rarely recur in these worlds, so expect very few
  snapshots and weak learning. The payoff of a snapshot comes later, after rest pulls it apart, and a one-step energy
  check cannot see that.
- **"Compare at rest" (no awake memory; at rest, the part that two flow pictures share is offered as a new part and kept
  only if energy falls).** This follows the "compare, don't average" idea and needs no number. Expect it to learn the
  shared shapes directly from the flow, possibly more cleanly than snapshots, at extra rest time.

## Setup
- Engine copied from `src/engine/see.js` into `see.js` here, with the remembering rule switchable (`o.remember`).
- World (a): the 12x12 scene world of `src/test/see.js` (600 scenes, seed 4242, rest every 98), scored the same way
  (300 fresh scenes: dictionary + explaining, heat).
- World (b): the C29 16x16 moving-object world (100 episodes, 600 pictures, seed 1, rest every 98), scored by
  next-picture exact/overlap with C29's rules/predict code.
- Settings: thresholds 0, 0.5, 0.7, 0.8, 0.9, 0.95, 0.99, 1.0; "cheaper now"; "energy falls"; "compare at rest".

## Purity
The fixed thresholds are numbers by design (that is what is being tested). The energy alternatives use only the
existing prices. Any hidden number in them is reported in the findings.

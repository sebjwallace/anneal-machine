# C137 · A filler carried: hypothesis

The first sketch on learned computation: frames, and passing what varies from one state to the next. Related:
[RM-10 frames](../../../docs/reference-models/RM-10-frames.md),
[learned computation](../../../docs/theories/learned-computation.md),
[procedures from states and transitions](../../../docs/theories/procedures-from-states-and-transitions.md),
[C101 held states](../C101-held-states/findings.md), [C82 rebinding](../C82-rebinding/findings.md).

## The question

A frame is a constant part with a part that varies. A procedure is frames chained by transitions. For that to be
computation and not lookup, **a transition learnt on the constant part has to carry whatever fills the varying part into
the next state, including a filler never seen in that transition**, and with nothing outside the memory doing the carrying.

The arithmetic walk-through in the learned-computation note doesn't test this: "5 − 3" lands on 2 because "5 − 3 = 2"
was memorised. Here the filler in the test has never been in the frame at all, so memorising can't be the answer.

## The world

The smallest frame there is, two moments long: "put" with an animal, then "in" with the same animal.

```
moment 1   "put" "cat"         moment 2   "in" "cat"
moment 1   "put" "dog"         moment 2   "in" "dog"
moment 1   "put" "hen"         moment 2   "in" "hen"
```

"fox" is known (a state "fox" "den", formed elsewhere), but has never been with "put" or "in".

Each word is its own population of one member: the encoder's choice (a word encoder, declared; C135), so each thing is
the same cell wherever it appears (decision 009). The engine is C136's copy, unchanged; the refractory period is off.

## How the episodes are learnt (the two ways the owner wants tested)

Both ways form each moment as a state (what is active together is bound, CAP-5): "put" "cat", "in" "cat", and so on.
They differ in the transition from one moment to the next, which is the owner's open question for transition memory:
does a transition link whole states, or only what changed?

- **Whole.** A chain from every member of the first moment to every member of the second: "put" → "in", "put" →
  "cat", "cat" → "in", "cat" → "cat".
- **Change.** A chain only for what changed: "put" → "in". "cat" didn't change, so nothing is formed for it.

Neither way is anneal: the engine copy's anneal cuts runs within one sequence, not across moments of states. That
grouping across moments is missing from the core is already noted (learned computation §4); here the learning is
written as the experiment's own rule, declared, and the question is what each kind of structure does.

## How activity moves (three ways)

- **Core.** The engine's invoke as it stands: each moment, what is active is only what gates open plus the input.
  Nothing stays on because it was on.
- **Hold.** The owner's rule from C101: a state lasts until a rival takes its place. A member active now stays active
  next moment unless a member that is its alternative (the engine's own `between`) comes on. Everything else (gates,
  competition, input) is the core's.
- **Hold and hand on.** As hold, plus: a member a transition has carried activity forward from lets go. When "put" →
  "in" fires, "put" has done its work and the state has changed. This is the one rule added for the sketch, from
  transition memory ("a state persists until an input changes it": the transition firing is the change) and from the
  procedures note's arrivals versus held states. It is what is under test, not a given.

That is six arms (two ways of learning, three ways of moving).

## The probes

Each probe starts from nothing active. The input is given at the moments shown; after it, up to four empty moments run.

| probe | input | what is right |
|---|---|---|
| **carry** | "put" "fox", then nothing | the moment after: exactly "in" "fox" |
| **trained** | "put" "cat", then nothing | the moment after: exactly "in" "cat" |
| **alone** | "put", then nothing | the moment after: "in" and no animal (none guessed, CON-10); a held tie of animals is acceptable, a single invented animal is not |
| **replace** (the control) | "put" "fox", nothing, then "cat", then nothing | after "cat": exactly "in" "cat", "fox" gone |

The control is there because holding can pass carry trivially if nothing ever turns off. Holding counts as working only
if it carries the filler when it should and lets go of it when it shouldn't keep it.

## Predictions (fixed before running)

1. **Core fails carry with both ways of learning.** "fox" is dropped: nothing keeps it on. With change, the moment after
   is "in" alone. With whole, "in", "cat", "dog" and "hen" all follow "put" and stand in the same place, so they are
   rivals with equal support and are held as a tie: nothing comes on, and activity dies.
2. **Change with hold carries "fox" but doesn't move on:** "put" is not a rival of "in", so it stays: "put" "in" "fox".
   Counted as a fail (the frame hasn't moved on).
3. **Change with hold and hand on passes carry:** exactly "in" "fox".
4. **Whole fails carry under every way of moving.** The tie at "put" stops "in" from coming on, so there is nothing for
   "fox" to be carried into.
5. **Replace fails in every arm.** "fox" is in no transition, so it has no alternatives, and nothing can take its place:
   after "cat" the state is "in" "fox" "cat". If this holds, letting go of a filler needs the filler to have a type
   (rivals), and change-only learning, by keeping fillers out of transitions, never gives it one.
6. **Change with hold and hand on passes alone** ("in", no animal) **and trained** ("in" "cat").
7. Not predicted: trained and alone under whole learning.

If 3 holds and 5 holds, the result is: **carrying needs no binding of the filler to the frame at all; the frame's
transition moves around what stays. Letting go is the hard half, and it needs types.** If 3 fails, the dynamics of
holding as written can't carry, and the next sketch has to look elsewhere.

# C137 · A filler carried: findings

Run: `node carry.js > out.txt` (instant; every moment of every probe is in [out.txt](out.txt)). Read
[the hypothesis](hypothesis.md) first. The engine is C136's copy, unchanged. Everything deterministic: one run is the
result.

## In short

**A filler never seen in the frame was carried, in one arm only:** learning only what changed, with holding and handing
on. "put" "fox" became "in" "fox", though nothing had ever bound "fox" to "put" or "in". The transition is on the
constant part alone; "fox" stays because it is held and nothing displaces it. Carrying needed no binding of the filler
to the frame.

**Two failures:**
- **The familiar case is worse than the novel one.** The *trained* filler, "cat", failed in every arm. What was
  memorised about "cat" in the frame holds "put" on, so the frame never moves on. This wasn't predicted.
- **Nothing lets go of "fox"** when "cat" arrives (replace, as predicted). "fox" has no rivals, because rivals come only
  from transitions and "fox" is in none.

| learning | moving | carry | trained | alone | replace |
|---|---|---|---|---|---|
| whole | core | fail: (nothing) | fail: "put" "cat" | fail: (nothing) | fail: "cat" |
| whole | hold | fail: "put" "fox" | fail: "put" "cat" | fail: "put" | fail: "cat" "fox" |
| whole | hand on | fail: "put" "fox" | fail: "put" "cat" | fail: "put" | fail: "cat" "fox" |
| change | core | fail: "in" | fail: "put" "in" "cat" | **pass**: "in" | fail: (nothing) |
| change | hold | fail: "put" "in" "fox" | fail: "put" "in" "cat" | fail: "put" "in" | fail: "put" "in" "cat" "fox" |
| change | hand on | **pass**: "in" "fox" | fail: "put" "in" "cat" | **pass**: "in" | fail: "in" "cat" "fox" |

What is right: carry "in" "fox"; trained "in" "cat"; alone "in" with no animal; replace "in" "cat" (judged the moment
after the input, as set in the hypothesis).

## What it shows

### 1. Carrying is the frame moving around what stays

In the passing arm, at moment 2, "put" hands on to "in" through the one learnt transition, and "fox" is simply still
there: held, because nothing that stands in its place came on. The next state is "in" "fox". No bond between "fox" and
the frame was formed or needed. This is the cheap kind of passing a variable: same cells, new surroundings. It works
because each thing is the same cells everywhere (decision 009), so there is nothing to copy.

It needed all three parts. Without holding (core), "fox" drops: activity is only what gates open plus the input, and
nothing opens for "fox". Without handing on (hold), "put" stays beside "in" and the frame never moves on: "put" "in"
"fox", for ever. Without learning only what changed (whole), the frame can't move at all (below).

### 2. Linking whole states is memorising, and it blocks the frame

With whole-state transitions, "in", "cat", "dog" and "hen" all follow "put", so to the engine they stand in the same
place. They are rivals with equal support, the tie is held, and nothing comes on: from "put", activity dies (core) or
"put" just sits there (hold). It even makes nonsense rivals: "cat" and "put" both lead into "in", so in replace, "cat"
arriving displaced "put".

This answers the owner's open question for transition memory (whole states or only what changed), in this world at
least: **only what changed.** A transition over whole states binds each filler into the step, which is exactly the
memorising that carrying has to avoid.

### 3. The trained filler fails because its memorised moment holds itself on

The unexpected result. With "put" "cat" as input, the memorised state "put" "cat" (formed in training, because each
moment was bound as a state) completes, and its gate reopens every moment, turning "put" and "cat" on again. Checked
directly: at moment 2, "put" is turned on by the state "put" "cat", "cat" by the same state, and "in" by the transition
from "put". The state "in" "cat" completes too, so the result is "put" "in" "cat", held.

Handing on can't help: "put" isn't being held, it's being turned on fresh by its state each moment. This is C104's
pile-up (a completed assembly keeps its members on) appearing in frames. The memory does worse on what it has seen than
on what it hasn't, which is the wrong way round.

Two ways out, neither tested:
- **Don't bind fillers into the moments.** If the frame is learnt as the transition on the constant part only, a trained
  filler is carried exactly as "fox" is. But then "cat" has never been in the frame, so the frame has no type (see 4).
- **A transition closes the state it leaves.** Handing on applied to states, not just members: when "put" hands on to
  "in", the state containing "put" lets go. That keeps the memorised moments but stops them holding the frame in place.

### 4. Letting go needs a type, and only what changed never gives one

In replace, "cat" arrives while "in" "fox" is held. "fox" should give way. It doesn't, in any arm. The engine's rivals
(`between`) come only from transitions: two members are rivals if they have followed the same thing, led into the same
thing, or stood in the same place in a chain. "fox" is in no transition, so nothing is its rival, and nothing can take
its place.

This is the hard half. Carrying worked *because* fillers were kept out of transitions; letting go fails *for the same
reason*. Whatever gives fillers a type has to come from somewhere other than the transitions. Types from surroundings
(C66) are one candidate: "cat", "dog" and "hen" have all stood beside "put" and "in" in states. But the engine reads
rivals only from transitions, so that would be a change to what counts as standing in the same place.

### 5. Alone passed without guessing

"put" alone gave "in" and no animal, in both arms where "in" came on cleanly (change with core, change with hand on).
Nothing invented a filler (CON-10). With whole-state learning, the held tie meant nothing came on.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | core fails carry: change gives "in" alone, whole dies in a tie | **Holds.** |
| 2 | change with hold carries "fox" but keeps "put" | **Holds:** "put" "in" "fox". |
| 3 | change with hold and hand on passes carry | **Holds:** "in" "fox". |
| 4 | whole fails carry under every way of moving | **Holds:** the tie stops "in" every time. |
| 5 | replace fails everywhere; "fox" has no rivals | **Holds**, for that reason (the trace shows "fox" held every moment). |
| 6 | change with hold and hand on passes alone and trained | **Half:** alone passes; **trained fails** (3 above). |

## What was given (puppeteering, declared)

- **The encoder:** one member per word. Each word is one cell, everywhere.
- **The learning:** each moment bound as a state, plus the transition rule (whole or only what changed), written by
  the experiment. The engine's anneal doesn't group across moments (learned computation §4), so this is the experiment's
  own rule, not something the engine did.
- **Hand on:** the one rule added for the sketch. Whether it can come from the engine's own dynamics (for example,
  transitions acting on arrivals, not on what is held, as the procedures note asks) is open.
- **Hold:** the owner's rule from C101, using the engine's own rivals.
- **Judging:** exact active set, one moment after the input.

The engine itself is unchanged. Every hold and every release has a recorded cause in the trace (CON-8).

## What it suggests next

1. **The trained case:** test the two ways out in 3 side by side (no fillers in the moments, or a transition closing the
   state it leaves) against carry and trained together. The bar: both pass, and alone still passes.
2. **Types for letting go:** give fillers rivals from where they have stood in states, not from transitions, and check
   replace passes without breaking carry.
3. **Learning the frame, not writing it:** once 1 and 2 work with the learning written by hand, see whether grouping
   across moments (what changed, and what stayed) can come out of the engine's own comparison.

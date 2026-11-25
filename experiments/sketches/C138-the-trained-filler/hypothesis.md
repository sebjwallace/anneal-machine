# C138 · The trained filler: hypothesis

Follows [C137](../C137-a-filler-carried/findings.md). There, a filler never seen in a frame ("fox") was carried from
"put" "fox" to "in" "fox", with transitions learnt only on what changed, holding (C101), and handing on (a member a
transition carries forward from lets go). But the trained filler "cat" failed in every arm: each training moment had
been bound as a state, and the state "put" "cat" kept switching itself back on, holding "put" in place, so the frame
never moved on. The memory did worse on what it had seen than on what it hadn't.

C137 named two ways out. This sketch tests them side by side.

## The world

As C137, but three moments long, so that chaining is tested too (computation is chaining frames):

```
moment 1   "put" X       moment 2   "in" X       moment 3   "shut" X        X = "cat", "dog", "hen"
```

"fox" is known (a state "fox" "den"), never in the frame. One member per word (the word encoder, declared). Engine:
C137's copy, unchanged. Transitions learnt only on what changed ("put" → "in", "in" → "shut"), as C137 found right.
Moving: C137's hold and hand on.

## The three arms

- **A · as C137.** Each training moment bound as a state ("put" "cat", "in" "cat", "shut" "cat", ...). The baseline.
- **B · no fillers in the moments.** Nothing is bound per moment. The frame is only its transitions on the constant
  part. A trained filler has then never been in the frame, the same as "fox".
- **C · a transition closes the state it leaves.** The moments are bound as states, as in A. When a transition carries
  activity forward from a member, every state containing that member stops turning members on that moment: handing on
  applied to states, not only to members. A member that state was turning on stays on only if something else turns it
  on, or if it is held (it was on, and no rival came on). The one rule changed from C137, declared.

## The probes

Each starts from nothing active; the input is given at moment 1; then up to four empty moments.

| probe | input | what is right |
|---|---|---|
| **carry** | "put" "fox" | moment 2 exactly "in" "fox", moment 3 exactly "shut" "fox" |
| **trained** | "put" "cat" | moment 2 exactly "in" "cat", moment 3 exactly "shut" "cat" |
| **alone** | "put" | moment 2 "in", moment 3 "shut", no animal at either |
| **replace** | "put" "fox", then "cat" at moment 2 | not expected to pass in any arm (no types yet, C137 §4); run to see that nothing here makes it worse or accidentally fixes it |

## Predictions (fixed before running)

1. **A** passes carry and alone, and fails trained: "put" stays on through the pile-up ("put" "in" "cat" at moment 2,
   and more piling up after).
2. **B** passes carry, trained and alone. Trained behaves exactly as carry does, because "cat" is now as new to the frame
   as "fox".
3. **C** passes carry, trained and alone. At moment 2 for trained: "put" lets go (handed on, and its state closed), "cat"
   is held, "in" arrives through the transition. At moment 3 the same happens with "in" handing on to "shut".
4. **Replace fails in all three**, as in C137: "fox" has no rivals.

## Why both B and C matter even if both pass

B passes by forgetting which fillers have been in the frame. C passes while keeping that record. Letting go needs types
(C137 §4), and the obvious place for a filler's type is where it has stood: beside "put", "in" and "shut" in the
moments. B throws that away; C keeps it. So if both pass, C is the one the next sketch (types for letting go) can build
on, and B is the cheaper one if types turn out to come from elsewhere.

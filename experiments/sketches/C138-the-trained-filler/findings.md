# C138 · The trained filler: findings

Run: `node trained.js > out.txt` (instant; every moment of every probe is in [out.txt](out.txt)). Read
[the hypothesis](hypothesis.md) first. Engine: C137's copy, unchanged. Deterministic: one run is the result.

## In short

**Both ways out fix the trained filler, and every prediction held.** With no fillers bound into the moments (B), or with
a transition closing the state it leaves (C), "put" "cat" goes to "in" "cat" and then "shut" "cat", exactly as "put"
"fox" does. Carry and alone still pass in both, and the frame now chains across three moments. Replace still fails in
every arm, as expected: nothing has given "fox" a type.

| arm | carry | trained | alone | replace |
|---|---|---|---|---|
| A · as C137 | **pass**: "in" "fox" / "shut" "fox" | fail: "put" "in" "cat" / "put" "in" "shut" "cat" | **pass**: "in" / "shut" | fail: "in" "cat" "fox" / "in" "shut" "cat" "fox" |
| B · no fillers in the moments | **pass**: "in" "fox" / "shut" "fox" | **pass**: "in" "cat" / "shut" "cat" | **pass**: "in" / "shut" | fail: "in" "cat" "fox" / "shut" "cat" "fox" |
| C · a transition closes the state it leaves | **pass**: "in" "fox" / "shut" "fox" | **pass**: "in" "cat" / "shut" "cat" | **pass**: "in" / "shut" | fail: "in" "cat" "fox" / "shut" "cat" "fox" |

Each cell shows what was active at moment 2 / moment 3. What is right: carry "in" "fox" / "shut" "fox"; trained "in"
"cat" / "shut" "cat"; alone "in" / "shut" with no animal; replace "in" "cat" / "shut" "cat".

## What it shows

### 1. The pile-up was the stored moments holding themselves on, and either fix removes it

A reproduces C137 over three moments, and it gets worse with length: the stored moments "put" "cat", "in" "cat" and
"shut" "cat" each complete and keep themselves on, so by moment 3 everything the frame has ever been is active at once
("put" "in" "shut" "cat"). The longer the procedure, the bigger the pile.

B removes the stored moments, so there is nothing to pile up. C keeps them but closes each one as its frame word hands
on. The trace shows it step by step: at moment 2, the state "put" "cat" is closed because "put" handed on; "put" lets
go; "cat" is held because no rival came on; "in" arrives through the transition. At moment 3 the same thing happens one
step later.

### 2. The frame chains

"put" → "in" → "shut" runs as two separate learnt transitions, and the filler stays through both. In every passing
case, the frame word at each moment is the one the transition brought on, and the one before it has let go. That is the
smallest instance of chaining frames, which is what learned computation needs. Nothing counted steps or tracked
position: each transition fired from what was active.

### 3. In C, the stored moments did no work in these probes

This needs saying plainly. In C, the trained filler is carried the same way as "fox": by being held, not by its stored
moments. The stored moments are closed as soon as the frame moves, so during the run they contribute nothing that B
doesn't do. They only show at the end: once nothing hands on, "shut" "cat" completes and keeps itself on (moments 4 and
5), which is a stable end state, not a fault.

So the case for C over B is not shown here. It rests on what the next sketch needs: letting go needs fillers to have a
type (C137 §4), and the obvious source is where a filler has stood, beside "put", "in" and "shut". C keeps that record;
B throws it away. If types come from somewhere else, B is simpler and costs less.

### 4. Replace: no better, no worse, and a small difference

Nothing here gives "fox" a rival, so "fox" stays when "cat" arrives, in every arm. In B and C the result is a blend:
both animals are carried into "shut" ("shut" "cat" "fox"). In A, the state "in" "cat" also keeps "in" on beside "shut"
(the pile-up again). The blend is the clearest picture yet of what's missing: the frame carries everything held, with no
sense of which things compete for the same place.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | A passes carry and alone, fails trained through the pile-up | **Holds:** "put" "in" "cat", then "put" "in" "shut" "cat". |
| 2 | B passes carry, trained and alone; trained behaves as carry | **Holds:** identical traces apart from the animal. |
| 3 | C passes carry, trained and alone, by closing the state then holding the filler | **Holds:** the trace shows exactly that order. |
| 4 | replace fails in all three | **Holds.** |

## What was given (puppeteering, declared)

- As C137: the word encoder (one member per word), the learning written by the experiment (moments as states in A and
  C; transitions only on what changed), hold (the owner's rule from C101), and hand on.
- **Arm C's closing rule** is a second added rule: handing on applied to states. It uses only information the engine
  already has at that moment (which transition gates fired, and from which members), and acts locally. Whether it can be
  folded into the engine's own dynamics, rather than sitting beside them, is open. It and hand on may well be one rule:
  "what a transition leaves lets go", for members and assemblies alike.
- Judging: exact active set at moments 2 and 3.

The engine is unchanged. Every hold, release and closing has its recorded cause in the trace (CON-8).

## What it suggests next

**Types for letting go**, built on C: give fillers rivals from where they have stood in the stored moments ("cat",
"dog" and "hen" have all stood beside "put", "in" and "shut"), and test whether replace passes while carry, trained and
alone still pass. This is where C has to earn its keep over B. A fair version also has to face "fox": it has never
stood in the frame, so it has no type there. Whether "fox" should give way to "cat" at all (does carrying "fox" make it
a filler, and so a rival?) is a question for the owner before the sketch is written.

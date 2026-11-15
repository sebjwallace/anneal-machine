# C86 · Poles and arms: findings

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after development seed 1 (`dev.txt`; one change declared
there). Output: `out.txt`. The rule: [model.md](model.md). Serves: CTR-1 CAP-11 (two kinds of memory), CAP-15 (held
states as other volumes' activity), CAP-4; CTR-2 CON-2, CON-7. Theory: [flow and heat](../../../docs/theories/flow-and-heat.md).

## Results (pooled over five seeds and all eight checkpoints)

| | "x" brings back exactly its current value | "ABC" brings back "D" and nothing else |
|---|---|---|
| core (one volume) | 0% | 100% |
| loosen (one volume, C82) | 100% | 53% |
| two volumes, read from the fast one | 100% | 53% |
| two volumes, read from the slow one | 0% | 100% |
| two volumes, both together: slow learns | 0% | 53% |
| two volumes, both together: slow set | 100% | 53% |

The fast volume's segments stayed at 34-37 throughout; the slow volume's at 58 (learning) or 30 (set).

## Predictions

| | prediction | result |
|---|---|---|
| P1 | core: "x" ≤ 5%; "ABC" ≥ 95% | **Holds:** 0%, 100%. |
| P2 | loosen: "x" ≥ 95%; "ABC" ≤ 90% | **Holds:** 100%, 53%. |
| P3 | two volumes: "x" from fast ≥ 95%; "ABC" from slow ≥ 95% | **Holds:** 100%, 100%. |
| P4 | "x" from slow ≤ 5%; together ≤ 5% when the slow learns | **Holds:** 0%, 0%. |
| P5 | "ABC" together ≤ 90%, below slow alone | **Holds:** 53% against 100%. |

## What it means

- **Two volumes keep both kinds of knowledge intact.** The fast volume, with loosening, holds "x"'s current value
  through every rebinding. The slow volume, without it, keeps "ABCD" through every rival. No single volume does both:
  the core keeps "ABCD" and loses "x"; loosening keeps "x" and loses "ABCD" about half the time. The fast volume
  relearns nothing: its assemblies are over the slow volume's cells, the arms turning on the poles.
- **But the machine has no single answer yet.** Read together, as one machine would have to answer, the two volumes
  disagree and the result is worse than either alone. When the slow volume goes on learning, it ties "x" to every value
  it has ever seen, so together they bring back all five values. And after a recent "ABEF", the fast volume answers
  "ABC" with "EF" as well as "D". Only by choosing which volume to read for which question did the split look perfect,
  and that choice was mine, not the machine's.
- **So the open question is how slow and fast meet.** In the owner's picture, the fast part works on top of the slow
  part and settles against it. Here they never meet: each volume brings back its own answer, and nothing makes them
  settle together. The next step is a rule by which the two volumes' answers compete, or the fast one's brought-back
  cells feed back into the slow one, so that disagreement between them is heat, settled like any other.
- **What sinks is still open too.** Keeping the slow volume from learning the fast bonds was done by hand (slow set).
  Left to learn, it filled up with every binding of "x".

## Violations (CTR-2 CON-7)

- **Given by hand (CON-2):** the inputs and their order; a blank before every input; teaching before the stream. In
  "slow set", the slow volume's segments put back after every live moment (from outside the volume): the largest given,
  and the arm only shows what a slow volume that learns nothing of the fast bonds would do.
- **Architecture, declared:** one fast column per slow cell; loosening on in the fast volume only; four cells per column.
- **Fixed in the development run:** the first version read each probe from the volume that suited it. Reported now from
  both volumes and together; the claim rests only on the "together" rows, which show the gap.
- **Measured by our code:** what is brought back, read from both volumes' reports and mapped from fast columns to slow
  cells by name (the wiring).
- No bookkeeping in either volume; both are the core's machinery (the fast one with C82's loosening).

# C160 · Keeping what episodes share (a taste): findings

A quick taste, by agreement: `node taste.js > out.txt`, under a minute. Read [the hypothesis](hypothesis.md) first.
Engine: C159's copy, unchanged.

## In short

**Keeping the overlap turned context from pulling the right way into mostly deciding.** With each frame also bound to
what its episodes share, recall from the cue plus the new page's view brought back a frame for most sums, and almost
always the right one. **Right answers went from 7 to 24% to 69 to 88%** across the four kinds, on the same sums and
seeds as C159. **One wrong frame was recalled in 320 sums** (a long first row brought back the reading frame).

**The overlaps formed are what you'd hope, plus some noise.** After an addition and a subtraction, the reading frame
had "0 carried in" as an overlap, then "+, 0 carried in" after a second addition, and "−, 0 carried in" after a second
subtraction. The holding frame got "×, 0 carried in" from its first two multiplications. But overlaps also kept digits
that two sums happened to share in the same place (both started with a 4 in the top row's tens, say), so some of the
abstractions are a clean sign plus a coincidence.

**What's left: still no frame for 10 to 30% of sums.** The likely cause, read from the overlaps formed and not traced
sum by sum, is those coincidental overlaps. "+, 0 carried in, 5 in the bottom units" is as lean as "+, 0 carried in",
and where a new page doesn't have the 5 it's one member short, so the abstractions disagree among themselves and some
pages tie. More examples should help, because coincidences don't repeat, while the sign does, and repeated overlaps
build up copies.

## Results

| kind (80 sums over 4 seeds) | with overlaps: recalled | right | episodes only (as C159): right |
|---|---|---|---|
| + | reading 64, nothing 16 | **80.0%** | 7.5% |
| − | reading 64, nothing 16 | **80.0%** | 7.5% |
| × one digit | holding 70, nothing 10 | **87.5%** | 23.8% |
| long first row | holding 55, nothing 24, reading 1 | **68.8%** | 13.8% |

Overlaps formed in seed 1, in order (the sign's place is under the starting column, "0 carried in" is the carry
above it):

| after | overlaps bound |
|---|---|
| 44 − 18 (reading) | {4 in the top's tens, 0 carried in} |
| 332 × 79 (holding) | {0 carried in, ×} |
| 402 + 455 (reading) | {5 in the bottom's units, 0 carried in, +}, {0 carried in} |
| 607 − 390 (reading) | {7 in the top's units, 0 carried in}, {0 carried in, −}, {0 carried in}, {0 in the top's tens, 0 carried in} |
| 642 × 4 (holding) | {0 carried in, ×}, {2 in the top's units, 0 carried in, ×} |
| 826 × 23 (holding) | {2 in the top's tens, 0 carried in, ×}, {0 carried in, ×} |

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | with overlaps, nearly every sum recalls a frame, the right one; all four kinds mostly right, far above C159 | **Mostly holds:** 69 to 88% right, against 7 to 24%. Not "nearly every": 10 to 30% still recall nothing. |
| 2 | the risk: the reading frame's near-empty abstraction ("0 carried in") wins on multiplications | **Barely happened:** once in 160 multiplications. The holding frame's "×" won otherwise. |

## The ledger

**Given:** as C159 (the two frames as already learned, the signs' meanings, binding the start view with a frame), plus
intersecting views in the binding rule (a general operation, not told which places matter, but done by a rule, not by
the engine's own dynamics). **The engine:** settling, binding, recalling with the view, and running every test sum.
**Disclosed:** a first version of the rule counted the just-stored episode among the earlier views, which would have
bound a copy of every episode as its own "overlap". That was caught when reading the code before the run, and fixed
before the run. Only the fixed version was run.

## What it suggests next

1. **More examples, to see whether coincidences wash out.** If what's left is coincidental overlaps, then more worked
   sums should leave the clean abstractions ("+", "−", "×", each with "0 carried in") with many more copies than any
   coincidence. That's a cheap check, and it matters: it's the difference between abstraction working and abstraction
   working only on tidy data.
2. **Let the engine find the overlap itself.** Here a rule intersects. The owner's idea that competition between
   overlapping assemblies pulls activity to their overlap would make the intersection the memory's own doing.
3. **Then back to long multiplication:** with context choosing the frame, the restart to the next row and adding the
   rows.

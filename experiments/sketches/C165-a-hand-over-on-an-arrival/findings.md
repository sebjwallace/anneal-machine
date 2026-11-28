# C165 · A hand-over on an arrival: findings

Run: `node handover.js > out.txt`, under twenty seconds. Read [the hypothesis](hypothesis.md) first. Engine: C163's
copy, unchanged. The circuit is written for this test in `handover.js`.

## In short

**One way of working, on reaching its end, handed over to another, inside the memory, every time.** In all 200 sums,
frame A worked the sum right, ran out past its left end, and that arrival (the Stalled cell) together with the held
procedure brought on frame B, exactly once. B then walked back to the right copying the answer onto the row below (right
in all 200), and ran out under the column where the sum had started. Nothing outside the memory said when to switch.

**The procedure is what does it.** With no procedure held, A worked the sum and then everything went quiet: no
hand-over, nothing copied, in all 200. So B doesn't start up by itself when A ends. The held procedure's hand-over is
what brings it on.

**The sample of A in the hand-over is what makes it a hand-over *from* A.** Keyed on the procedure and the arrival alone,
the hand-over fired again when B ran out, brought B back on at the right-hand end, B ran out at once, and so on: a loop,
in all 200. With the sample of A's parts in the key, B's own ending can't trigger it. That's the owner's sparse sample
doing a precise job: it says which frame this hand-over follows.

**One prediction failed in a useful way: the procedure never lets go.** Once B ran out, everything went quiet except
the procedure cell itself, which holds itself for ever. The engine reports that as a state repeating every moment. The
work stops by itself. The held context doesn't. That is the "letting go" question the earlier note left open (§4 of
procedures from states and transitions): something has to release a procedure when it's finished.

## Results

| arm | A right | hand-overs per sum | B copied the answer | B ran out under the start column | how the run ended |
|---|---|---|---|---|---|
| procedure held | 200 of 200 | 1, in all 200 | 200 of 200 | 200 of 200 | only the procedure left on (repeating every moment) |
| no procedure | 200 of 200 | 0, in all 200 | 0 of 200 | not run | went quiet by itself |
| hand-over without A's sample | 200 of 200 | 2, in all 200 | 200 of 200 | 200 of 200 | a loop (B brought back on, every 6 moments) |

The first sum, 179 + 901 (procedure held): A ran out at moment 30 with the focus one column past the sum's left end. The
hand-over brought B on, B copied 1080 onto the row below, ran out at moment 60 under column 9 (where the sum started), and
only P was still on at the end.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | procedure held: A right, exactly one hand-over, B copies, ends back under the start column, the whole run stops by itself | **Holds, except the last part:** the work stops, but the procedure stays held, repeating. |
| 2 | no procedure: A, then everything stops, nothing copied | **Holds.** |
| 3 | hand-over without A's sample: B is brought back on after it ends; doesn't stop by itself | **Holds:** two hand-overs, then a loop. |

## The ledger

**Given:** both frames, the procedure and its hand-over gate, all by hand; the Stalled cell (fixed machinery switching a
cell on when a step finds nothing); frames held by their own running (a change to the architecture from earlier
experiments, where the one step was held as a state for ever); the focus staying put through a stall and hand-over
(architecture); the page; the facts. **The engine:** everything after the cue. **Disclosed:** the first run measured
"ended under the start column" from the last recorded moment, where only the procedure is left on, so it read 0 for every
arm. It was corrected to use where B ran out. No other change.

## What it shows, in the theory's terms

A procedure super-assembly can hand over from one way of working to the next **on an arrival**, without being a
controller: it is held context, and the hand-over is one gate that only opens when the procedure is held, an arrival
happens, and the frame that just ended is the one the hand-over follows. All three were needed, as the controls show.
Two things it doesn't yet do: **let go** when it's finished, and be **learned** (everything here was written by hand).

## What it suggests next

Following the theory note's steps: next, **a spatial super-assembly and a jump, by hand**. A way of working that moves
the focus to a place picked out by a larger spatial structure (where a line starts) rather than walking there. Letting
go of a finished procedure can come along with it, since the hand-over chain needs an end too.

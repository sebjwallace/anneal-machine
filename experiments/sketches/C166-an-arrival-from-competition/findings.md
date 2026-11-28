# C166 · An arrival from competition: findings

Run: `node handover.js > out.txt`, under forty seconds. Read [the hypothesis](hypothesis.md) first. Engine: C165's
copy, unchanged.

## In short

**The arrival no longer needs code to notice an absence.** With the clock's step after phase 5 given two
alternatives, carrying on (backed by the phase and a found digit) and Stalled (backed by the phase alone), "nothing
found" came from competition. **The results are identical to C165's in every arm and every sum:** one hand-over per sum
with the procedure held, none without it, a loop without the sample of frame A, and A and B right in all 200. Stalled
never cut a step short. The only differences are timing: Stalled now arrives one moment later, as it comes on through
the memory rather than being switched on in the same moment, and the loop in the third arm repeats every 7 moments
instead of 6.

So the one place where code saw something the memory couldn't is gone. **Absence is now the memory's own: the default
alternative that stands when nothing outcompetes it.** That's the owner's view of how associative memory says no,
working here.

## Results

| arrival | arm | A right | hand-overs per sum | B copied | B ran out under the start column | how the run ended |
|---|---|---|---|---|---|---|
| code (C165) | procedure held | 200 | 1 | 200 | 200 | only the procedure left on |
| code (C165) | no procedure | 200 | 0 | 0 | not run | went quiet |
| code (C165) | without A's sample | 200 | 2 | 200 | 200 | a loop (every 6) |
| **competition** | procedure held | 200 | 1 | 200 | 200 | only the procedure left on |
| **competition** | no procedure | 200 | 0 | 0 | not run | went quiet |
| **competition** | without A's sample | 200 | 2 | 200 | 200 | a loop (every 7) |

(Of 200 sums each.)

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | "competition" gives exactly C165's results in every arm | **Holds.** |
| 2 | Stalled never comes on while a digit is found | **Holds:** A and B right in every sum. |

## The ledger

**Given:** as C165, except the arrival: now two alternatives in the clock's fixed structure (what follows phase 5),
declared as architecture, replacing the code that noticed an absence. **Removed:** that code. **Still open from C165:**
letting go of a finished procedure; everything here written by hand.

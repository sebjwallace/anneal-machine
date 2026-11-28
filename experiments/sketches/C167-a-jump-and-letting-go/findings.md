# C167 · A jump, and letting go: findings

Run: `node jump.js > out.txt`, about twenty seconds. Read [the hypothesis](hypothesis.md) first. Engine: C166's copy,
unchanged. The circuit is written for this test in `jump.js`. Everything in it is by hand. Nothing is learned.

## In short

**A procedure can jump back to where it started, and let go when it's finished, both by completion and competition.**
In all 200 sums: A worked the sum, its end handed over to the jump, the jump brought the focus straight back to the
column where the sum started (one jump, no walking), C copied the answer from there, and when C ended the procedure let
go and the memory went quiet by itself. That's the first run in this line that stops completely without anything
being left on.

**The jump depends on the place being bound.** With the binding of the start place switched off, the jump brought on no
place at all, so C had nowhere to work and copied nothing.

**Letting go depends on Done winning.** Without it, the procedure stayed held at the end, as in C165 and C166.

**And the weakness predicted beforehand is real: a bound place is for ever.** Two sums one after another in the same
memory: the first was fine (50 of 50). But the second sum's jump brought on both its own start and the first sum's (50
of 50), and the second copy went wrong (right in 1 of 50, by coincidence). The binding of where a procedure started is
permanent structure, so every later run of that procedure jumps to every place it has ever started. Letting go releases
the procedure but not what it bound. **A procedure's place needs to be temporary** (a latch, in the owner's term), going
when the procedure lets go, and the engine has nothing temporary yet.

## Results

| arm | A right | jump landed exactly on the start column | C copied the answer | procedure let go | how the run ended |
|---|---|---|---|---|---|
| jump and let go | 200 of 200 | 200 of 200 | 200 of 200 | 200 of 200 | went quiet by itself, 200 |
| no start bound | 200 of 200 | 0 of 200 (no place brought on) | 0 of 200 | 200 of 200 | went quiet by itself, 200 |
| no letting go | 200 of 200 | 200 of 200 | 200 of 200 | 0 of 200 | procedure held on, 200 |

| second sum in one memory (50 pairs) | result |
|---|---|
| first sum worked and copied | 50 of 50 |
| second sum's jump brought on more than one place | 50 of 50 |
| second sum worked and copied | 1 of 50 |

First pair, for example: 385 + 708 worked at columns 8 to 11, then 113 + 730 at columns 3 to 6. The second jump brought on
columns 11 and 6 together, and the copy of the second answer came out as 0043 instead of 0843.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | jump and let go: A right, one jump to the start column, C copies, the memory goes quiet | **Holds**, 200 of 200. |
| 2 | no start bound: the jump brings on nothing, nothing copied, and the procedure is left held | **Holds, except the last part:** C still came on (with no place to work), ran out at once, and that ending let the procedure go. |
| 3 | no letting go: as 1, but the procedure stays held | **Holds.** |
| 4 | second sum in one memory: the second jump brings on both starts, and its copy goes wrong | **Holds:** 50 of 50 brought on both; the copy was right in 1 of 50. |

## The ledger

**Given:** the frames, the procedure, the hand-overs and Done, by hand; the binding rule for where a procedure starts,
frames held by their own running, the focus kept through a stall and the hand-over to C, the two alternatives after
phase 5, and the alternatives after the procedure (procedure or Done), all architecture; the page; the facts. **The
engine:** everything after each cue. **Disclosed:** one run.

## What it shows, in the theory's terms

The smallest piece of a spatial super-assembly, a procedure bound to the place where it began, gives a jump: a move to
a place picked out by something bigger than one step from the focus. Letting go works the way arrivals do, as an
alternative that wins only when its backing is there. Together with C165 and C166, a held procedure can now start, hand
over, jump, and finish cleanly, all inside the memory, though all written by hand.

What it exposed is the next real question: **things bound for one run of a procedure must not outlive it.** That's the
difference between a bond (lasting) and a latch (temporary) in the owner's language. The engine only has bonds.

## What it suggests next

**A latch: a temporary binding that goes when what made it lets go.** The smallest test is the second-sum arm from
here, with the start place bound as a latch tied to the procedure, so that the second sum jumps only to its own start.
After that, the pieces exist to put two rows of a long procedure together by hand (theory note §9, step 3).

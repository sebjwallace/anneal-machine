# C171 · Learning the hand-overs: findings

Run: `node learn.js > out.txt`, about four and a half minutes; `node which.js > which.txt` (a check written after the
first run). Read [the hypothesis](hypothesis.md) first, including the part added after the first run. Engine: C170's
copy, unchanged.

## In short

**The composition of long multiplication was learned, not written, once the working became a target rather than
something to read.** From a single worked example, the memory found which way of working follows the first row and
where it starts (the second-row frame, one column left of the start), and what follows that (the adding frame, at the
start itself). Exactly one pair of continuations settled the page, and it's C170's hand-written composition. Carried
into a fresh circuit, it did **200 of 200 new long multiplications right** from the cue, with no hand-over written by
hand.

**The first run found something more important first: a finished page doesn't show order.** With the working readable
on the page, as in every earlier experiment, two pairs settled every example: "second row, then add", and "add, then
second row". On a finished page the second row is already there, so the adding frame can read it before the memory has
made it. With two tied, nothing was learned. Only one of the orders works from a blank page.

**The fix is how a child uses a worked example:** do the problem yourself and check against the solution. The page
shows only what's given. The working is held as a target (for each place of the working, an agreement gate that cools
the place when a write there gives the target digit), and the frames read only what's given and what they've written
themselves. Then only causal orders can settle, and exactly one did, in every example. This also closes a quieter leak
in every earlier learning experiment: frames read carries from the worked page rather than from their own writes.

**The control behaved as expected.** With only the first row's working shown, the first row alone settles the page, so
every one of the 225 pairs settled equally and nothing could be chosen. Nothing was learned, and new multiplications got
only their first row.

## Results

| arm | pairs that settled, per worked example | learned | test: final sum = product | test: first row right |
|---|---|---|---|---|
| working readable, 3 examples | 2, 2, 2 | nothing (two orders tie) | 0 of 200 | 200 of 200 |
| working readable, 1 example | 2 | nothing | 0 of 200 | 200 of 200 |
| working readable, first rows only (control) | 225, 225, 225 | nothing | 0 of 200 | 200 of 200 |
| **working as a target, 3 examples** | **1, 1, 1** | **second-row frame 1 left of the start, then adding frame at the start** | **200 of 200** | 200 of 200 |
| **working as a target, 1 example** | **1** | **the same** | **200 of 200** | 200 of 200 |
| working as a target, first rows only (control) | 225, 225, 225 | nothing | 0 of 200 | 200 of 200 |

The two pairs with the working readable, in every example: S one left of the start then F at the start, or F at the
start then S one left (which.txt).

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | 3 examples: exactly one pair, C170's composition; 200 of 200 | **Fails:** two pairs (both orders), nothing learned. |
| 2 | 1 example: the same | **Fails** for the same reason. |
| 3 | first rows only: nothing learned, first rows only at test | **Holds** (every pair settles, so nothing is chosen). |
| 4 | working as a target, 3 examples: one pair, C170's; 200 of 200 | **Holds.** |
| 5 | working as a target, 1 example: the same | **Holds.** |
| 6 | working as a target, first rows only: nothing learned | **Holds.** |

## The ledger

**Given:** the three frames (two still by hand); the first frame at the cue; the candidates, proposed by the
experiment's code (225 pairs); the working marked as the target (the encoder); moving the learned structure into the
test circuit; the worked examples, written out by running C170's procedure (`teacher.js`, used only to produce worked
pages); architecture and encoder as C170, plus agreement gates and the Settled gate. **Removed:** the hand-written
hand-overs, jumps' relations and Done of C169 and C170. **Disclosed:** the target arms were added after the first run, with
their predictions written before they ran. `which.js` was written after the first run to list which pairs settled.

## What it shows

The composition of a multi-pass procedure, what follows what and where each part starts, can be found from one worked
example by the memory's own judge (everything settles), as long as the memory has to produce the working itself rather
than read it. A procedure is only learnable from its finished page if the learner can't use the page's future. That
holds for any procedure where later steps read earlier results.

## What it suggests next

The working-as-target principle should go back into the frame learning too. The trial lanes still read the worked page,
and fixing that is likely to change what earlier experiments learned in small ways. Then the next crutches: the
candidate proposal (now over both steps and composition), and the frames written by hand (the second-row frame and the
adding frame). Learning those frames with the working as a target would make the whole procedure learned from worked
examples, with only the proposing left as the experiment's.

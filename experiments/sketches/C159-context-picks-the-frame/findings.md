# C159 · Context picks the frame (a taste): findings

A quick taste, by agreement: `node taste.js > out.txt`, about fifteen seconds. Read [the hypothesis](hypothesis.md)
first. Engine: C158's copy, unchanged; lanes and circuit with one fix (below).

## In short

**When context decides, it picks the right frame every time, but most of the time it can't decide at all.** With each
frame remembered together with what was in view when it worked, recall from the cue plus the new page's view brought
back the reading frame only for additions and subtractions, and the holding frame only for multiplications. **Every
frame recalled was the right one, and every sum it was recalled for came out right.** But that happened for only 7 to
24% of sums. The rest recalled nothing. From the cue alone, nothing at all was recalled.

**Why nothing:** each remembered episode of a frame carries its own incidental digits. Two episodes of the same frame
agree on the sign but disagree on the digits, and two different digits in the same place are rivals. So the memory's
own episodes contend with each other, tie, and give nothing, even when they all point to the same frame. The sign
pulls the right way, but the memory has no way yet to keep what its episodes share and let the rest go.

**What that points to is abstraction.** What every episode of the reading frame has in common is the "+" or "−" under
the starting column. What every episode of the holding frame has in common is the "×". That overlap is the context
that matters, and the digits are what varies. If the memory kept the overlap of a frame's episodes (their
intersection), the frame would be bound to the sign alone, and there would be nothing incidental left to contend over.
That's the owner's "overlap becomes abstraction", and the natural next experiment.

**And a fault found and fixed on the way.** The first run showed the holding frame "settling" additions, which it can't
do. Attention to a place is shared across the lanes, so a lane holding a value could still take the digit from the
page in a later column whenever another lane was attending the same place. Fixed: the pick-up is now keyed on its own
moments, not on the phase. A note has been added to C157 and C158, whose findings stand (see there).

## Results

Training, seed 1: every additions and subtraction was settled by the reading frame only, every multiplication (one
digit and long first row) by the holding frame only. Views bound: 6 places, or 5 for a single-digit multiplication.

| kind (80 sums over 4 seeds) | with the view: recalled | right | from the cue alone |
|---|---|---|---|
| + | reading 6, nothing 74 | 7.5% | nothing 80 |
| − | reading 6, nothing 74 | 7.5% | nothing 80 |
| × one digit | holding 19, nothing 61 | 23.8% | nothing 80 |
| long first row | holding 11, nothing 69 | 13.8% | nothing 80 |

Wrong frames recalled: **0 of 320**. Before the fix the numbers were almost the same, except that additions recalled
nothing at all, because the holding frame's false settles had mixed "+" views into its episodes.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | with the view, each kind recalls its own frame, all four right | **Half holds:** whenever a frame is recalled it's the right one (0 wrong in 320), but most sums recall nothing. |
| 2 | from the cue alone, one frame for everything, or nothing on a tie | **Holds:** nothing, for everything. Every episode is now a different structure, so they all tie. |
| 3 | the risk: smaller views win regardless | **Didn't happen:** the holding frame (smaller views) was never recalled for an addition. |

## The ledger

**Given:** the two frames as C158 learned them, the signs' meanings, binding the start view with a frame (fixed
architecture), the view as everything within the frame's reach on the page as given. **The engine:** settling each
worked sum with both frames tried, binding, recalling with the view, and running every test sum. **Disclosed:** the
taste was run twice. The first run exposed the leak, the second ran with it fixed. Both results are described above.
4 seeds, 8 worked sums each, as agreed.

## What it suggests next

**Keep what a frame's episodes share.** When the same frame is bound again with a new view, also bind it with the
overlap of the views it's been bound with (an intersection, in the owner's set vocabulary). Then recall would see the
frame bound to "+" alone, or "×" alone, beside the incidental episodes, and the abstraction has nothing to contend
over. It needs no rule about which places matter: the overlap is whatever stayed the same. The question is whether it's
enough, and whether the episodes, still there, get in its way.

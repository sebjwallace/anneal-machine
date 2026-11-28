# C171 · Learning the hand-overs: hypothesis

Follows [C170](../C170-the-whole-long-multiplication/findings.md), where a whole long multiplication ran from one cue
inside the memory, with every structure written by hand. The owner asked to start removing the crutches, the smaller
ones first, working towards the agreed midpoint goal: **from examples with their working shown (no walkthrough), the
memory works out the procedure itself.** This takes out one hand-written piece: **the composition**, meaning which way
of working follows which, and where each one starts relative to where the procedure began.

## What's learned, and how

The memory is given **worked long multiplications** (all the working on the page, as in every experiment so far) and
the **three ways of working it already has**: the first-row frame, the second-row frame and the adding frame. The
procedure starts, as in C170, with the first-row frame at the cue.

When that frame ends, a continuation is tried: **one of the known frames, started at a place relative to the start
latch** (two columns left, one left, the same column, one right, two right), then, when that ends, another such
continuation. **The judge is the memory's own.** As the frames run on the worked page, each write that meets the same
digit already written there cools that place (an agreement gate, as in the trial lanes since C150), and a Settled gate
comes on only when every piece of the page's working has cooled. A pair of continuations that settles the whole page is
bound as the procedure's two hand-overs (the hand-over gates, the jumps and their relations, and Done), as the binding
rule binds a frame that settles.

The learned hand-overs are then carried into a fresh circuit, and new long multiplications run from the cue with **no
hand-over written by hand.**

## What's given (declared)

**Still given:** the three frames (as in C170, so two of them are still by hand); the first frame at the cue; **the
candidates**, proposed by the experiment's code (every known frame at every start relation within two columns, in
pairs: 225 pairs per example). This is the existing proposing crutch, now over composition rather than over single
steps. Also given: the working marked as heat (the encoder); moving the learned structure into the test circuit; the
architecture and encoder as C170, plus agreement gates and the Settled gate (as in the lanes). **Removed:** the
hand-written hand-overs, jump relations and Done of C169 and C170.

## Arms

1. **Learn from 3 worked examples, test on 200 new ones.**
2. **Learn from 1 example**, to see whether one is enough. The hand-overs are structure, not statistics, so it should
   be.
3. **Learn from worked first rows only** (control): examples whose page shows only the first row's working. No pair of
   continuations can settle a page that has nothing more to explain without writing where nothing is. Expected: what is
   learned is either nothing or a continuation that doesn't do the rest of the multiplication.

## Predictions (fixed before running)

1. **From 3 examples:** exactly one pair settles each example, the same pair each time: the second-row frame one column
   left of the start, then the adding frame at the start itself, C170's hand-written composition, found. Then 200 of 200
   new multiplications right from the cue.
2. **From 1 example:** the same pair, and the same 200 of 200.
3. **First rows only:** no pair settles (every continuation writes where the page has nothing, or disagrees), so nothing
   is learned, and new multiplications get only their first row.

## Added after the first run: the working as a target, not something to read

**What the first run showed** ([which.txt](which.txt)): every worked example was settled by two pairs, not one. One was
the second-row frame one column left of the start, then the adding frame at the start. The other was **the adding frame
at the start, then the second-row frame.** On a finished worked page the second row is already written, so the adding
frame can read it before the memory has produced it. A finished page doesn't show what has to come before what. With
two tied, nothing was learned. Only one of the two orders can work from a blank page.

**The fix, as a child does it:** do the problem yourself and check against the worked solution. On a worked page, the
working is **a target to agree with, not content to read.** The page shows only what's given. The working is held as
agreement structure (for each place of the working, a gate that cools the place when a write there gives the target
digit), and the frames read only what's given and what they have written themselves. This also closes a quieter leak in
every earlier learning experiment: frames read carries from the worked page rather than from their own writes. That was
harmless for a single frame, since it would have written the same carry, but it isn't harmless for order.

**Arms added:** the same three arms, with the working as a target. **Predictions, fixed before this second run:**

4. **From 3 worked examples, working as a target:** exactly one pair settles each example, the second-row frame one
   column left of the start then the adding frame at the start, and 200 of 200 new multiplications are right.
5. **From 1:** the same.
6. **First rows only, working as a target:** every pair whose continuations write nothing wrong would settle (the
   first row alone settles the page), so many settle, nothing is learned, and new multiplications get only their first
   row.

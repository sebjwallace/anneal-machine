# C170 · The whole long multiplication, by hand: findings

Run: `node whole.js > out.txt`, about twenty-five seconds. Read [the hypothesis](hypothesis.md) first. Engine: C169's
copy, unchanged. The circuit is C169's, two rows deeper. All by hand.

## In short

**A complete long multiplication runs from a single cue to its final answer, entirely inside the memory.** In all 200
(2- to 5-digit tops by 2-digit multipliers): the first row, a jump to one column left of the start, the second row, a
jump back to the start, adding the two rows, then letting go and going quiet. **The final sum equalled the product in
200 of 200.** For example, 288 × 80: the first row 00000, the second 02304 shifted, the sum 23040, then nothing left on.

The two jumps use the same start latch with different relations: "one to the left" for the second row, and "here
itself" for adding. Five pieces, four hand-overs, each on an arrival, each keyed on the procedure, the arrival and a
sample of the piece that just ended. No controller, nothing outside the memory between the cue and the answer.

**The second relation matters too.** With the adding started one column left (the same relation as the first jump),
there was no carry in place where it started, so it ran out at once and wrote nothing. 0 of 200 sums. The prediction
said the sum would come out wrong, right only when the first row's last digit was 0. It failed in a simpler way: the
adding never started. That's still the point: where each pass starts, relative to the anchor, has to be right.

## Results

| arm | first row right | second row right | second jump landed on the start column | final sum = the product | let go, went quiet |
|---|---|---|---|---|---|
| **the whole procedure** | 200 of 200 | 200 of 200 | 200 of 200 | **200 of 200** | 200 of 200 |
| adding starts one column left (control) | 200 of 200 | 200 of 200 | 0 of 200 | 0 of 200 | 200 of 200 |

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | the whole procedure: both rows right, the final sum = the product, quiet at the end | **Holds**, 200 of 200. |
| 2 | adding one column left: wrong nearly always, right only when the first row's last digit is 0 | **Holds in outcome** (0 of 200), **not in how:** the adding had no carry where it started and never ran. |

## The ledger

**Given:** the three frames (the holding frame and the adding frame's shape as learned earlier, the second-row frame
and this adding frame written by hand), the procedure, the four hand-overs, both jumps' relations and Done, all by hand.
Architecture as C169, with two more rows and reach five rows down. The encoder: the page, with a 0 carried in above
where each of the three passes starts, the sign once, the top number padded with two zeros, and a 0 placeholder in the
second row under the first row's last digit. The facts (multiplication and addition). **Disclosed:** a first attempt
crashed before running (wiring held values for the adding frame, which holds nothing). It was fixed, with nothing else
changed.

## What this is, and isn't

**It is** the first time the whole of a multi-pass procedure, procedures composed into a larger one, has run in this
associative memory from a single cue: starting, handing over on arrivals, jumping by a held anchor plus a relation,
finishing, and letting go, with the engine's own completion and competition doing all of it. That's the representation
the [schema and spatial memory](../../../docs/theories/schema-and-spatial-memory.md) note describes, shown to work.

**It isn't** learned. Every structure in it was written by hand. It also covers two-digit multipliers only (the
second-row frame is specific to the tens digit), and it leans on the encoder for the carries-in, the padding and the
placeholder. See the [crutch register](../../crutch-register.md).

## What it suggests next

1. **Learning one piece of it.** The most natural first is a hand-over. Given worked examples of two frames following one
   another, can the memory form the hand-over itself (the procedure, the arrival, the sample of the frame that ended)
   from their co-occurrence? That's the composition half of learning, and it's the owner's claim that super-assemblies
   emerge as abstractions.
2. **Any number of rows,** with one row frame that works for any multiplier digit, and a loop over the digits. That
   would be the first procedure whose length depends on the input.
3. **Trim the encoder's part:** the carries-in, the padding and the placeholder.

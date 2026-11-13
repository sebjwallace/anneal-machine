# 01 · Smelt: pulling parts out of raw pictures

## In one paragraph
The machine starts with nothing. It is shown small black-and-white pictures. Any picture it can't explain, it simply stores whole. Then, at rest, it compares the stored pictures with each other. Where two pictures share something, that shared piece becomes a **part**, and each picture is now described as parts placed in positions. Where the same group of parts keeps turning up in the same arrangement, that group becomes a bigger thing, a **composite**. Out of raw pictures come the pieces they're made of, and the things those pieces build.

## Why it matters
- **This is "compare, don't average".** Earlier attempts learnt by slowly averaging over many examples. That was slow and messy, and it blurred things together. Comparing two things directly, and keeping what they share, is fast and clean: one comparison can find a part.
- **Structure only exists if it pays** (see 02 · Heat). A part is kept because describing pictures with it is cheaper than without it.
- **Learning happens at rest,** from memories, not only in the moment of seeing.

## How it works
1. **Awake.** A picture arrives. The machine tries to explain it with the parts it has, placing each part where it fits best. If more than 10% of the picture is left unexplained or wrong, the picture is stored as a memory.
2. **Rest: pull apart.** Two parts (often two whole stored pictures) are laid over each other at every possible shift. At a shift where they overlap, the overlap can become a new part, and each original becomes "the overlap, plus what's left". A part can also be compared with itself, which finds a piece repeated within one picture. The split is kept only if it makes the total description cheaper.
3. **Rest: group.** If the same parts appear again and again with the same spacing (a roof just above a box), that arrangement becomes a composite, one layer up. It's kept only if that's cheaper.
4. **The reverse moves also exist:** fold a composite back into its pieces, or turn a composite back into one plain part. They're kept only when cheaper too.
5. Repeat until no change makes the description cheaper.

## What it showed
- From scenes of simple shapes and objects, the machine recovered every shape (block, plus, corner, box, chevron, bar, stick, diagonal) and every object (house, flag, twins) as single things.
- A house is a composite: a roof part placed above a box part.

## What to show people
- Two stored pictures sliding over each other, the overlap lighting up, and the overlap turning into a new part.
- A picture's description changing from "one big stored blob" into "these parts, placed here".
- The list of parts growing, then shrinking, as the machine settles.
- The house being found as roof plus box, without anyone telling it what a house is.

## Limits and open questions
- It compares pairs at single shifts. Big, repetitive structures, like a long wall of identical bricks, are hard for it to break into the repeating unit.
- Memories are currently kept exactly. Whether, and how, memories should fade is open (see the backlog).

## Where it lives
- Code: `src/engine/see.js` (awake: `step`, `explain`; rest: `rest`, `restStep`).
- Experiments: C16 (pulling apart), C17 (grouping), C18–C20 (refined).
- Findings: `experiments/findings/C16*.md`, `C17*.md`.

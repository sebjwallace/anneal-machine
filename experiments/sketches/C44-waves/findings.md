# C44 · Findings (out.txt; 0.2 s)

**Stage 1 (two walks sharing J).** A and O → **A → J → O**, never walked, after one round of pushing; G and P →
G → J → P. A and P (walked) comes back by ordinary recall with no pushing. P to A (backwards) → no way through.

**Stage 2 (a longer park, with side paths, a fork, and a part off on its own).**
- Only short walks in memory, no fork: A and O → the whole route A → … → O, after 2 rounds, 26 states lit.
- Plus two longer walks that were walked in one go: the same route after **1 round, 8 states lit**. The longer memories
  are the shortcut: the pushes meet higher up and the route comes back down through them.
- Two ways from C to E (by D or by K), only short walks: **undecided**, there are two equally good routes. With the
  longer walk A…E (by D) in memory: it takes the way it has actually walked.
- A and S (nothing connects them): **no way through**: it pushes until nothing new lights, nothing meets, it stays up.
- Side paths (C → X → Y, E → Z → W) are lit along the way but never filled in: lit from one side only, they don't settle.

**What's chosen, not derived.** Pushing is round by round from both ends at once; the first round where they meet
wins (fewest rounds); pushing stops when they meet or nothing new lights (no limit set). Memories here are given, not
learnt (C43 learns them). Meeting-then-recall is the same move at every level: each half is joined the same way until
one memory holds it.

**Honest note.** Pushing out from both ends round by round behaves like a two-sided search. What makes it the engine's
and not a bolted-on search: the steps are the engine's own memories at every level (a longer memory is a longer step),
and what's kept is decided by the engine's recall rule (two clues in one thing; a tie means no choice).

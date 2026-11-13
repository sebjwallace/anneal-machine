# C48 · Findings

**(1) Every engine test gives identical output** (cells, complete, change, see, kinds), compared line for line with
the current engine.

**(2) Walks are learnt as states, with no mix-ups.** Hub world: 12 walks, each held as itself (A J P, B J R, …).
A + P → A → J → P. Paired control: the two walks, nothing else. In C42 the same worlds gave nonsense (A + P came back as
A → C → P). Learning takes under a second.

**What it doesn't do yet (expected; later steps).**
- No sharing or general shapes formed: walks of three states are too short for sharing to save energy under the
  engine's prices (C43 needed a bigger hub). That is step 2 and the pricing decision.
- Asked "A then J, where next?", reading the picture picks one ending (R) instead of refusing: picture reading has no
  "don't choose on a tie" rule; completion from cells does. Seeing and completion differ here; worth deciding.

**The change.** In see.js: a point is [x, y] or [x, y, value]; keys, matching, overlaps, splitting and expanding keep
and compare the value (about 15 lines). No new moves, no new numbers.

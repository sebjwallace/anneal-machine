# C42 · Findings: stopped at step 1, for a reason that matters

Fast now (under a second), but the engine as it is **can't learn at the level of states**, so step 2 wasn't run.

**States as small marks (3 × 3, as in C38).** The engine cut episodes up by coincidental pixel overlaps between the
marks (pieces of 11 + 1 or 10 + 2 pixels), not into states. A few kinds formed, over those pixel pieces, not over states.

**States as one pixel each (row = which state, column = which step).** Nothing was decomposed at all: 12 flat things,
no kinds. Worse, recall mixed states up (A + P, which happened, came back as A → C → P). The learner is built to treat
the same shape anywhere as the same thing. That is right for pictures, but here a state's identity *is* its row, so
two different pairs of states one row apart look identical to it.

**Why this is the real blocker.** Everything above the first level (the abstract region, routes, episodes) wants a
learner whose items have identity (A is A, wherever it sits), with "where" meaning only *when* or *which slot*. The
engine's learner only has shapes. Every pixel encoding tried (bars C36, marks C38, maps C39/C40, here) either loses
identity or invents coincidental parts; tuning the encoding to avoid that would be a crutch.

**What would be principled.** The same rest moves and the same energy (decompose, compose, kinds, priced by placements),
running on items with identity instead of pixel shapes: the cells/completion layer already works this way for recall,
but nothing *learns* there. That's a new piece of engine, not a tweak, so it's the owner's call.

# C43 · A learner for items with identity

C42 found the engine's learner only knows shapes, so it can't learn over states (A is A wherever it sits). Here: the
engine's rules on items with identity, "where" meaning only the step. One change under test: a kind may have more than
one slot. Worlds: HUB (starts × ends through J, A→J→Q and B→J→P held out) at 2×2 … 6×6, and PAIRED (A always on to P,
G always on to O). Hoped: in the hub, energy builds "? → J → ?" by itself, so A + Q recalls A → J → Q (never
happened) and A + J refuses to choose; in PAIRED, no kind (that would invent routes).
Choices made here (declared in items.js): one rest over the whole window; flat things; best move per rest step; combined
moves (precedent: "dissolve kind"); merge kinds (counterpart of "share"). Run: `node run.js` (WIN=300), `node compare.js`.

# C56 · The whole loop on one integrated engine copy

Everything so far, in real engine code (engine/, a copy; the core is untouched), each addition checked with every
engine test giving identical output:
- C48 items with identity · C52 assemblies with several slots · C53 the abstract region (its items are its parts;
  naming cost over places × things)
- C56 `look` (reading with context from above and the moving bar), `think` (joining by the moving bar: pushing),
  `expect` (context sent down), `experiences.js` (the store of experiences, own rule, checks plans)
- C56 ranking candidates by saving net of price (needed so context can matter; with one price for all, the same order)
run.js only wires the regions together. Tests: bench to oak with obscured views; reading along walks with and without
context; a misread surprise caught by the next view not fitting (a misfit), then looked at again without context.
Run: `node run.js` (4 s), `LEARN_FB=1 node run.js` (context also while learning).

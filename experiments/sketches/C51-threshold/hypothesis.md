# C51 · Heat lowers the bar

Owner: many assemblies can be active at once (sparse, spread over cells). The bar for waking an assembly is how many
of its states are already active, normally 2 (two clues in one memory). An open gap is heat; heat lowers the bar, so
more assemblies wake and more connections can happen; when the gap closes, the bar goes back up. Start and end are held
active throughout. Compared with C44's pushing on the same parks, plus a version where the bar is not raised again.
Run: `node run.js` (instant).

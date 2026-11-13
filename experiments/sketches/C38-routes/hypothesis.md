# C38 · Routes as assemblies over time

Idea (owner): just as shapes are built into assemblies of assemblies, walks can be. A stored walk from the bench to the
pond is one assembly holding every step, so the two ends as cues recall the whole walk (completion: two items in one
assembly). A route never walked (bench to oak) might come from both ends rising to a higher assembly they share, then
falling back down to the path. No search, no route-finding heuristic: the engine's own energy or nothing.

**How time gets in, unchanged engine.** A walk is shown as a strip: the views passed, side by side in order. Time is a
direction on the page, so walks are built from steps by the same rule as shapes. Slot width 4 (3 × 3 view + gap): a
declared choice.

**Park.** 12 places on a 4 × 3 layout, 14 paths (some neighbours unlinked). Each place has its own view. Walks of 3–6
places wander without turning straight back (unless at a dead end). No walk ever contains both the bench and the oak.

**Tests.** (1) Walked: show the two end views, hide the middle, read: is the walked middle filled in? (2) Never walked
together, gap given as the shortest route: is the filled middle a real route? (3) The same with the gap chosen as the
cheapest reading over all gaps (a small loop over the cue's layout, declared).

Run: `WALKS=40 node routes.js`.

# C146 · Several at once

The instances problem that blocked rule B: several hypotheses each routing different cells into the same fact slots
blur together. Here the facts are copied into lanes (the owner's picture of the deep expanding into several copies at
the surface), digits are routed into each lane by the engine's gates, and each lane judges its hypothesis by rivals from
place. With company counted from the facts only, 2, 4 or 8 hypotheses at once are all judged exactly right (100%). With
one shared set of slots, or with C145's rule counting the routing gates as company, nothing that fits is ever kept: the
lanes compete as one. Rivalry should come from what things are, not from how they arrive.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C145's copy, plus company from states only as a switch, and a speed cache) · `lanes.js` (the lanes, the
  routing, the trials). Run: `node lanes.js > out.txt` (about seven minutes).

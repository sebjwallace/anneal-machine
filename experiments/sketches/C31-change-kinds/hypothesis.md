# C31 · Kinds in the transition memory: hypothesis

The transition memory (`src/engine/change.js`) works on primitive cells. A change learnt with one version of a kind (table + cap) should then fail to apply to another version (table + dots).

Change: hold a kind's version as its shared part's cells plus one **slot cell**, valued by which piece fills it. A slot cell lines up with the same kind's slot cell whatever its value, provided the piece is carried unaltered. When the change is applied, the slot keeps its piece. Prediction: on the moving world, shared changes will cover never-seen versions, which they couldn't before.

Test: `run.js` (EP = episodes, HIST=1 to include where things were a moment ago).

# C49 · General memory on its own

Owner: if specific experiences have their own store, general memory needn't hold specific walks, and there's no
trade-off between keeping a walk and keeping a general shape. Test: general memory may hold only general shapes
(at least one free place); everything else as C43. Does the one broad shape "any start → J → any end" now win, or does
it still split into narrow shapes (so the pricing question is about general memory itself)? And in the paired world?
Run: `node run.js` (6 s).

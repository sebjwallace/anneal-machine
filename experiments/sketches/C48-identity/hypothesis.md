# C48 · Step 1: the real engine learns items as well as shapes

C42: the engine knows a thing only by its shape, so items whose identity is their position got mixed up. C43 showed a
separate learner on items works, but that was experiment code. Here: the real engine (see.js copied here) with one
change. A point may carry what is there, a value. A plain lit pixel is value 1, so pictures are untouched. Two points
match only when they hold the same value. Nothing else changes: same moves, same prices, same rest.
Pass if (1) every engine test gives identical output, and (2) on C42's walk worlds the engine learns walks as states
with no mix-ups. Run: `node run.js` (tests: copy src/ elsewhere with this see.js and run src/test/*.js).

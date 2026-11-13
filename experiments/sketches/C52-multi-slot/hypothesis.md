# C52 · Step 2: kinds with more than one slot, in the real engine copy

Built on C48's engine copy (items with identity). A kind's slot becomes a list of slots; with one slot everything must
behave exactly as before. "make" forms a kind from two composites differing in k placements (k = 1 as before; for k ≥ 2
each differing placement is paired with the one in the same place, a declared choice); widen, share, undo and the
pricing (each slot one placement, each filler named once, each use names every slot's choice) generalise the same way.
Pass: every engine test identical; then do two-slot kinds form on walks? Run: `ENGINE=see.js|see-one-point.js N=… node run.js`.

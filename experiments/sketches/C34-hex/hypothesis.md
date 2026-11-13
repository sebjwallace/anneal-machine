# C34 · Hex grids: hypothesis

The engine's rule never mentions neighbours or distance. It only moves things by whole steps and compares them. Writing hexagons in axial coordinates (q, r) makes moving a shape "add to both numbers", just as on squares. So:

1. The unchanged engine should learn a hex world as well as a square one.
2. Hex should only differ where neighbours, distance or turning matter. Turning by 60° maps the hex grid onto itself, and the engine has no notion of turning, so each turn of a shape should be learnt as a separate part.

World: `hexworld.js`, 12×12 hexagons. Six shapes: bar, tri, ring, flower, hook and pair. Two objects: hut (tri above bar) and eye (ring above pair). Each picture holds 1–3 things, never touching. Run: `run.js` (N=600, rest every 98; `TURNS=1` shows each thing at any of its six turns).

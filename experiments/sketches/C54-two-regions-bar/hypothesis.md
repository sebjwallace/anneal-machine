# C54 · Two regions, both with a moving bar

A park whose places are seen as landmark pictures. The visual region (the engine, pixels) learns the landmarks; the
abstract region (C53's engine copy) learns walks over what the visual region recognised. Question: bench to oak (never
walked together), asked with a view of each, partly obscured. Each region has the moving bar (C51): the bar drops
while a gap is open and goes back up after. In the visual region, "gap" means lit pixels left unexplained, and the bar
drops from "saves more than its price" to "saves anything at all" (a declared choice). In the abstract region it drops
from 2 active states to 1. All four combinations of fixed and moving bars, at 0, 1 and 2 of 5 pixels missing.
Run: `DROP=0|1|2 node run.js` (3 s).

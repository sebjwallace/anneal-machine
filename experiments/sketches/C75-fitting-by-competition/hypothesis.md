# C75 · Fitting by competition alone: hypothesis

Fitting (`explain` in `src/engine/see.js`) was thought of as a central search. Read closely, it is two things. Its inner
step, `greedy`, already is competition: the candidate that saves most takes its cells, every rival recounts on what is
left, and a placement is taken only while it saves more than its price. The search is on top: competition is rerun once
for every possible opening placement, and the cheapest result kept. That multiplies the work by the number of openings,
and it is the part that grows with memory and breaks CTR-1 CON-18.

**Hypothesis:** competition alone, with no search over openings, fits as well, keeps the same assemblies, and does far
less work. A variant refuses a dead heat between rivals for the same cells instead of breaking it by order (CTR-1
CON-7). Predictions in [PREREG.txt](PREREG.txt).

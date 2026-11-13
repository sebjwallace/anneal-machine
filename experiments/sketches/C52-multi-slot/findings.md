# C52 · Findings

**Every engine test gives identical output** with kinds generalised to any number of slots (see.js here).

**But on walks no kinds form at all** (out-see.txt): each walk is kept whole, as one part. A kind can only form from
composites, and a walk only becomes a composite if it is split into parts. The engine only splits where two things
share at least two points, and walks of single states share one (the junction), so a state never becomes a part of its
own.

**Allowing one-point overlaps** (see-one-point.js) is not harmless: the kinds engine test then learns fewer things
(11 instead of 14) and predicts the next picture worse (90 % exact instead of 100 %). And on walks it still keeps each
walk whole (out-one-point.txt): splitting off a single state never lowers energy.

**Why C43 worked and this doesn't.** C43's learner was given the states as ready-made parts. The real engine has to
discover them from points, and by its own energy a three-state walk is cheapest kept whole.

**The principled reading.** In the region picture (C36), a higher region's input is things the region below has
already settled. Those should arrive as known parts, not as points to rediscover. Next experiment: the higher region
starts with each incoming item as a known part. Engine unchanged.

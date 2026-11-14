# C73 · Anneal's segment rule on sketch 38's worlds: hypothesis

Sketch 38 (here [C71](../C71-membership-segments/)) found that whole-set membership segments, firing on 75% of their
synapses, keep shared cells from blending but can't complete from half a cue, while summed links complete but blend:
"segments are sharp; summed links are tolerant". Lowering the fraction to 60% brought completion back (61-64%) but
blended a split cue (53-62%).

Anneal's segments ([C35](../C35-segments/)) use a different rule. A segment fires at two active links, a bar that comes
from the prices (two items are the first that save on the bill), not a chosen fraction. Then the firing segments
compete: the one with more support wins, and a dead heat gives nothing (CTR-1 CON-7, don't guess). C35 recalled from
a few cells without blending, but only up to a couple of hundred small things.

**Hypothesis:** a low bar plus competition gives both: tolerant enough to complete from part, sharp enough not to blend,
because the competition, not the bar, does the separating. Tested on C71's worlds and probes unchanged, at the cell
level: in each column the cell with the most support wins, and a tie refuses the column. Predictions are in
[PREREG.txt](PREREG.txt).

# C93 · Brought back competes: hypothesis

A rough sketch, not preregistered. Follows [C92](../C92-warm-layer/findings.md), where the warm layer worked but "CD"
came back with "EF": after "AB" then "E", the whole of "ABCD" returned as well as "ABEF". C92 traced that to the core,
not the warmth: shown "EF" fully seen, the core already brings back "ABCD".

**Why the core leaks.** RM-5 (place 3) lets alternatives built on the same whole compete only over what is **seen**:
"what was only brought back is not evidence (PRN-5)". When "EF" is seen, "ABEF" brings back "AB"; but "AB" is only
brought back, so it is not evidence, so "ABCD" and "ABEF" never compete over it, and "AB" brings back every whole it
belongs to.

**The change.** Let cells brought back count as evidence in that competition (and only there: which cell wins a lit
column is still decided by what is seen first, as RM-5 place 1 says). "ABEF" then has all four of its cells active,
"ABCD" only two, and "ABCD" is held back.

**Hypothesis.** With that change (and C92's warm layer), "AB" then "E" brings back exactly "ABEF"; "CD" stays quiet;
everything C92 got right stays right; and the core's own tests (`src/test`, 17) still pass.

**What would count against it.** A core test failing: a case where brought-back evidence silences a whole that should
come back.

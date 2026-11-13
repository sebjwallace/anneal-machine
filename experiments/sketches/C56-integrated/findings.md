# C56 · Findings (out.txt, out-learn-fb.txt)

**Every engine test gives identical output** with everything in. The loop runs in about 4 seconds.

**(1) Bench to oak, never walked, from obscured views (30 each).** 0 pixels missing: 30 routes, all true, all trusted by
the store of experiences. 1 missing: 26 (4 views not read right). 2 missing: 6 (24 views not read right). No wrong
routes. Same as C54, now on the copy's own code.

**(2) Reading along walks (200 each): right / wrong (of which the expected thing).**

| situation | no context | with context | context, then a second look on a misfit |
|---|---|---|---|
| expected, 2 of 5 missing | 158 / 42 | **200 / 0** | **200 / 0** |
| surprise, 1 missing | 188 / 12 (1) | 186 / 14 (3) | 188 / 12 (**1**) |
| surprise, 2 missing | 147 / 53 (10) | 143 / 57 (15) | 147 / 53 (**11**) |
| noise | 0 / 6, 194 nothing | same | same |

**The second look removes the bias context brings.** A surprise misread as the expected thing is caught when the next
view doesn't fit it (no memory or experience holds that pair: a misfit, heat), and looked at again without context.
Context keeps its gain on expected views (200 of 200) and loses almost all its cost on surprises.

**What it took to put it in real code.**
- The engine ranked readings by saving alone, so context had no effect until ranking used saving net of price.
  With no context every price is the same, so nothing else changed.
- My first surprise test was wrong (the walk carried on as if nothing happened, so a misread fitted). Fixed: a surprise
  means you are somewhere else, and the next view follows from there.

**Choices made, to be declared before any of this goes in:** the visual bar lowered to "any saving"; time runs along x
in the abstract region; `think` takes the first round where the two sides meet, and stops after 64 rounds or 8 levels
(compute limits); `expect` uses the last two, else the last one; the store of experiences holds 50; slots in a
several-slot assembly are paired by position; the abstract region's "its items are its parts" is a switch; the second
look (re-read without context on a misfit) lives in the wiring, not the engine.

**Context while learning (LEARN_FB):** no change to these results here.

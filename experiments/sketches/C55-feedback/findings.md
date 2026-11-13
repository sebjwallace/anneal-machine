# C55 · Findings (out.txt; 200 views per situation)

| situation | without feedback: right / wrong (of which the expected thing) / nothing | with feedback |
|---|---|---|
| expected, 0 of 5 missing | 200 / 0 / 0 | 200 / 0 / 0 |
| expected, 1 missing | 199 / 1 (0) / 0 | **200** / 0 / 0 |
| expected, 2 missing | 168 / 32 (0) / 0 | **200 / 0** / 0 |
| expected, 3 missing | 0 / 0 / 200 | 0 / 0 / 200 |
| surprise, 0 missing | 200 / 0 / 0 | 200 / 0 / 0 |
| surprise, 1 missing | 192 / 8 (1) / 0 | 189 / 11 (**4**) / 0 |
| surprise, 2 missing | 160 / 40 (8) / 0 | 156 / 44 (**12**) / 0 |
| noise | 0 / 6 (1) / 194 | 0 / 6 (1) / 194 |

**What it opened up:**
- **Context fixes ambiguity.** Half-seen expected views that were misread 32 times in 200 are all read right with
  context. Three pixels that fit two landmarks are settled by which one belongs here.
- **It can't make you see from too little.** With 3 of 5 pixels gone, nothing is read either way: context lowers the
  price of naming, but the evidence still has to pay. And noise gives no more false sightings with context than without.
- **It costs a little on surprises: expectation bias.** When something unexpected is half-seen, context sometimes pulls
  the read towards what was expected (4 of 200 at 1 missing, 12 at 2 missing, against 1 and 8 without). Clear surprises
  are never overridden.
- **The abstract region is fairly sure here** (1.3–1.4 expected things on average), because this park is mostly a line.

**Not tested yet:** feedback while learning (the abstract region learning from better-read walks), a busier world with
real forks, and feedback in the engine's own reading code. Engine unchanged.

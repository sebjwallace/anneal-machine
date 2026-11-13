# C40 · Findings

**Found an engine bug first.** On some seeds rest never finished: a kind could end up inside its own filler when two
kinds already shared one set of versions (the "share" and "widen" moves checked only the kinds directly involved).
Fixed in `see.js`; every engine test gives identical output. See `docs/updates.md` entry 7.

**Results (20 seeds each).**
- 20 days: joined 0 of 20; nothing recalled at all in 19. Under a second a run.
- 40 days: joined 0 of 20; nothing recalled in 13. About 3 seconds a run.
- 80 days: some runs take a minute, one didn't finish in 6 minutes, so not measured.

**Why nothing.** Each end is one pixel, and one pixel can't pay for a placement. The two ends together (2 pixels) can,
but only if one thing the engine holds contains both corners at once, and with this little experience none does. In
C39 each end was a 4-pixel view, enough on its own to bring back a piece, and the joined route came from one big piece
built at rest. Shrinking a place to one pixel took away exactly the evidence that made that possible.

**And it isn't cheap where it matters.** Lines of lit pixels that overlap heavily day to day are the worst case for rest,
so more experience gets slow fast: the cost is the engine's rest on overlapping structure, not the size of the page.

**Result.** The tiny version is cheap only while it's too small to work. Not a test of the idea yet; worth redoing with
2-pixel places (enough evidence per end) once rest is faster.

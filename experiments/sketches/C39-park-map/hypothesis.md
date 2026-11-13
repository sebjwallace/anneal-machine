# C39 · The level above walks (a park map)

Follows C38: walks held whole come back from their two ends, but a route never walked can't, because nothing above
walks held them together and halves pinned by each end weren't drawn to join.

**Set-up.** The level above walks sees a whole Sunday (2–3 walks) at once, drawn as a map: each step drawn in the
direction it went (self-motion), so a place lands in the same spot whichever walk passes it and walks sharing a junction
line up there. (Drawn where the places really are, which is the same up to a shift as starting anywhere; the engine
learns the same at any shift.) Same park as C38. No walk ever holds both the bench and the oak, and no Sunday's picture
ever joins them. Engine unchanged.

**Hoped for.** Shown only the bench and the oak where they are, with everything else hidden, the engine fills in real
places and walked paths joining them, by the engine's own reading (completion), no route search.

Run: `SUNDAYS=80 SEED=0 node map.js` (slow: 3–9 minutes).

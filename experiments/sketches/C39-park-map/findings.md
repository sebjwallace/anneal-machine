# C39 · Findings

**Bench to oak (never in one walk, never joined on any one Sunday).**

| Seed | Sundays | Joined? | Route filled | The one thing used |
|---|---|---|---|---|
| 0 | 30 | no | – | – |
| 0 | 80 | yes | bench → gate → fountain → bridge → junction B → oak | not inside any one Sunday |
| 1 | 60 | no | – | – |
| 1 | 90 | yes | bench → rose bed → hill → meadow → stream → oak | not inside any one Sunday |
| 2 | 60 | no | – | – |
| 2 | 90 | no | – | a remembered Sunday holding both, unjoined |

Both joined routes are real and as short as possible (5 steps). Each time the whole answer came from **one** thing the
engine had built at rest out of pieces of different Sundays: a stretch of map no single day ever showed. That is the
"meet at the top": walks that share junctions line up on the map, and rest puts them together into something bigger.
Recall then brings it back from the two ends by the ordinary completion rule. No search anywhere.

**What doesn't work yet.**
- *Not reliable (2 of 3 at 80–90 Sundays, none below).* It needs enough experience for rest to build a big enough piece.
- *A remembered day holding both ends, unjoined, is just as good to the engine.* Shown two ends, one placement that
  holds both costs the same whether or not they're connected. Energy has no preference for "joined". When that kind of
  thing exists, it is used (seed 2).
- *It fills a region, not just the path:* 8–10 paths for a 5-step route. Coming back down to only the path didn't happen.

**Cost.** Slow: 80–90 Sundays take 3–9 minutes (rest on large pictures).

**Result.** The level above walks, drawn as a map by self-motion, lets the unchanged engine put together a route never
walked or seen joined, by its own rest and completion. It works sometimes, and the reasons it fails are clear.

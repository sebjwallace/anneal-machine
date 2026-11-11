# C03 Fewest parts (exploration, written before running)

## The goal (the owner's)
**The fewest columns that leave every pattern cool.** Structure is energy and heat is energy: describe the whole with as few parts as possible, so that any input that comes in is low heat.

## How we score it
- **Structure:** number of columns (and pixels stored).
- **Heat of a pattern:** pixels left over plus pixels wrong (a claimed column's pixel that is off), as a share of the pattern's ink. Read on the clean pattern and under 5% noise, and on the 6 held-out bar triples (first sight).
- **The frontier:** columns against heat. Better = fewer columns at the same heat, or less heat at the same columns.
- **Yardstick:** an offline greedy search that sees the whole catalogue at once (not allowed for the machine: it's batch) finds a small set of parts that rebuilds every pattern exactly. It tells us roughly how low "fewest" can go.

## Arms (all online and local)
- **R (reference):** C02's arm C. Parts cut once from a leftover, then only shrink.
- **G (grow towards):** a winning column's pixels track how often each pixel is on when it wins (a running average), so a part grows over what reliably comes with it and sheds what doesn't. It doesn't grow into pixels another winner explained.
- **GP (pay its way):** G, plus at rest a column must save at least as much heat across the replayed flashes as it stores in pixels, or it goes.
- **GEP (economy):** GP, plus using a part costs heat (one pixel's worth), so a flash explained by fewer parts is cooler, and crumbs that newly explain little stop being worth claiming.
- **Caps:** GEP held to at most 10, 15, 20 or 30 columns. When full, a new leftover takes over the least recently used column. This shows what heat each budget buys.
- **No noise:** GEP at 0%.

## Curious about
- How close an online learner gets to the yardstick.
- Whether growing towards (G) fixes the crumbs.
- Where the frontier bends: how few columns before heat rises sharply.
- Whether the parts look like parts (bars, corners) when the budget is tight.

## New settings (rising heat)
G's running-average rate reuses ETA_HOT (0.2). New: PART_COST = 1 (a part used costs as much as one pixel left over) and the cap values (an experimental variable, not part of the design).

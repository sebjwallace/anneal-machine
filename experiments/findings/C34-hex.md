# C34 · Hex grids: findings

| World | Parts | True things found | Bill | Fresh pictures left unexplained | Time |
|---|---|---|---|---|---|
| Hex, upright only | 8 | 7 of 8: all six shapes and the hut, plus one chance group (a ring beside a hook) | 346 | 0% | 5 s |
| Hex, any of six turns | 15 | 8 of 8, each turn as its own part (bar in 3 turns, pair in 3, tri in 2…) | 418 | 1.1% | 12 s |

## What it shows
- **The engine is lattice-free.** It learnt the hex world unchanged, as cleanly as the square one: all shapes found, nothing unexplained. Nothing in the rule depends on squares, so hex costs nothing and gains nothing on its own.
- **Turning is where hex differs, and the engine can't use it yet.** Shown at several turns, each turn of a shape became a separate part. The engine has no move that compares two things *turned* relative to each other, only shifted.
- **Hex is the better grid for turning.** Six turns map it onto itself, against four on squares, and all neighbours are the same distance away.

## Next, if wanted
A rest move that compares two things at every shift **and every turn**: what they share becomes one part, with each use naming its turn (a small cost, like naming a filler). Energy decides, as for every move. On hex that's six turns. On squares it's four, but diagonals sit further away than straight neighbours. Graded positions (nearby cells overlapping) would also be fairer on hex, because every neighbour is equally near.

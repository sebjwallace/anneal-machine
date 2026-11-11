# Findings C26: the crutches taken out

*Seeing: `models/clean.js` (a copy of C20's `flow.js`). Rules: `models/reach.js`. Runners in `sketches/C26-clean/`: `run.js` (seeing, against C20), `shapes.js` (learns and saves the moving-things shapes), `rules.js` (rules and imagination). C20–C25 are kept as they were, as records.*

## What was removed, and what replaced it
| Crutch (where) | Now |
|---|---|
| Memory scraps: odd leftovers kept as parts (C20) | A memory may hold **loose pixels**. A part used by only one memory goes back to being loose (measured by energy). Loose remainders are compared at rest like parts, so something seen twice still becomes a part. |
| Pulling apart only at the biggest overlap (C20) | **Every shift** is priced, and the one that lowers energy most is proposed. |
| "Try the 12 strongest first choices" when explaining (C21) | **Every** first choice is tried. |
| Rest search budget: best 4 of each kind, 8 tries (C20) | **Every** candidate move is tried, best estimate first, until one lowers energy. |
| Wall distance given as context (C25) | **Walls drawn as bricks** in the pictures. A wall is just more things nearby. |
| Rules had to include the object's previous place (C25) | Gone. |
| Following objects by "nearest within 3 cells" (C25) | The pairing that **describes the change most cheaply**: a move is kept only if naming the new offset costs less than a new placement. |
| Looking 5 cells for objects, 2 for walls (C25) | **No reach is set.** For each change: look at the object alone first; if what was seen like that always led to the same change, that's the answer; otherwise look one step further out. It used up to 6 cells, only where needed. |
| My rule-picking ("never wrong, most detail, else least wrong") (C25) | The same single principle: the smallest surroundings that always led to one change. If nothing seen matches further out, the last match stands, with its most common change. |
| One new move | **Look again:** re-describe old memories with what is known now (exact descriptions only), if that's no dearer. |

## Seeing layer, original world (12×12, 600 scenes)
| | C20 | C26 |
|---|---|---|
| units | 30 | **16–18** (3 seeds) |
| units never used on new scenes | 12 | **2–6** |
| description cost, 300 new scenes | 1,407 | **1,240–1,273** |
| heat on new scenes | 0.007 | **0.001–0.003** |
| layers | 4 | 3 |
| all 8 shapes and 3 objects as single units | yes | yes |
| rest time | 5 s | 10–15 s |

## What walls taught us
- **A border identical in every picture** is learnt as one big shape. That is logical: if walls never move, position is the cause.
- **Clutter (many small things per picture) breeds coincidences.** Two random scatters often line up a few bricks, and storing that shared bit once really is cheaper for those memories, so energy keeps it. The 80 coincidence parts then raised the price of every placement, a 2-pixel brick barely paid, and rooms were explained badly (heat 0.17). Re-describing memories didn't remove them, because they genuinely compress those memories.
- **Learning shapes the way C20 did** (1–3 separate things per picture) gives exactly **3 units: brick, diamond, and square as two bricks stacked**, in under a second. Rooms of bricks are then explained perfectly (heat 0).
- **Open question:** should every memory be kept exactly, forever? With clutter, keeping everything makes coincidences "true". Forgetting is a real design question, not a bug.

## Rules and imagination with no crutches (24×24, rooms of random size and place)
| | 375 demonstrations | 1,500 demonstrations | C25 (with crutches) |
|---|---|---|---|
| next step, two objects | 88% | 92% | 97% |
| next step, five objects (full-size room) | 61% | 70% | 85% |
| moving on | 100% | 100% | 100% |
| turning round (wall or bump), five objects | 53% | 70% | 78% |
| changing shape, five objects | 23% | 42% | 67% |
| imagining five: right at step 10 | 31% | 43% | 72% |
| imagining five: first difference (median) | step 2 | step 2 | step 8 |

- It's honest now, and it improves steadily with more demonstrations, but it is weaker than the crutch version.
- **The limit:** a situation is only recognised if exactly those surroundings were seen, out to that distance: every brick and object at its exact offset. Brick patterns differ from room to room, so walls multiply the cases. The crutch version hid this (wall context and a fixed small reach threw the brick detail away).

## Next
- **Recognise situations that are similar, not only identical.** Graded positions, or comparing situations the way parts are compared (keep what two situations share, at a shift), so one bounce off a wall generalises to other brick patterns. This is now the main limit.
- **Forgetting:** what memories are for, and when they can go.
- **Still to clean:** the "most common change" fallback; how completion settles (C22, not used here); samples per child (C21, not used here). The demonstrations themselves (meetings, then roaming) are a curriculum I designed.

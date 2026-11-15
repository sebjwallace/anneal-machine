# C91 · Closing the loop: findings

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after development seed 1 (`dev.txt`). Output: `out.txt`.
The rule: [model.md](model.md). Serves: CTR-1 CAP-11 (two kinds of memory), CAP-10 (a held context steers), CAP-15,
CON-14; CTR-2 CON-2, CON-7. Theory: [flow and heat](../../../docs/theories/flow-and-heat.md), section 7.

## Results (every seed gave the same fate)

| link | after | warm (the rule) | any meeting | the deep learns all |
|---|---|---|---|---|
| "cat mammal" (true) | walking | **sank** | sank | learnt |
| | swimming | stayed up | sank | learnt |
| "cow mammal" (true) | walking | **sank** | sank | learnt |
| | flying | stayed up | sank | learnt |
| "fish mammal" (false) | swimming | **sank** | sank | learnt |
| | flying | stayed up | sank | learnt |
| "cat flies" (false) | walking, flying | evaporated | evaporated | learnt |
| "bird walks" (true) | walking, flying | evaporated | evaporated | learnt |

Taken into the deep, over all episodes: true links 10 of 30 (warm), 20 of 30 (any meeting), 30 of 30 (learns all); false
links 5 of 20, 10 of 20, 20 of 20.

## Predictions

| | prediction | result |
|---|---|---|
| P1 | warm: cat and cow mammal sink after walking, not after their other context, ≥ 4 of 5 | **Holds:** 5 of 5 each way. |
| P2 | warm: fish mammal sinks after swimming, not after flying, ≥ 4 of 5 | **Holds:** 5 of 5. |
| P3 | cat flies and bird walks never sink (warm, any meeting); always learnt with no gate | **Holds.** |
| P4 | any meeting: every connected link sinks everywhere, ≥ 4 of 5 | **Holds:** 5 of 5. |
| P5 | false links in: warm < any meeting < learns all | **Holds:** 5, 10, 20. |

## What it means

- **The whole cycle runs as one machine.** Talk turns the surface, the poles that turn warm the deep, a new piece
  settles at the surface and drops, and it bonds where it meets warm ground: "cat mammal" and "cow mammal" sink after
  talk of walking. Where the ground is cold, a piece that fits doesn't sink, and doesn't vanish either: it stays up,
  waiting for its place to be warmed. A piece that fits nowhere ("cat flies") evaporates.
- **It takes in less that is false.** A deep that learns everything took in every false link. Sinking whatever meets
  took in half. Sinking only on warm ground took in a quarter. And no link that fits nowhere ever got in.
- **But context decides what is believed, for better and worse.** "Fish mammal" fits only by a long route, through
  whales. After talk of swimming, that route was warm, and the machine took the mistake in, every time. That is very
  like people: primed by the right talk, a plausible wrong idea slots in. The rule doesn't yet tell a snug fit from a
  loose one when both land on warm ground. C88 and C90's graded fit (how soon, and on how much, the fronts meet) is
  the obvious next ingredient.
- **What waits at the surface waits for nothing, yet.** "Stayed up" is the right fate for a fitting piece on cold
  ground, but here no later talk comes to warm its place. A longer stream, with the surface holding pieces until their
  ground warms, would show whether they sink later or evaporate.
- **True and new still can't get in.** "Bird walks" is true, but nothing in this little world connects birds to walking,
  so it evaporated every time. Something that can't be explained by what is known needs another way in: repetition,
  or evidence from the world.
- **Every seed agreed,** because the fates follow from the shape of this small, hand-built world, not from chance. The
  result says what the rule does on this world, not how it scales.

## Violations (CTR-2 CON-7)

- **Given by hand (CON-2):** the world, teaching, contexts and episodes; where an episode ends (warmth lasts until
  then, then goes); a blank before every input; the deep gated during contexts and links (restored from outside).
- **The meeting test is the experiment's,** as C87-C90: two fronts settled separately and compared.
- **"Settled at the surface"** is read from the surface's report (one part, nothing uncovered, nothing tied).
- **Engines:** the deep is C89's copy of the core (warmth); the surface C82's (loosening).
- **Measured by our code:** fates, and the direct bonds in the deep.

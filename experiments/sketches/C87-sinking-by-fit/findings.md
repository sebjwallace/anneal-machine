# C87 · Sinking by fit: findings

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after development seed 1 (`dev.txt`). Output: `out.txt`.
The rule: [model.md](model.md). Serves: CTR-1 CAP-11, CAP-1 (learning by comparing), CON-1; CTR-2 CON-2, CON-7.
Theory: [flow and heat](../../../docs/theories/flow-and-heat.md), section 7.

## Results

| new link | sinking tests (sink by fit) | fitted | afterwards "A" brings back "B": sink by fit / learns all / learns none |
|---|---|---|---|
| "cat mammal" (true, connected) | 3 | 3 | 100% / 100% / 100% |
| "dog mammal" (true, connected) | 5 | 5 | 100% / 100% / 100% |
| "cat flies" (false, not connected) | 3 | 0 | 0% / 100% / 0% |
| "fish mammal" (false, connected) | 2 | 2 | 100% / 100% / 100% |
| "bird walks" (true, not connected) | 7 | 0 | 0% / 100% / 0% |

From "cat", "dog" or "fish", the slow volume brought back 7 things in every arm (9 when it learnt everything): the
whole connected piece of its little world. From "bird", 1. What each end reached in common, when a link fitted, was
the whole rest of that piece. Slow segments: 68 (sink by fit), 82 (learns all), 62 (learns none).

## Predictions

| | prediction | result |
|---|---|---|
| P1 | learns none: "cat" and "fish" bring back "mammal" ≥ 80% | **Holds:** 100%. |
| P2 | "cat", "dog", "fish" bring back ≥ 6.5 things in every arm | **Holds:** 7 (9 learning all). |
| P3 | sinking tests agree with connectedness 100% | **Holds:** 10 of 10 fitted connected, 10 of 10 failed unconnected. |
| P4 | "cat" brings back "flies": learns all 100%; the others 0% | **Holds.** |
| P5 | sink by fit: "bird" brings back "walks" 0% | **Holds.** |

## What it means

- **The skeleton works.** The slow volume's own settling carries a signal that separates links that connect its dots
  from links that don't, every time. Gating the slow volume on it keeps "cat flies" out, where a volume that learns
  everything takes it in. And the links that failed evaporated from the fast volume.
- **But the dots are already all joined.** The core's settling spreads until it has covered everything connected. From
  "cat" it brings back walking, dogs, humans, mammals, whales, swimming and fish: seven things, most of them nothing to
  do with the question. So the slow volume already "knows" cats are mammals without being told, and fish too. Sinking
  added only the direct bond. The connecting of dots happens, but everywhere and all at once, so it means nothing.
- **So there is no near or far.** Without a sense of distance, the test can only ask "connected at all?". It can't
  tell a short, sensible route (cats walk like humans, humans are mammals) from a long, absurd one (fish swim like
  whales, whales are mammals). "Fish mammal" passed for that reason.
- **And true but new can't get in.** "Bird walks" is true, but nothing in this little world connects birds to walking,
  so it failed every test (seven) and evaporated. A rule that only admits what already fits can't learn something
  genuinely new. That has to come from somewhere else: repetition, evidence from the world, the heat that keeps it at
  the surface until something settles it.
- **What this points to:** settling needs locality. The owner's philosophy already has it: "heat lowers the bar".
  Normally only what is close wakes, and heat lets activity reach further. In the core the bar is fixed at its lowest
  and the spread is unlimited (its declared gap 3: one global level of support). With a bar, a route found close by is
  a strong fit, one found only far away under great heat a weak one, and one never found a conflict. That is the next
  experiment this asks for.

## Violations (CTR-2 CON-7)

- **Given by hand (CON-2):** the world, the teaching and the stream; a blank before every input.
- **The gate:** the slow volume's learning is undone after every moment, except when a link sinks (from outside, through
  its cells' own grow and prune). How a volume gates its own learning is open (QST-17).
- **The sinking test** is run by the experiment: two settlings of the slow volume, compared, then undone. The claim is
  only that the slow volume's settling carries the signal.
- **"Settled in the fast volume"** is read from the fast moment's report (one part, nothing uncovered, nothing tied).
- **Measured by our code:** what is brought back.

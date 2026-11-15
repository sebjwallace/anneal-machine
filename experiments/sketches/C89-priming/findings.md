# C89 · Priming from the surface: findings

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after development seed 1 (`dev.txt`; three fixes declared
there). Output: `out.txt`. The rule: [model.md](model.md). Serves: CTR-1 CAP-10 (holding: a held context steers what
comes next), CAP-1, CON-18; CTR-2 CON-2, CON-7. Theory: [flow and heat](../../../docs/theories/flow-and-heat.md).

## Results (five seeds)

| context | "cat mammal": step, cells shared, whole things | "fish mammal": step, cells shared | unconnected links |
|---|---|---|---|
| none | 2.0, 3.8, 0.6 | 2.6, 3.2 | never met |
| walking (matches "cat") | 2.0, **8.8**, 0.8 | 2.6, 3.6 | never met |
| swimming (matches "fish") | 2.0, 3.8, 0.6 | **2.0**, 4.0 | never met |
| flying (matches neither) | 2.0, 3.8, 0.6 | 2.6, 3.2 | never met |

Seed by seed, against no context: "fish mammal" after swimming met sooner in 3 of 5 (the same in 2). "Cat mammal" after
walking met at the same step in 5 of 5. Every other context left every step the same, and every connected link still
met.

## Predictions

| | prediction | result |
|---|---|---|
| P1 | a matching context brings the meeting sooner, ≥ 4 of 5, for both links | **Fails:** "fish mammal" 3 of 5; "cat mammal" 0 of 5 (already at step 2, the earliest seen). |
| P2 | a mismatched context is never sooner, and the link still meets, 5 of 5 | **Holds.** |
| P3 | unconnected links never meet, in any context | **Holds.** |
| P4 | the flying context changes neither link's step, 5 of 5 | **Holds.** |

**Not preregistered:** after the walking context, "cat mammal" met on 8.8 cells, against 3.8 with no context or any
other: more than twice as much at once.

## What it means

- **Priming does what the picture says, where it has room.** A context about walking warms the deep around walking
  animals, and the cat's piece lands there. Where the meeting could come sooner, it did ("fish mammal" after swimming,
  in three seeds of five). Where it was already as early as it gets ("cat mammal"), the meeting came bigger instead:
  twice as many cells bonding at once. That is the owner's warm-meeting-warm: more of the deep is ready, so more of the
  piece takes hold. It is also the first time the aha has a size that depends on something, but it was seen after the
  fact, so it needs its own test.
- **Priming is selective.** Contexts about something else (swimming for the cat, walking for the fish, flying for
  either) changed nothing. Warmth only helps where it is.
- **Priming invents nothing.** "Cat flies" and "bird walks" never met, whatever the context, even "bird walks" after a
  context full of walking. Warm ground welcomes a piece that fits, but can't make one fit.
- **Getting warmth right took three fixes, all to match the model.** Left to themselves, warm cells spread on their own
  and woke the whole world. Then the fronts couldn't pass through warm ground. Then the piece's own cells counted as
  warm. Each fix made the code say what the model already said: warmth helps something new wake, flows once the new
  thing reaches it, and is never the new thing itself. Those three rules are what a reference model would carry.
- **Still primitive.** Warmth lasts for the whole context and then goes; nothing fades. The context is given; the deep
  doesn't notice the meeting by itself; and the test is the experiment's.

## Violations (CTR-2 CON-7)

- **Given by hand (CON-2):** the world, teaching and contexts; a blank before every input; the deep gated during the
  context (restored afterwards, from outside); how long warmth lasts.
- **Engine changes:** `Volume.spread` takes warm cells; `Tally` lets a segment fire only if something not warm touches
  it. Both only in this experiment's copy, and the core's moments are unchanged.
- **Three fixes after the development seed,** declared in the PREREG.
- **The test is the experiment's:** two fronts settled separately and compared.
- **Measured by our code:** fronts, meetings and things.

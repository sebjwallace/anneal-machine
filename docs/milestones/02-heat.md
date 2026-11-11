# 02 · Heat: one currency for cost

## In one paragraph
Everything the machine does is judged in one currency: how much it costs to describe what it knows and what it sees. Storing a pixel costs 1. A pixel left unexplained, or drawn where nothing is, costs 1. Placing a part somewhere costs a little more than 1, because you also have to say which part. The machine adds up the cost of everything it keeps (**structure**) and the cost of explaining everything it has seen since its last rest (**flow**). That total is its **energy**. Any change is kept only if the total goes down. Unexplained things are heat; learning is cooling.

## Why it matters
- **It's the single rule behind everything.** Parts, composites, layers, memories and changes all exist only because they lower the total.
- **Nothing is hand-tuned.** The price of a placement comes from the world itself: naming one of the machine's parts, measured against naming one pixel of the picture.
- **Counting the flow, not just the structure, matters.** Without it, the machine kept structure that looked tidy on paper but was never actually used to explain anything.
- **"Build only what pays."** Layers appear only where they lower the total. In tests, depth fell from 6 to 4, and the number of things kept fell sharply.

## How it works
1. **Price of a placement:** 1 + (log₂ of the number of parts) ÷ (log₂ of the number of pixels in the picture). With about 20 parts in a 12×12 picture, that's about 1.6.
2. **Structure:** every stored pixel, plus every placement listed in memories and composites.
3. **Flow:** for each picture seen since the last rest, the cost of explaining it now (placements + pixels left over + pixels wrong).
4. **At rest:** each candidate change is tried, the total measured, and the change kept only if the total falls; otherwise it's undone.

## What it showed (against the version that counted structure only)
- **Parts kept:** 30 instead of 70–93.
- **Layers deep:** 4 instead of 6.
- **Tiny fragments:** 2–4 instead of 13–20.
- **Cost of describing new pictures:** about 20% lower.
- **Recognition:** as good or better.
- After the clean-up (09 · Fettle), the engine keeps **13** parts, with none unused.

## What to show people
- An energy meter split into structure and flow, falling as the machine rests.
- A proposed change being tried, measured, and either kept or rolled back.
- The price of a placement, shown as it rises with the number of parts.

## Limits and open questions
- Measuring every candidate exactly is expensive. At rest, the flow is re-explained with a quicker search (decision 001), and candidates are tried in order of estimated benefit (decision 002).
- What counts as "seen since the last rest" ties into memory and forgetting, which is still open.

## Where it lives
- Code: `src/engine/see.js` (`pc`, `measure`, `restStep`).
- Experiment: C20. Findings: `experiments/findings/C20-flow-energy.md`.

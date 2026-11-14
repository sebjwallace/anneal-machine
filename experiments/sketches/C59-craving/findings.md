# C59 · A craving: heat that becomes structure · findings

Runs: `node run.js` (out.txt), `node sweep.js` (out-sweep.txt). Branch engine (C56) unchanged; `craving.js` holds a copy
of `think` that records whether the bar dropped, with one option tested both ways (`joint`: the two held ends count
together towards the recall rule's two), and `suggest` (no craving: what "gate, then fountain" brings back, by the
completion rules: fewest cells claimed beyond the evidence first, ties refused).

| Question | Result |
|---|---|
| 1. First craving at the gate | Found gate → fountain → café → coffee, never walked as one. The bar dropped (heat). Varied park: 6 rounds, 32 woken (ends on their own); 4 rounds, 21 woken (ends together). |
| 2. Is one satisfied walk kept? | **No.** Awake, it's cheaper to leave it in the flow, explained by stretches already known; after rest, still no memory holding gate and coffee. **It is kept after 4 satisfied walks** (5 in the only-for-coffee park), by the energy rule alone: repetition pays, satisfaction doesn't count. |
| 3. Second time, once kept | **With the ends counting together: the bar doesn't drop** (no heat), 6 woken instead of 21: the walk comes straight back. With each end on its own, the bar still drops (14 woken instead of 32): the gate and the craving are on different sides, so neither side has two. |
| 4. No craving, at the fountain from the gate | Varied park: only "gate → fountain" comes back (the shared stretch claims least). Coffee park, where you also walk past the café: "gate → fountain → café": **the café comes to mind, not the coffee**. Only-for-coffee park: "gate → fountain → café → **coffee**": the craving is suggested by the walk. |

## What it shows
- **Heat turns into structure, but only through repetition.** Once kept, the walk removes the heat: the second craving
  is answered at the normal bar, with a third of the search. That is the owner's picture. But the energy rule keeps the
  walk because it was walked several times (one assembly becomes cheaper than describing each copy in stretches), not
  because it ended a craving. One satisfaction leaves no trace.
- **The bill has no line for heat.** Energy is structure + flow + change. The search a craving costs (the valve
  opening, the memories woken) isn't counted anywhere, so a memory that would save it next time can't earn its keep from
  that. The owner's idea needs it counted: a held thing nothing explains is heat, and structure that explains it is paid
  for by the heat it removes. That is a change to the bill, for the owner to decide.
- **The two held ends must count together.** If each side counts only its own active things, a kept walk never
  answers at the normal bar, because the gate and the craving are on different sides. Counting them together is the
  recall rule taken at its word (two active things inside one memory), and it is what makes the second time free of heat.
- **The craving arising on its own follows "distinctive", as predicted.** Where the route leads many ways, the shared
  stretch comes back and nothing more. Where it mostly leads to the café, the café comes to mind. Only where the route
  is walked only for coffee does the coffee itself come back. No strengths or weights were needed.

## Choices to declare (if any of this goes further)
- `joint` (the ends counting together): new; changes `think` only when a memory holds both ends.
- `suggest` uses completion's order and tie rule over every memory holding "gate, then fountain".
- Coffee is an item: the moment of having it, after the café (time along x). The craving is that item held as the end.
- Worlds: 200 days, rests every 50, seed 59; the flow window (100) decides how many repeats make a walk pay.

## Next, if wanted
- Put heat in the bill: count what a craving costs (memories woken, or the bar dropping) and let structure that removes
  it pay for itself. Then test whether **one** satisfied walk is kept.
- Release: let the held craving let go when explained (the café and coffee inside one memory), and measure the heat.

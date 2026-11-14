# Hypothesis 04: AND as learnt segments

*Hypothesis for sketch 36, November 2026. Not yet tested.*

---

## Why

So far, cells only add up what arrives. That is an OR: any of several inputs can drive a cell. Many things the automaton needs depend on a **combination**:
- what kind of word goes in *this* slot (sketch 20d);
- what one entity does when another does something (the planned interactions sketch).

Until now we have faked combinations with a hashed shortcut: a separate unit for each pair, made by code. That is designed in, not learnt.

Dendrites suggest the mechanism. A thin branch collects synapses from a small set of cells and fires its own local spike when enough of them are active together. That is a **soft AND**, roughly "about 6 of these 8". Several branches on one cell give an OR of ANDs.

## The claim

A cell can grow **segments**. A segment is a small set of presynaptic cells that fires when enough of them are active together. Segments are grown and kept by heat, with no labels:

- **Grow:** when a cell is hot (it should have been driven and wasn't), it grows a segment from a sample of the cells active just then.
- **Keep:** a segment that fires and its cell then fits (cools) strengthens. One that fires and its cell doesn't fit weakens, and eventually disappears.
- **Use:** a firing segment adds strongly to its cell's drive. A cell with several segments responds to any of their patterns (OR of ANDs).

## Predictions

1. **It solves combination-dependent outcomes that plain links can't.** In a world where each input alone predicts the wrong outcome half the time, segments reach high accuracy, while plain links stay near what single inputs allow.
2. **It is economical.** Segments grow mostly early, then stop: one or a few per real combination, not one per experience.
3. **It is soft.** With one input of a combination missing or replaced by noise, a segment still fires most of the time.
4. **It generalises through columns.** A segment grown on "grey cat" + "bowl full" partly fires for "black cat" + "bowl full", because the two share the "cat" columns. It should transfer more than the hashed shortcut, which shares nothing.

## The test (sketch 36)

- **World:** entities and context items whose combination decides the outcome. For example:
  - "grey cat" + "bowl full" → "eating";
  - "grey cat" + "bowl empty" → "meowing";
  - "ginger cat" + "bowl full" → "sleeping";
  - and so on, so that no single input predicts the outcome.

  Some held-out combinations test generalisation. Mix in combinations where a single input *does* decide the outcome, to check segments don't grow where they aren't needed.
- **Compare:** plain links (OR only); the hashed-pair shortcut; learnt segments.
- **Measures:**
  - prediction accuracy over time;
  - segments grown over time;
  - accuracy with one input dropped or replaced;
  - transfer to held-out combinations sharing a kind;
  - cost per event.
- **Settings** are fixed before running, on fresh seeds. Anything changed after looking is marked post hoc.

## What would count against it

- Segments only work with a hand-set segment size or threshold that has to change per world.
- Segments keep growing without settling: one per experience.
- No transfer through shared columns.

## Ways it could fool us

- If segment inputs are sampled only from the "right" cells, the AND is designed in. Sample from everything active.
- A world with too few combinations can be memorised by plain links. Check that single inputs genuinely mislead.

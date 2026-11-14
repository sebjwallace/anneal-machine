# Hypothesis 06: segments as assembly membership

*Hypothesis for sketch 38, November 2026. The idea comes from my own earlier work on dendritic AND operations, revisited after sketch 36 ([findings 04](../C69-learnt-and/findings.md)). Not yet tested.*

---

## The idea

A cell can belong to **many assemblies**. For each assembly it belongs to, it has one **dendritic segment**: a small set of synapses from fellow members of that assembly. The segment is a classifier. It fires when *enough of the other members of this assembly* are active, and then the cell becomes active too.

So:
- **membership is a segment**, one per assembly the cell is in;
- **completion is AND, per assembly**: the cell joins when enough of *one* of its assemblies is present;
- **a cell's assemblies are ORed**: any one complete-enough assembly is enough to activate it.

This is a different reading from sketch 36, where segments were predictors (an outcome cell growing a segment over context words). Here there is no separate outcome. "eating" is simply a member of the assembly {"grey cat", "bowl full", "eating"}, and its segment completes the assembly when enough of the rest is present. **Prediction is pattern completion.** AND is not an extra feature; it is how assemblies work.

## Why it matters

The current substrate completes assemblies by **summing** Hebbian links. Summing can't tell "most of assembly A" from "half of A plus half of B", and that causes several problems we have hit.

- **Blending from shared cells.** With few cells per column, cells end up in more than one assembly, and those produced mixtures about a third of the time (finding 02, in the homeostatic state machine repository). With a segment per assembly, half of A plus half of B satisfies neither segment, so the shared cell stays quiet.
- **Capacity.** If shared cells don't blend, cells can be reused across many assemblies. Capacity then comes from *combinations* of cells, not one cell per thing. That is the argument Numenta makes for distal segments.
- **Ambiguous selection.** "black cat sleeping" against a stored "grey cat sleeping" was ambiguous because everything summed (sketch 25). A threshold per assembly makes "enough of *this* one" a sharp question.
- **It explains sketch 29's fix.** Settling only worked once each cell's input was divided by its total link weight, so that it measured *what share of its own entity is active*. That is a crude version of a segment, with one assembly per cell. Segments do it per assembly.
- **Composition.** A cell in an entity's core can have a segment over that entity's sub-assemblies. Assemblies of assemblies then use the same mechanism all the way up.
- **Simplicity.** One mechanism, segments as membership, might do the work of fit-normalisation, learnt AND and assembly completion. That is a candidate for the distillation.

## Predictions

1. **No blending from sharing.** At small column sizes, where many cells are shared, membership segments produce far fewer mixtures than summed links.
2. **More assemblies in the same cells.** For a fixed number of cells, segments hold many more assemblies before recall degrades. Capacity grows with combinations, not with cells.
3. **Completion still works from a part.** A partial cue (most of one assembly) completes it. A cue spread across two assemblies completes neither, rather than a blend of both.
4. **Kind still transfers.** Columns still carry kind, so generalisation by kind (finding 02) survives.
5. **It is cheap.** With an index from each cell to the segments it feeds, only segments with an active input are checked. Work per event stays small even as assemblies grow.

## The test (sketch 38)

- **Setting:** finding 02's sentence world ("the key is in the tin", objects, containers, rooms, people), with learnt kind codes and columns, reusing sketch 20's code as the base.
- **Compare:**
  1. summed Hebbian links with fit-normalisation (the current substrate);
  2. membership segments: when an assembly forms, each member cell grows one segment sampled from the other members; completion is per segment, threshold fixed in advance.
- **Sweep cells per column**, for example 2, 4, 8, 16, so that sharing goes from heavy to rare. Sweep the number of stored assemblies upward to find each version's capacity.
- **Measures:**
  - blends (mixtures of two assemblies);
  - recall of specific episodes and facts;
  - capacity (assemblies stored before recall falls below a level set in advance);
  - completion from partial cues;
  - behaviour on cues split across two assemblies;
  - kind transfer (new containers get a room, new objects get a container);
  - cost per event (segments checked, cells active).
- **Settings** fixed before running (PREREG), fresh seeds, anything changed after looking marked post hoc.

## What would count against it

- Segments don't reduce blending at small column sizes.
- Capacity doesn't grow beyond what summed links manage with the same cells.
- Kind transfer is lost: segments are too specific to generalise.
- Cost per event rises sharply with the number of assemblies.

## Ways it could fool us

- If a segment's inputs are taken only from the "true" assembly members chosen by code, membership is designed in. Members should be whatever was co-active when the assembly formed.
- Capacity can look higher simply because the threshold is strict and recall is scored leniently. Score recall the same way for both versions.
- Small samples in the sentence world: report differences of a few points as noise.

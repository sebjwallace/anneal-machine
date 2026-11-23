# C129 · Reading by bonds: hypothesis

Distillation [D-03](../../../docs/distillation/D-03-buffer-annealing.md), removing V1 (reading as a calculation over an
index of every piece held), V2 (the index of pieces) and V6 (seen again as a lookup by text). Taken ahead of steps 2
to 5 because it is the deepest, and the owner asked whether it can be done at all.

## The change

The engine copy gets `readByBonds`. The letters of a sentence arrive one a moment, in order, as the engine's input
always has. Each chain (transition) keeps its own evidence, as a memory does (CTR-1 CON-9). Its step i is counted at a
moment only if that step's member has just arrived and its step i − 1 was counted the moment before, in the same
chain. Only the chains that the arriving members belong to are touched, through each member's own bonds (CON-18). No
list of pieces is consulted. A chain counted through its last step has completed. If a state holds exactly the
chain's members, that state is read over those letters, with the chain's text.

Two departures from invoke, both allowed by the owner. Every member of the arriving letter is available: expected
input doesn't turn the others off. And nothing is decided until the sentence has arrived.

Then the completions are chosen between, in one of two ways:

- **settle**: the cheapest description of the whole sentence by the completions. This is the energy rule applied to
  what is read (CTR-1 DEF-5: what it costs to explain what the machine receives). It is still computed as a calculation
  over this sentence's completions, not by gates.
- **compete**: the engine's own competition, once over the whole sentence. Overlapping completions are rivals.
  Support is what a piece saves against spelling its letters. Most support wins, a tie is held, and a rival is beaten
  only by one that won.

Seen again: a hot stretch is held already when one of this reading's own completions covers exactly it.

## Predictions

1. **settle** reads exactly as the index did, since the same pieces fit the same places: energy and every reading
   measure within 2% or 2 points of C128 on both books.
2. **compete** is worse, as local competition was in C112 and C116, but by how much is the question. The guess is a few
   points.

**Survives if** settle meets prediction 1 on both books.

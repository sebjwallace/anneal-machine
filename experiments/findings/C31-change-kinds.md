# C31 · Kinds in the transition memory: findings

## Result (moving world, 30 episodes; next state exactly right)
| | Changes kept | Seen objects | Never-seen objects |
|---|---|---|---|
| Without slot cells (engine as is) | 119 | 100% | 100% |
| With slot cells | 114 | 100% | 100% |

The result is the same with and without history (where things were a moment ago) in the state.

## What it shows
- **The hypothesis was wrong for this world.** The transition memory already generalises across versions. Learning splits the tops into small shared pieces (a short bar, a dot, a two-dot column). Shared changes are learnt as "this base chunk with these bits moves down", and any top built from those bits is then covered, including never-seen combinations. Decomposition into shared pieces does the generalising.
- **Slot cells are correct and harmless:** no test got worse, and they keep slightly fewer changes. But they give no measurable gain here, so they stay out of the engine.

## When they might matter
When versions don't share pieces, so that each top is its own primitive and nothing about it was ever seen moving. That needs a world built for it. Until such a world shows a gain, the engine keeps the simpler mechanism.

## Still open
Decision 007 (nearest pairing in the energy's change term) remains. The energy could price change using the transition memory's own whole-change description instead; that is a separate piece of work.

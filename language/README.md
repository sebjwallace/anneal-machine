# The language

This is the main line of the project. The old core code (`src/`) has been retired: it was falling behind the theory and
had become a distraction (see [decision 010](../docs/decisions/010-language-replaces-core.md)). It remains in git
history and in the experiments that copied it.

The language is a notation for the machine: members, the edges and gates between them, the assemblies they form, and
how heat makes structure form and break. It is meant to be precise enough that an interpreter could one day run it.
For now it is markdown only. Nothing here is code yet.

## Ground rules

- **Binary.** A member is active or not. An edge is there or not. There are no strengths and no weights.
  Reinforcement means more structure, not stronger structure ([structure over strength](../docs/theories/structure-over-strength.md)).
- **Set words only.** Where mathematics is borrowed, it comes from set theory: union, intersection, difference,
  subset, membership, count. Nothing else is borrowed, to keep the language pure and focused.
- **Energy first.** Energy and heat are the project's own ideas, sitting on top of the set words. Heat is energy that
  can't flow.
- **Agreed words only.** No term goes in without the owner agreeing it. Anything provisional is marked as such.
- **Plain.** Each page explains in everyday words before showing notation.

## Pages

| Page | What it covers |
|---|---|
| [Members and sets](members-and-sets.md) | Members, individuals, the active set, populations and communities, marks for recalled and hot, the set words. |
| [Edges and gates](edges-and-gates.md) | Bonds, latches, two-way and blocking edges; gates and their thresholds and rules; declarations. |
| [Assemblies](assemblies.md) | Assemblies, membership, composition, selecting members of a thing, forms and breaks. |
| [Completion and competition](completion-and-competition.md) | Completion, competition and held ties, fitting, comparison, abstraction. |
| [Heat and learning](heat-and-learning.md) | Heat as set differences, what forming and breaking do, and what is not yet pinned down. |
| [Open and deferred](open-and-deferred.md) | Everything parked or unresolved, in one list. |

## Where the ideas come from

- [Learned computation](../docs/theories/learned-computation.md): writing is bonding, reading is completion.
- [Structure over strength](../docs/theories/structure-over-strength.md): reinforcement as more connections.
- [How heat restructures](../docs/theories/how-heat-restructures.md): what heat does to structure, and when.
- [Decision 009](../docs/decisions/009-no-context-in-cells.md): no context carried in cells.

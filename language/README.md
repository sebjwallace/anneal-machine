# The language: AMP

**AMP, Associative Memory Programming,** is the owner's name for this language and the interpreter that will run it.
Its counterpart is **AMX, Associative Memory Examination:** everything used to test, probe, trace, debug and explain
the machine ([explainable by design](../docs/theories/explainable-by-design.md)).

This is the main line of the project. The old core code (`src/`) has been retired: it was falling behind the theory and
had become a distraction (see [decision 010](../docs/decisions/010-language-replaces-core.md)). It remains in git
history and in the experiments that copied it.

The language is a notation for the machine: members, the edges and gates between them, the assemblies they form, and
how heat makes new structure form. Nothing breaks: structure is only ever added, and what stops being relevant is stored rather than erased. It is meant to be precise enough that an interpreter could one day run it.
For now it is markdown only. Nothing here is code yet.

## Ground rules

- **Binary.** A member is active or not. An edge is there or not. There are no strengths and no weights.
  Reinforcement means more structure, not stronger structure ([structure over strength](../docs/theories/structure-over-strength.md)).
- **Set words only.** Where mathematics is borrowed, it comes from set theory: union, intersection, difference,
  subset, membership, count. Nothing else is borrowed, to keep the language pure and focused.
- **Energy first.** Energy and heat are the project's own ideas, sitting on top of the set words. Heat is energy that
  can't flow.
- **Agreed words only.** No term goes in without the owner agreeing it. Anything provisional is marked as such.
- **Nothing breaks.** Bonds are never removed during learning. Structure is added, like a ledger, and what loses is stored ([nothing breaks](../docs/theories/nothing-breaks.md)).
- **Assemblies first.** Assemblies are the main things; members are pivot points. Bonds and assemblies are immutable: learning only forms new assemblies ([assemblies first](../docs/theories/assemblies-first.md)).
- **Heat words are for heat.** Warm and cold describe heat and energy only. Where an assembly lives is described with
  mechanical words: loaded and stored.
- **Explainable.** Everything the machine does must have a cause that can be stated in AMP itself (CTR-1 CON-20, draft).
- **Plain.** Each page explains in everyday words before showing notation.

## Pages

| Page | What it covers |
|---|---|
| [Members and sets](members-and-sets.md) | Members, individuals, the active set, populations and communities, marks for recalled and hot, the set words. |
| [Edges and gates](edges-and-gates.md) | Bonds, latches, two-way and blocking edges; gates and their thresholds and rules; declarations. |
| [Assemblies](assemblies.md) | Assemblies, membership, composition, selecting members of a thing, forming. |
| [Completion and competition](completion-and-competition.md) | Completion, competition and held ties, fitting, comparison, abstraction. |
| [Heat and learning](heat-and-learning.md) | Heat as set differences, forming, and loaded and stored: where an assembly lives, and what moves it. |
| [Open and deferred](open-and-deferred.md) | Everything parked or unresolved, in one list. |

## Where the ideas come from

- [Learned computation](../docs/theories/learned-computation.md): writing is bonding, reading is completion.
- [Structure over strength](../docs/theories/structure-over-strength.md): reinforcement as more connections.
- [How heat restructures](../docs/theories/how-heat-restructures.md): what heat does to structure (its breaking sections are superseded).
- [Nothing breaks](../docs/theories/nothing-breaks.md): bonds are never removed; forming, and moving between memory and disk.
- [Assemblies first](../docs/theories/assemblies-first.md): assemblies as first-class citizens; bonds stored with the receiving gate.
- [Decision 009](../docs/decisions/009-no-context-in-cells.md): no context carried in cells.

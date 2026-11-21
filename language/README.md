# The language: AMP

**AMP, Associative Memory Programming,** is the owner's name for this language and the interpreter that will run it.
Its counterpart is **AMX, Associative Memory Examination:** everything used to test, probe, trace, debug and explain
the engine ([explainable by design](../docs/theories/explainable-by-design.md)).

This is the main line of the project. The old core code (`src/`) has been retired: it was falling behind the theory and
had become a distraction (see [decision 010](../docs/decisions/010-language-replaces-core.md)). It remains in git
history and in the experiments that copied it.

The language is a notation for the engine: members, the edges and gates between them, the assemblies they form, and
how heat makes new structure form. Nothing breaks: structure is only ever added, and what stops being relevant is stored rather than erased. It is meant to be precise enough that an interpreter could one day run it.
For now it is markdown only. Nothing here is code yet.

## Terms

- **The engine** performs the operations and manages the data: it is what runs AMP.
- **The memory** is everything the engine holds: all its knowledge, and, because it learns online, its current state
  too. Unlike a deep-learning model, where the trained weights are separate from the state of a session, the memory
  holds both, as a person holds what they know and what they are thinking about now. The name follows the project's own
  name, associative memory.
- **RAM and disk** are where parts of the memory physically sit. An assembly in RAM is **loaded**; one on disk is
  **stored**. "Memory" never means RAM: say loaded or stored.
- **Retired**: "machine" and "automaton" are no longer used. Older theory notes keep them as the record.

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
- **Explainable.** Everything the engine does must have a cause that can be stated in AMP itself (CTR-1 CON-20, draft).
- **Two operations.** invoke (reading) and anneal (learning). Completion, competition and fitting are effects of
  invoke; composition, abstraction and decomposition are shapes anneal takes ([operations](operations.md)).
- **The world speaks in populations.** What comes in and goes out is a population; which member takes part is the
  engine's business, private unless inspected.
- **Plain.** Each page explains in everyday words before showing notation.

## Pages

| Page | What it covers |
|---|---|
| [Walkthrough](walkthrough.md) | **Start here.** The language step by step, as typed into the interpreter and printed back: populations, invoking, annealing, assemblies and transitions, alternatives and keys, member definitions, naming, reading text, instructions. |
| [The two operations](operations.md) | invoke and anneal: what each does, what each gives, and how they are composed by a declared policy. |
| [Instructions](instructions.md) | The instruction set beneath the notation (INV, ANNL, CAP, ASML, CHN …), the REPL, and the three logs. |
| [Members and sets](members-and-sets.md) | Members, individuals, the active set, populations and communities, marks for recalled and hot, the set words. |
| [Edges and gates](edges-and-gates.md) | Bonds, all directed: inward (completion, holding) and outward (transition, order); gates and thresholds; AND as a gate, OR as topology; declarations. |
| [Assemblies](assemblies.md) | Assemblies, membership, composition, selecting members of a thing, forming. |
| [invoke](invoke.md) | Effects of invoke: completion and holding, competition within and across populations, fitting, comparison. |
| [anneal](anneal.md) | Shapes of anneal: plain forming, composition, abstraction, decomposition, sequence. |
| [Heat and learning](heat-and-learning.md) | Heat as set differences (what invoke leaves), and loaded and stored: where an assembly lives, and what moves it. |
| [Open and deferred](open-and-deferred.md) | Everything parked or unresolved, in one list. |

## Where the ideas come from

- [Learned computation](../docs/theories/learned-computation.md): writing is bonding, reading is completion.
- [Structure over strength](../docs/theories/structure-over-strength.md): reinforcement as more connections.
- [How heat restructures](../docs/theories/how-heat-restructures.md): what heat does to structure (its breaking sections are superseded).
- [Nothing breaks](../docs/theories/nothing-breaks.md): bonds are never removed; forming, and moving between RAM and disk.
- [Assemblies first](../docs/theories/assemblies-first.md): assemblies as first-class citizens; bonds stored with the receiving gate.
- [Decision 009](../docs/decisions/009-no-context-in-cells.md): no context carried in cells.

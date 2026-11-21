# resolve: the shapes of forming

[resolve](operations.md) turns an incompletion into new structure. **It always does the full mechanism**, every time
invoke can't complete: it compares the incompletion with everything it touches, then forms whichever shapes that calls
for, together. It is never a cheap stand-in such as bonding one character to the next. The aim is correctness and
completeness: to explain the incompletion as fully as possible in that moment. It only ever **forms**: nothing breaks, and an
existing assembly is never edited ([nothing breaks](../docs/theories/nothing-breaks.md),
[assemblies first](../docs/theories/assemblies-first.md)). Composition, abstraction and decomposition are not separate
operations. They are the shapes forming takes, depending on what kind of incompletion invoke left.

| What invoke left | What resolve forms | Shape |
|---|---|---|
| Something active that nothing accounts for | A new assembly over it and the context it came in. If it is made of known things, a new whole of known parts. | plain forming, or **composition** |
| Two known things that keep turning up together but aren't linked | A bridge: the union of the two, plus the bonds that tie it together | **composition** |
| Two things that compete because they overlap ("cat" and "cot") | The shared part, their intersection ("c", "t"), as an assembly of its own | **abstraction** |
| What differs between them ("a", "o") | The parts that vary, as their own assemblies beside the whole, with nothing cut out of it: the slot and its values | **decomposition** |
| Something that followed something else, unpredicted | An outward bond from the first to the second | **sequence** |

## Forming

```
forms <9, 12>            a new assembly over 9 and 12, bonded to the held context
forms S = <A ∩ B>        abstraction: what A and B share
forms <A − B>            decomposition: what A has that B doesn't, beside A
A -> B                   sequence: an outward bond, A invokes B
```

After forming, the same input completes: the difference that was heat comes out empty. Nothing old changes. The new
assembly attaches beside what was there, which is also how reinforcement works: the old assembly gains one more way in
([structure over strength](../docs/theories/structure-over-strength.md)).

**Composition is more than a union.** A plain union forgets which parts belonged together and how they are joined. A
composed assembly is the union plus the bonds that make it complete as one whole.

**Abstraction replaces the old cut.** The shared part used to be made by splitting an assembly into a core and leftovers.
Now nothing is split: what is shared is formed beside what is there.

## Across time

Most cross-time learning happens through reading itself: a new input invokes the old structure it touches, and the
misfit between them is the comparison (walkthrough step 8). Deliberate comparison of stored assemblies (`RSLV #1,#3`) is
**limited to assemblies that share members**, through the pivot points, never every assembly against every other.

## Words and symbols

Comparison uses **intersection** (`∩`), **difference** (`−`) and **symmetric difference** (`△`). Abstraction forms
`<#1 ∩ #3>`; the alternatives from `#1 △ #3` go on the chain as `a | o`, and a named set of them is a **type**
(walkthrough step 5). In the instruction set, an assembly is assembled with `ASML` and a transition with `CHN`
([instructions](instructions.md)).

## Economy: reuse first

The best resolution is the **most complete explanation with the least added**. Reusing a known part, or joining an
existing frame as a new alternative, explains more while adding less. So resolve prefers what already exists over forming
anything new. "Build only what pays" is part of resolving correctly, not a rule beside it.

## One rule decides what is kept

Every forming is kept only if energy falls (CTR-1 CON-1). The old engine's rest phase was the same family of moves
(decompose, compose, form kinds), each tried and kept only if the description got cheaper. Resolve is that family,
triggered by incompletion or run over stored assemblies, as the policy says ([operations](operations.md)).

## What resolve does not do

- It does not resolve a **tie**. When two answers are equally supported, more structure won't settle it, so the tie is
  held until more evidence arrives.
- It does not **invent**. It forms from what arrived and what is held, never from nothing. Whether members invoke
  brought back (`+`) may take part in forming is still open, because that is the likeliest route for fiction.

*Provisional:* the exact notation for forming statements.

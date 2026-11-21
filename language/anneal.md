# anneal: the shapes of forming

[anneal](operations.md) turns an incompletion into new structure. **It always does the full mechanism**, every time
invoke can't complete: it compares the incompletion with everything it touches, then forms whichever shapes that calls
for, together. It is never a cheap stand-in such as bonding one character to the next. The aim is correctness and
completeness: to explain the incompletion as fully as possible in that moment. It only ever **forms**: nothing breaks, and an
existing assembly is never edited ([nothing breaks](../docs/theories/nothing-breaks.md),
[assemblies first](../docs/theories/assemblies-first.md)). Composition, abstraction and decomposition are not separate
operations. They are the shapes forming takes, depending on what kind of incompletion invoke left.

| What invoke left | What anneal forms | Shape |
|---|---|---|
| Something active that nothing accounts for | A new assembly over it and the context it came in. If it is made of known things, a new whole of known parts. | plain forming, or **composition** |
| Two known things that keep turning up together but aren't linked | A bridge: the union of the two, plus the bonds that tie it together | **composition** |
| Two things that compete because they overlap ("cat" and "cot") | The shared part, their intersection ("c", "t"), as an assembly of its own | **abstraction** |
| What differs between them ("a", "o") | The parts that vary, as their own assemblies beside the whole, with nothing cut out of it: the slot and its values | **decomposition** |
| Something that followed something else, unpredicted | An outward bond from the first to the second | **sequence** |

## Over stored wholes, in the interpreter

`anneal thedog, thecat, thebird, themouse` (short form `annl`) compares stored wholes and fits them into what the
memory holds, forming only what is new, beside them, unnamed (shown by number, `#9`, until something names them):

- **the shared part** (abstraction): the longest run of letters, next to each other in order, that every whole has.
  Not the set intersection: "thedog" and "thebird" also share "d", and "thedog" and "thefox" share "o", but in other
  places; the run is "the" in each.
- **what varies in each** (decomposition): what comes before and after the shared part.
- **each whole again from its parts** (composition), in order, joined last member to first.
- **Reuse first** (economy): a part the memory already holds is used, not formed again: an assembly with the same
  letters in order (the very same members if there is one, otherwise the earliest formed) for the shared part and what
  varies, and one with exactly the same members for a composed whole. Annealing the same wholes twice forms nothing
  new (`amp/interpreter/testdata/32-anneal-reuse.txt`).
- Found when trying it: once a part is shared, its continuations are shared too. With only "thedog" known, "the" at
  the end of "cathe" runs on into "dog"; what came before "the" doesn't yet decide what follows (held context, open).

Nothing existing changes. Running in `amp/interpreter/testdata/31-anneal.txt`: after `anneal thedog, thecat`, reading
"the cat" completes the new version from its parts and holds; the flat original can't complete.

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
misfit between them is the comparison (walkthrough step 8). Deliberate comparison of stored assemblies (`ANNL #1,#3`) is
**limited to assemblies that share members**, through the pivot points, never every assembly against every other.

## Words and symbols

Comparison uses **intersection** (`∩`), **difference** (`−`) and **symmetric difference** (`△`). Abstraction forms
`<#1 ∩ #3>`; the alternatives from `#1 △ #3` go on the chain as `a | o`, and a named set of them is a **type**
(walkthrough step 5). In the instruction set, an assembly is assembled with `ASML` and a transition with `CHN`
([instructions](instructions.md)).

## Economy: reuse first

The best resolution is the **most complete explanation with the least added**. Reusing a known part, or joining an
existing frame as a new alternative, explains more while adding less. So anneal prefers what already exists over forming
anything new. "Build only what pays" is part of annealing correctly, not a rule beside it.

## One rule decides what is kept

Every forming is kept only if energy falls (CTR-1 CON-1). The old engine's rest phase was the same family of moves
(decompose, compose, form kinds), each tried and kept only if the description got cheaper. Anneal is that family,
triggered by incompletion or run over stored assemblies, as the policy says ([operations](operations.md)).

## What anneal does not do

- It does not settle a **tie**. When two answers are equally supported, more structure won't settle it, so the tie is
  held until more evidence arrives.
- It does not **invent**. It forms from what arrived and what is held, never from nothing. Whether members invoke
  brought back (`+`) may take part in forming is still open, because that is the likeliest route for fiction.

*Provisional:* the exact notation for forming statements.

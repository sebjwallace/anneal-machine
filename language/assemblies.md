# Assemblies

## What an assembly is

An **assembly** is a set of members held together by the bonds between them, so that enough of it being active brings
back the rest. It is the machine's memory of a thing. Assemblies are the dynamic structure: they form, and are loaded or stored, as the
machine learns, unlike populations and communities, which are fixed.

Angle brackets mark an assembly, to tell it apart from a plain set of active members in braces.

```
A = ⟨1, 4, 7⟩      A is an assembly of members 1, 4 and 7
4 ∈ A              4 is a member of A
```

## Assemblies are the main things

Assemblies are the first-class citizens of the machine. An assembly **owns its gates**, so the bonds on those gates'
guest lists belong to it. It is loaded and stored as **one whole**. Members are pivot points: the member "cat"
can be used by many assemblies (among the animals, in an old nursery mistake), and each can be loaded or stored on its own
without the member changing.

**Assemblies are immutable.** Once formed, an assembly's gates never gain or lose a bond. Learning never edits an
existing assembly. It forms a new one beside it, which may connect to the old. This keeps mistakes isolated: a
misreading forms its own assembly, which loses, is stored and takes its bonds with it, leaving the good assembly
untouched ([assemblies first](../docs/theories/assemblies-first.md)).

## Composition

An assembly can be made of parts of other assemblies. That is composition.

```
C = ⟨A{2, 4}, B{6, 7}⟩
```

**A name followed by braces means those members of that thing.** So `A{2, 4}` is members 2 and 4 of A, and C is
composed of those together with members 6 and 7 of B.

Composition is close to a union, but not only a union. A plain union forgets which parts belonged together and how
they are joined. In an assembly the joining is the point: the bonds that tie the parts together are part of what it is.
So composition is the union *plus* the bonds that make it complete as one whole.

## Forming

One verb describes structure changing.

```
forms ⟨1, 4, 7⟩     an assembly forms over 1, 4 and 7
```

Nothing grows, hardens or breaks. Structure forms, and that is all. Forming always makes a new assembly; it never
adds to an existing one. Bonds are never removed during learning: structure is added, like a ledger, and what stops being relevant is stored rather than erased
([nothing breaks](../docs/theories/nothing-breaks.md)). What makes it form is heat (see
[heat and learning](heat-and-learning.md)).

*Provisional:* the exact form of the statement is not yet agreed.

## Loaded and stored

Where an assembly lives changes what it can do, so the language says where it is.

- **Loaded**: in memory. A loaded assembly takes part: its gates are checked against what is active.
- **Stored**: on disk. A stored assembly takes no part in ordinary activity. It is still connected, but nothing in
  memory checks it.

```
A is loaded
B is stored
B loads        moves into memory
A stores       moves out to disk
```

That is one yes-or-no fact per assembly. What moves an assembly either way is set out in
[heat and learning](heat-and-learning.md).

*Provisional:* the exact form of these statements.

**Deletion is a storage policy, not learning.** Structure that has been stored, untouched, for long enough can be archived or
deleted, whole assemblies at a time, for example when the disk space allowed for the machine runs out. That is
housekeeping outside learning. Learning itself never removes anything.

## Backlog

Named assemblies would let an interpreter report which ones completed during a run, for example "A completed at step
3". Noted for when there is an interpreter.

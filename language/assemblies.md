# Assemblies

## What an assembly is

An **assembly** is a set of members held together by the bonds between them, so that enough of it being active brings
back the rest. It is how the memory holds a thing. Assemblies are the dynamic structure: they form, and are loaded or stored, as the
engine learns, unlike populations and communities, which are fixed.

Angle brackets mark an assembly, to tell it apart from a plain set of active members in braces.

```
A = <1, 4, 7>      A is an assembly of members 1, 4 and 7
4 ∈ A              4 is a member of A
```

## Assemblies are the main things

Assemblies are the first-class citizens of the engine. An assembly **owns its gates**, so the bonds on those gates'
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
C = <A{2, 4}, B{6, 7}>
```

**A name followed by braces means those members of that thing.** So `A{2, 4}` is members 2 and 4 of A, and C is
composed of those together with members 6 and 7 of B.

Composition is close to a union, but not only a union. A plain union forgets which parts belonged together and how
they are joined. In an assembly the joining is the point: the bonds that tie the parts together are part of what it is.
So composition is the union *plus* the bonds that make it complete as one whole.

**Decided, and running in the interpreter** (`amp/interpreter/testdata/24-composition.txt`):

- **An assembly's name inside a declaration is a part.** `thedog = <the, dog>` is an assembly over members "the" and
  "dog" already have, formed beside them with nothing rewired; it connects to them through those shared members.
  Parts and populations can be mixed: `<the, dog, s>`.
- **A whole binds a sample of each part, not all of it** (the owner's sparse bonding): the fewest members that still
  complete the part, which under the gate rule is more than half of it (2 of 3, 3 of 5), taken in order. C76 found the
  smallest binding that completes to be the best: as reliable as binding every member, far cleaner, and far less work.
  It follows from the gate rule, so it is a rule, not a setting.
- **A chain joins parts last to first:** `the -> dog` bonds the last member of "the" to the first of "dog", so reading
  carries on from one part into the next; each part's own structure carries what lies inside it.
- A whole of two parts isn't completed by one part alone (2 of 4 is a tie); the chain joining them carries reading
  forwards, and once enough of the whole is counted it completes and holds.

## Decomposition

The counterpart of composition: a part formed from a whole, beside it, with nothing cut out of it. Written with the
braces above, naming the populations whose members to take.

**Decided, and running in the interpreter** (`amp/interpreter/testdata/27-decomposition.txt`):

- `ca = <cat{c, a}>` is a new assembly over cat's own members for "c" and "a" (`c{1}, a{1}`), connected to cat through
  them. Cat is unchanged.
- Braces take **exactly** those members, not a sample: sampling is for binding parts into a whole; decomposition takes
  a precise part.
- **Braces match in order:** each population takes the next member of it after the one before. So
  `thecat{t, h, e}` is its first three letters and `thecat{c, a, t}` its last three, and a repeat is written twice
  (`abab{a, a}` is both "a"s).
- In a chain the members go in the whole's order: `at = cat{a, t}` is `a{1} -> t{1}`.
- **Short form:** `the = <thedog{t -> h -> e}>` is an assembly over those members and a transition through them, as
  `<c -> a -> t>` is for populations. Inside braces, commas and arrows both give the order; use one or the other.
- It mixes with populations, parts and other decompositions: `<cat{c, t}, cot{o}>`.
- Braces take population names, and only on assemblies; a population's members are the engine's business.

## Abstraction by hand: intersection

`the = intersection thedog, thecat, thebird, themouse` (short form `intr`) works out what the names share by
population (t, h, e), then forms it by decomposition from the first-named whole: `<thedog{t -> h -> e}>`, beside all
of them. Members come from the first name, so that word shares its members with the abstraction. Fewer than two shared
populations is refused.

## Decomposition by hand: difference

`dog = difference thedog, the` (short form `diff`) forms what the first has that the others don't, from the first's
own members, beside it: `<thedog{d -> o -> g}>`. The others' letters are taken away in order, not as a set, so
`difference thecat, the` keeps cat's final "t" (`t{3}`) and `difference themouse, the` keeps mouse's final "e".

## Forming

One verb describes structure changing.

```
forms <1, 4, 7>     an assembly forms over 1, 4 and 7
```

Nothing grows, hardens or breaks. Structure forms, and that is all. Forming always makes a new assembly; it never
adds to an existing one. Bonds are never removed during learning: structure is added, like a ledger, and what stops being relevant is stored rather than erased
([nothing breaks](../docs/theories/nothing-breaks.md)). What makes it form is heat (see
[heat and learning](heat-and-learning.md)).

*Provisional:* the exact form of the statement is not yet agreed.

## Loaded and stored

Where an assembly lives changes what it can do, so the language says where it is.

- **Loaded**: in RAM. A loaded assembly takes part: its gates are checked against what is active.
- **Stored**: on disk. A stored assembly takes no part in ordinary activity. It is still connected, but nothing in
  RAM checks it.

```
A is loaded
B is stored
B loads        moves into RAM
A stores       moves out to disk
```

That is one yes-or-no fact per assembly. What moves an assembly either way is set out in
[heat and learning](heat-and-learning.md).

*Provisional:* the exact form of these statements.

**Deletion is a storage policy, not learning.** Structure that has been stored, untouched, for long enough can be archived or
deleted, whole assemblies at a time, for example when the disk space allowed for the engine runs out. That is
housekeeping outside learning. Learning itself never removes anything.

## Backlog

Named assemblies would let an interpreter report which ones completed during a run, for example "A completed at step
3". Noted for when there is an interpreter.

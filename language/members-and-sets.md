# Members and sets

## Members

A **member** is the smallest thing in the engine. It is either active or not. Members are numbered **within their
population**, counting from 1, and always written with it: `c{3}` is member 3 of population `c`, a different member from
`a{3}`.

```
c{1}, c{2}, a{1}
```

Members are private to the engine. The world addresses populations, not members: what comes in and goes out is a
population, and which member takes part is decided inside (see the [walkthrough](walkthrough.md), step 2).

Members are not the main things: assemblies are. A member is a **pivot point**, a name that many assemblies can use
and meet through. It keeps no list of its own bonds ([assemblies first](../docs/theories/assemblies-first.md)).

A member that belongs to no assembly is an **individual**. Every member starts as an individual. Members stop being
individuals when an assembly forms around them.

## Phases

Every member is in one of three **phases** (decided by the owner):

| Phase | Means |
|---|---|
| **active** | on this moment |
| **refractory** | it was active the moment before, so it can't come on this moment |
| **ready** | neither: it can come on when a gate opens |

A member active for one moment is refractory for the next, then ready. Gates count active and refractory members (see
[edges and gates](edges-and-gates.md)). A state holds by its members taking turns: some active while the others are
refractory, and the other way round, so the whole state stays counted.

## The active set

Braces hold a set of members. On its own, a set in braces is **what is active right now**.

```
{1, 4, 7}        members 1, 4 and 7 are active; everything else is not
```

Sparsity is written with a slash: the active set out of the population it is drawn from.

```
{1, 4, 7} / P    three members active out of population P
```

*Provisional:* the exact reading of `/` (as "out of", giving the sparsity) is to be confirmed.

## Marks on members

| Mark | Meaning | Example |
|---|---|---|
| `+` | **recalled**: brought back by completion, not arrived from the world | `{1, 4, +7}`: 1 and 4 arrived, 7 was brought back |
| `!` | **heat**: a hot member, or a gate that is pressed but not opening | `{1, !9}`: 9 is active and nothing holds it |

The `+` mark matters for the open question of whether recalled members may take part in forming (see
[heat and learning](heat-and-learning.md)).

## Static structure: populations and communities

Static structure is what is laid down and doesn't change while the engine runs.

```
P = population 12        twelve members, 1 to 12
V = community a, b       a group of populations, here a and b
```

A **population** is a fixed number of members. A **community** is a fixed grouping of populations. Neither is a
container that does anything. They only say which members exist and how they are grouped.

Dynamic structure, which forms as the engine learns and is loaded or stored, is assemblies (see [assemblies](assemblies.md)).

## The set words

These are borrowed from set theory with exactly their set meanings, and nothing else is borrowed.

| Word | Notation | Meaning here |
|---|---|---|
| member of | `4 ∈ A` | 4 belongs to A |
| union | `A ∪ B` | everything in either |
| intersection | `A ∩ B` | what both share |
| difference | `A − B` | what A has that B doesn't |
| subset | `A ⊆ B` | everything in A is also in B |
| empty | `∅` | nothing |
| count | `|A|` | how many members A has |

These matter because the engine's three main acts are set operations. Composition is close to a union. Abstraction is
an intersection. What doesn't belong is a difference. Heat itself is a difference (see
[heat and learning](heat-and-learning.md)).

**Computation note.** Because everything is binary and sparse, every one of these is cheap on a CPU. A set is a
bitset. Intersection is a bitwise AND, union is an OR, and count is a popcount.

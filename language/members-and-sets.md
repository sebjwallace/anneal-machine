# Members and sets

## Members

A **member** is the smallest thing in the machine. It is either active or not. Members are named by number, counting
from 1.

```
1, 2, 3
```

Members are not the main things: assemblies are. A member is a **pivot point**, a name that many assemblies can use
and meet through. It keeps no list of its own bonds ([assemblies first](../docs/theories/assemblies-first.md)).

A member that belongs to no assembly is an **individual**. Every member starts as an individual. Members stop being
individuals when an assembly forms around them.

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

Static structure is what is laid down and doesn't change while the machine runs.

```
P = population 12        twelve members, 1 to 12
V = community a, b       a group of populations, here a and b
```

A **population** is a fixed number of members. A **community** is a fixed grouping of populations. Neither is a
container that does anything. They only say which members exist and how they are grouped.

Dynamic structure, which forms as the machine learns and is loaded or stored, is assemblies (see [assemblies](assemblies.md)).

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

These matter because the machine's three main acts are set operations. Composition is close to a union. Abstraction is
an intersection. What doesn't belong is a difference. Heat itself is a difference (see
[heat and learning](heat-and-learning.md)).

**Computation note.** Because everything is binary and sparse, every one of these is cheap on a CPU. A set is a
bitset. Intersection is a bitwise AND, union is an OR, and count is a popcount.

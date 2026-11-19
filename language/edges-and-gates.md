# Edges and gates

## Edges

An **edge** joins one member to another. Edges are directed and binary: there or not, with no strength. An edge never
stands alone. It is always part of a gate (below), and **it is stored with the gate that receives it**, not with the
member it comes from. A member keeps no list of where it points.

| Edge | Notation | Meaning |
|---|---|---|
| bond | `a -> b` | a lasting edge: activity at a counts towards b |
| latch | `a ~> b` | a short-lived edge (meaning deferred, see below) |
| two-way | `a <-> b` | a bond each way |
| blocking | `a -| b` | activity at a counts against b |

**Latches are deferred.** We know they are needed for things that hold briefly, such as a train of thought or what is
being held right now, rather than lasting memory. What exactly they are, and how they differ in behaviour from bonds,
is not yet agreed.

## Gates

A **gate** is how a member decides whether to become active from the members that have edges into it. A set of
sources (its guest list), a rule, and a target. Gates belong to assemblies.

```
{a, b} -> c              c opens if enough of a and b are active (default: 2 or more)
{a, b, d, e} >= 3 -> c   c opens if at least 3 of them are active
```

The default threshold is two: one source alone never opens a gate. This is the bar of two from the old core.

**Gate rules.** Besides a count, a gate can follow one of the logic-gate rules. The owner wants these kept, so the
language is flexible about gate types.

| Rule | Opens when |
|---|---|
| any | at least one source is active |
| all | every source is active |
| nand | not every source is active |
| nor | no source is active |

*Provisional:* where the rule name sits in the notation (for example `{a, b} all -> c`) is not yet agreed.

A gate that is **pressed but not opening** (some sources active, not enough) is marked hot with `!`. That is one of
the places heat shows.

## Gates have a limit

A gate can only hold so many sources: say eight. When a gate is full, nothing more is added to it, and new learning
has to become new structure, a new assembly with its own gates. Sources are never taken out of a gate.

```
gate limit: 8
```

*Provisional:* the size, and the form of the declaration.

## Declarations

A declaration sets a default for what follows.

```
default gate: >= 2
```

Settings that are trade-offs rather than rules (how much small heat to chase, when to let go, how much room memory has
and where the floor sits, the gate limit) will probably be declarations of this kind, not core notation.

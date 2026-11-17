# Edges and gates

## Edges

An **edge** joins one member to another. Edges are directed and binary: there or not, with no strength. An edge never
stands alone. It is always part of a gate (below).

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
sources, a rule, and a target.

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

## Declarations

A declaration sets a default for what follows.

```
default gate: >= 2
```

Settings that are trade-offs rather than rules (how much small heat to chase, when to let go, what to keep in memory
and what to move out) will probably be declarations of this kind, not core notation.

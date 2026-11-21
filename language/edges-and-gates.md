# Edges and gates

## Edges

An **edge** joins one member to another. Edges are directed and binary: there or not, with no strength. An edge never
stands alone. It is always part of a gate (below), and **it is stored with the gate that receives it**, not with the
member it comes from. A member keeps no list of where it points.

| Edge | Notation | Meaning |
|---|---|---|
| bond | `a -> b` | a lasting edge: activity at a counts towards b |
| two-way | `a <-> b` | shorthand for a bond each way |
| blocking | `a -| b` | activity at a counts against b (not used yet, see below) |

## All bonds are directed: inward and outward

There is only one kind of bond. What differs is **which way it faces relative to an assembly**, and that gives two
kinds of dynamics without labelling any bond:

- **Inward**: bonds between members of the same assembly point at each other, so they form loops. The members hold each
  other on, and part of the assembly brings back the rest. That is **completion**, and once complete, the assembly
  **reverberates**: it stays held until competition changes it.
- **Outward**: bonds from one assembly to another don't loop back, so they carry activity on to what comes next. That is
  **transition**, an assembly invoking another, and it is where **order** comes from. "cat" and "act" use the same
  members but different outward bonds.

Loops give completion; chains give sequence. The dynamics come from the shape of the structure, not from the bond.
Assemblies of the first shape are **states**; of the second, **transitions** ([walkthrough](walkthrough.md), step 4).

**Declared: a transition's gate opens on one source; a state's gate needs agreement (two by default).** That is what
makes forwards more prominent than backwards: the forward step has more ways in (it is supported by the whole and by
the chain), not a stronger bond. Bonds stay binary: a source appearing in two gates is one bit in each, not a
duplicate, and no bond carries a count.

**Timing (provisional).** Every bond acts one moment later. Inside an assembly, the members reverberate round their loops
and settle over a few moments. Between assemblies, A invokes B on the next moment, so order comes out of the direction
of the bonds.

## Alternatives and keys

On a path, `a | o` is **alternatives** (one wins), and `x & k` is a **value with a key**: the first is on the path, the
rest are conditions on its gate, all required along with the step before (walkthrough step 5). A member's full definition
is the **or of its gates**, each labelled with where it formed (walkthrough step 6):

```
barks  =  dog & day                  from dog -> barks & day
       |  {the, dog} >= 2            from the whole ⟨the, dog, barks⟩
```

## Logic from gates and topology

- **AND is a gate.** An assembly invoked by two others opens only when enough of both are active: `{A, C} -> B`. A alone
  primes B but doesn't open it.
- **OR is topology.** Two separate routes into the same assembly, either one enough on its own.

Both are fuzzy, because "enough" is a count, not a strict all.

**Negation is deferred.** Competition already gives exclusion: when one assembly wins a place, its rivals stay off. An
explicit "not" (the blocking edge, or a gate rule) would help with exceptions ("birds fly, except penguins"). It comes
in only when an AMX world shows a failure that only negation fixes.

**Latches are probably not needed.** They were deferred as a short-lived kind of edge. Holding is now done by inward
loops, and routing by the shape of the structure and what is active
([the tilting landscape](../docs/theories/the-tilting-landscape.md)). `~>` is withdrawn until a need appears.

## Gates

A **gate** is how a member decides whether to become active from the members that have edges into it. A set of
sources (its guest list), a rule, and a target. Gates belong to assemblies.

```
{a, b, d, e} >= 3 -> c   c opens if at least 3 of them are counted
```

**What a gate counts (decided):** members that are **active** or **refractory**. Every member is in one of three
phases: active (on this moment), refractory (active the moment before, so it can't come on now), or ready (it can come
on when a gate opens). Every bond acts one moment later.

**Thresholds (decided): no fixed number.** The old bar of two is retired.
- **A state's gate** opens for its ready members when the state's counted part is bigger than its missing part:
  `|state ∩ counted| > |state − counted|`. Equal is a tie, held. The threshold follows the state's size: 2 of 3, 3 of
  5, 8 of 14.
- **A transition's step** opens when the step before, and all its keys, are counted.

**Gate rules.** Besides a count, a gate can follow one of the logic-gate rules. The owner wants these kept, so the
language is flexible about gate types.

| Rule | Opens when |
|---|---|
| any | at least one source is active |
| all | every source is active |
| nand | not every source is active |
| nor | no source is active |

*Provisional:* where the rule name sits in the notation (for example `{a, b} all -> c`) is not yet agreed.

A member whose gate reads some counted sources but doesn't open is **primed** (the owner's word, replacing "pressed"):
activity reached it, but not enough for it to come on, whether too little was counted, a rival won, a tie was held or
the budget cut it. A primed gate is marked hot with `!`. That is one of
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
gate limit: 8
```

(The old example here, `default gate: >= 2`, set the retired bar of two.)

Settings that are trade-offs rather than rules (how much small heat to chase, when to let go, how much room RAM has
and where the floor sits, the gate limit) will probably be declarations of this kind, not core notation.

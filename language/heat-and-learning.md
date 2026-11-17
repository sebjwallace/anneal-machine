# Heat and learning

Energy is the first principle. **Heat is energy that can't flow**: parts that don't fit cheaply together. Learning is
how the machine cools, by changing structure so that energy can flow again. Structure is what cooling leaves behind.

The full reasoning is in [how heat restructures](../docs/theories/how-heat-restructures.md). This page sets out what
can be written in the language so far, and marks clearly what can't yet.

There are two families of heat. This page covers only the one that changes structure (forming and breaking). The
other has been mentioned but not yet described.

## Heat as two set differences

Two sets matter at any moment:

- **active**: what is on now, from the world;
- **accounted**: what the structure holds, brings back or expects.

Heat is what's left over when one is taken from the other.

```
gap    = active − accounted      on, but nothing holds it: something new
misfit = expected − active       expected by an assembly, but absent
```

When both are empty (`∅`), there is no heat and nothing changes. The size of the heat is the count of what's left over:
`|gap|` and `|misfit|`. No averaging anywhere.

## Forming: cooling a gap

A gap is cooled by forming: bonding the uncovered members into an assembly, bonded to the held context they arrived
with.

```
gap = {!9, !12}
forms ⟨9, 12⟩      bonded to the held context
```

After forming, the same input comes out with an empty gap: it is accounted for. Nothing old is changed. The new
assembly attaches beside what was there, which is how reinforcement works: the old assembly gains one more way in.

**What is written down so far:** the gap as a difference, and forming as adding structure until the difference is
empty.

## Small heat is ignored

A small misfit inside a coherent structure is filled in by completion and goes no further. "cxt" in a cat-ish context
completes to "cat", the "x" is left on its own, and no bonds change. Whether completion wins depends on context: the
held surrounding assemblies either back it or don't. Heat that completion cools is noise. Heat that survives is what
changes structure.

## New things form beside old ones

A real new thing that looks like an old one ("cot" against "cat"), arriving in a context that doesn't back the old one,
is not cut out of the old assembly. A new assembly forms beside it, from what arrived and the context it arrived in.
The old one is untouched.

## Breaking: not yet writable

What has been agreed:

- **Breaking happens through competition.** When two structures claim the same ground, they compete.
- **Breaking is local.** Only the bonds at the **contact points** break: the bonds running from the shared part
  towards the rival pieces. Everything else in both structures stays. You forget the claim, not the memory.
- **The contact point is not the intersection.** The intersection is the shared part, which is what fits. The heat is
  where both structures lean on the shared part but expect different things of it.
- **Breaking waits.** While the contest is hot, both structures are kept and the tie is held. Bonds break only once one
  side has **settled**. Timing, not strength, protects a true but harder-to-reach structure from being thrown away.

What is missing before breaking can be written:

1. **"Settled" as a set condition.** What exactly must be true, in set terms, for a contest to count as over?
2. **"Contact point" as a set.** Which bonds exactly, written with the set words.

Until those two are pinned down, no notation for breaking is given here.

## Heat that won't settle

If a contest never settles, the machine has three honest options: look outward for more structure, let the heat go, or
contain the contest (park it, so that a new angle can reopen it). It never invents structure to close a gap.

Letting go of **heat** (always needed, so the machine can move on) is distinct from letting go of **structure**
(optional, done for cost). Forgetting need not be deleting: cold structure can move out of memory to disk and come back
when primed. These are trade-offs, so they will probably be declared settings, not core notation.

## Open on this page

- Whether recalled members (`+`) may take part in forming. This is the most likely route for fiction.
- How much small heat to chase versus park.
- What in memory decides which cold structure to warm from disk.

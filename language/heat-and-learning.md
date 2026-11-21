# Heat and learning

Energy is the first principle. **Heat is energy that can't flow**: parts that don't fit cheaply together. Learning is
how the engine cools, by adding structure so that energy can flow again. Structure is what cooling leaves behind.

The full reasoning is in [how heat restructures](../docs/theories/how-heat-restructures.md). This page sets out what
can be written in the language so far, and marks clearly what can't yet.

There are two families of heat. This page covers only the one that changes structure (forming). The
other has been mentioned but not yet described.

## Heat is incompletion

Without the metaphor, heat is simply **what invoke couldn't complete**, and invoke already measures it. Three countable
parts:

- **missing**: for each assembly that is partly active, how much of it isn't (`|assembly − active|`, the "2 of 3");
- **unexplained**: active members that no assembly accounts for at all (the `!o`);
- **unsettled**: ties being held. Counted, but resolve doesn't act on them: more structure can't settle a tie, only more
  evidence can.

All three are counts of bits. The cost resolve weighs is this incompletion together with the structure it would add (see
[resolve](resolve.md), economy).

## Heat as two set differences

Two sets matter at any moment:

- **active**: what is on now, from the world;
- **accounted**: what the structure holds, brings back or expects.

Heat is what's left over when one is taken from the other. It is what [invoke](operations.md) leaves when it can't
complete.

```
gap    = active − accounted      on, but nothing holds it: something new
misfit = expected − active       expected by an assembly, but absent
```

When both are empty (`∅`), there is no heat and nothing changes. The size of the heat is the count of what's left over:
`|gap|` and `|misfit|`. No averaging anywhere.

## Forming: cooling a gap

Forming is what [resolve](resolve.md) does; that page sets out its shapes (composition, abstraction,
decomposition, sequence). In short, a gap is cooled by forming: bonding the uncovered members into an assembly, bonded to the held context they arrived
with.

```
gap = {!9, !12}
forms <9, 12>      bonded to the held context
```

After forming, the same input comes out with an empty gap: it is accounted for. Nothing old is changed: forming always
makes a new assembly and never adds to an existing one's gates. The new
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

## Nothing breaks

Bonds are never removed ([nothing breaks](../docs/theories/nothing-breaks.md)). A mistake isn't erased. It is
outcompeted: the right structure forms beside it, wins the contests, and the mistake is stored, still connected
but hard to reach. A specific enough cue can still bring it back. Correction is losing, not deleting.

So the language has two kinds of change: **forming**, and **moving between loaded and stored**.

Because bonds live in the gates of the assembly they were formed in, a mistake's bonds all sit in the mistaken assembly.
Nothing has to find and remove them: the whole assembly loses and is stored.

## Loaded and stored: what moves an assembly

**Storing: demand.** Which assemblies stay loaded is decided by demand at each moment.

- Everything active **votes** for what it is bonded to. A vote is a count, the same count a gate does.
- **Ranking with limited room.** RAM holds only so much. The most demanded assemblies stay loaded. As something
  else gathers more votes, it takes the room, and the less demanded are stored. Things are stored because something
  else is more wanted, not because their own votes dropped.
- **A floor.** Anything with too few votes is stored even when there is room, so a single stale bond can't keep
  something loaded. (This leaned on the bar of two, now retired: where the floor sits is open again.)

**Loading: build-up from activity.** A stored assembly can't be found by ordinary activity, since nothing loaded
checks it. Instead, activity among loaded assemblies builds up on the stored assemblies it is connected to, a little each moment.

- Related activity builds up in the same place; unrelated activity spreads thin. A single touch is never enough on its
  own.
- The build-up **fades as the engine moves on**, counted in the engine's own moments, not clock time. An idle engine
  forgets nothing.
- When a stored assembly's build-up passes a threshold, it **loads**. Its arrival adds activity, which can build up
  on other stored assemblies in turn. This is a stream between RAM and disk, not a batch of lookups, and it is how
  a missing piece can arrive on its own.

**The four rules the language relies on.**

1. A stored assembly takes no part in ordinary activity.
2. Activity among loaded assemblies builds up on stored assemblies it is connected to.
3. That build-up fades as the engine moves on, counted in its own moments.
4. Build-up and demand only decide where an assembly lives, never who wins a competition. A number used in competition
   would be a weight.

How the middleware between RAM and disk keeps track of this (its index, where it lives, how it streams) is
engineering, not language. It can start with the most obvious approach.

*Provisional:* how much room RAM has, where the floor and the loading threshold sit, and how fast build-up fades.
These are trade-offs, probably declared settings. The build-up may need a word of its own; "primed" is not used for
it, because in the language that means reached but not open, while loaded.

**Primed is not active.** An assembly that gets a vote or two but doesn't make it into the sparse active set is only
primed. Being primed doesn't make something winning.

## Heat that won't settle

If a contest never settles, the engine has three honest options: look outward for more structure, let the heat go, or
contain the contest (it stays as structure, stored if no longer demanded, so a new angle can load it again). It never
invents structure to close a gap.

## Open on this page

- Whether recalled members (`+`) may take part in forming. This is the most likely route for fiction.
- How much small heat to chase versus park.
- The settings for room, floor, loading threshold and fade.

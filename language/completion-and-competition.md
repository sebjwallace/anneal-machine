# Completion and competition

## Completion

**Completion** is the machine bringing back the rest of a thing from part of it. When enough of an assembly arrives to
open its gates, the missing members become active. They are marked `+` as recalled.

```
A = ⟨1, 4, 7⟩
{1, 4} => {1, 4, +7}
```

`=>` reads "completes to". Completion repeats until nothing new opens, then it has settled.

**When completion fills in.** Only when what arrived covers enough of the assembly to open its gates. A small gap
(most of the whole present, a few members missing) is filled in. A huge gap (too little present) opens nothing, so
nothing is filled in. Small gaps filled in this way are treated as noise: reading "cxt" as "cat".

Completion is reading. In learned computation, writing is bonding and reading is completion
([learned computation](../docs/theories/learned-computation.md)).

## Competition

When two assemblies claim the same ground, they **compete**.

```
A | B
```

**Most support wins. One more is enough. Ties are held.** Support is how much of each is backed by what is active,
which in practice means how many ways in each one has. A held tie keeps both, unresolved, until something settles it.

Held ties matter for learning. While two structures are still contesting, both are kept, and nothing is broken (see
[heat and learning](heat-and-learning.md)).

## Fitting

A thing **fits** another when it sits inside it, or mostly does. Fitting is measured with the set words: how much of
one is in the other.

```
X fits A      most of X is in A:  |X ∩ A| is large compared with |X|
```

*Open:* how much is "most", and whether fitting is a threshold or a comparison between candidates, is still to be
worked out. Fitting is the next subject after heat.

## Comparison and abstraction

Comparing two things uses intersection and difference.

```
A ∩ B     what they share
A − B     what A has that B doesn't
B − A     what B has that A doesn't
```

**Abstraction is forming what's shared.** The shared part of two experiences becomes a new assembly of its own, formed
from their intersection. The originals are left intact.

```
forms S = ⟨A ∩ B⟩
```

This replaces the earlier idea of the cut splitting an assembly into a core and leftover parts. Nothing is split.
What's shared is formed beside what's there ([how heat restructures](../docs/theories/how-heat-restructures.md), §5).

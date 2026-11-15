# C88 · Draft model: lowering the bar (written before the code)

**For:** the owner's picture ([flow and heat](../../../docs/theories/flow-and-heat.md), section 7): a piece that settles
on the surface makes the deep lower its bar, so activity spreads out from the piece's two ends to find where it slots
in. When the two fronts meet, the dots connect: the deep lights up (the aha), and the piece sinks.

**A primitive version, on purpose (the owner's note).** A real deep is probably already primed: some of its activity
already welcomes what is new, so the bar would need to drop very little. Here the deep starts from nothing and the bar is
simply lowered, to see what happens.

**The bar, in cells:** the core settles in rounds, each round letting in the candidates with the most support, until
nothing new joins (RM-4, RM-5). Run to the end, that reaches everything connected (C87). Here the same rounds are let
through one at a time: the bar starts high (no spreading: only what is seen) and each step lowers it by one round.
Nothing is tuned: the step is one round of the core's own settling, and it stops by itself.

```
the deep (a slow volume, the core) has learnt its world
a new link between A and B, settled on the surface:
    front A: settling from A alone, one round at a time; front B: the same from B
    lower the bar step by step: at step k, each front has run k rounds
    stop when the fronts share a brought-back cell (they meet), or neither grows (they never meet)
    the step at which they meet: how far the bar had to drop (near or far)
    what they share then: how many dots connect at once (the size of the aha)
```

**Given by hand, declared:** the test is run by the experiment, on two fronts settled separately and compared, as in
C87. How the deep would hold both ends and notice the meeting by itself is not modelled.

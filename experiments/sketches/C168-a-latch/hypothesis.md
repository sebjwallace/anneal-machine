# C168 · A latch: hypothesis

Follows [C167](../C167-a-jump-and-letting-go/findings.md), where a procedure bound the place it started so a way of
working could jump back there, and let go by competition when finished. A second sum in the same memory exposed that
the bound place was permanent: the second sum's jump brought on both starts. Things bound for one run of a procedure
need to be temporary, latches rather than bonds. All by hand, as before.

## The latch, and a choice in it

The owner's rule is that nothing breaks, so a latch can't be a connection that is formed and then deleted. Here **a
latch is held activity**: a start marker for each place, wired the same way for every place, in advance (architecture).
When the cue is given at a place, that place's start marker comes on. It is **held only while the procedure is held**
(the marker and the procedure together renew it). The jump brings on the place whose start marker is on. When the
procedure lets go, the marker isn't renewed and is gone. Nothing new is formed per sum. This is what [procedures from
states and transitions](../../../docs/theories/procedures-from-states-and-transitions.md) says latches became: a held
register.

**The two sums now run straight on, in one memory, with nothing reset between them.** The second cue arrives after the
first sum's activity has gone, if it has gone. In C167 the memory was reset between sums. That was the experiment's
doing, and the latch has to make it unnecessary.

## Arms

1. **Bond, two sums** (C167's binding, now with no reset between): expected to fail as C167 did.
2. **Latch, two sums:** the second sum jumps only to its own start.
3. **Latch, two sums, no letting go** (control): the first procedure never lets go, so its start marker is still held
   when the second cue comes, and the second jump should bring on both.
4. **Latch, one sum** (as C167's first arm, 200 sums): nothing else should change.

## Predictions (fixed before running)

1. **Bond:** the second sum fails nearly always, as in C167.
2. **Latch:** both sums work and copy right in every pair, and the second jump brings on only its own start.
3. **Latch, no letting go:** the second jump brings on both starts and the second copy fails nearly always. So the latch
   works only because letting go releases it.
4. **Latch, one sum:** 200 of 200, as C167.

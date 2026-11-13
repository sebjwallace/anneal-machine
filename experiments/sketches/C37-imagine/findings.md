# C37 · Findings

**Learnt.** 14 things, 2 kinds (frame tops: cap/peak/hook; cart tops: cap/dots/hook). A never-seen object is read
as the nearest seen one with pixels wrong (frame + dots: cost 3.5, 2 wrong, against 1.5 for frame + cap).

**Settling falls into the familiar.** Bricks are the engine's own cut of each shape (a top comes apart into two
2-pixel pieces).
- Frame + the pieces of a cap → frame + peak (5 of 8) or frame + hook with 1 pixel wrong (3 of 8). Never frame + cap,
  but always a *known* frame object: the pieces were reshaped into whatever it knows best.
- Frame + the pieces of dots (never seen together) → frame + hook, 1 pixel wrong, 8 of 8. The new object never formed.
- Holding the frame still (a goal) and throwing dots: the same, 6 of 6. Table held, cap thrown: table + cap 3, table + peak 3.

**Big rebuilds need real heat.** Moving one piece at a time to its best place can't rebuild something that needs two
pieces to move together: a cart was never rebuilt. With heat (worse moves kept with a falling chance, T0 = 4 over
6000 tries, chosen numbers) table + cap came back from its smallest parts 2 of 6 and cart + dots 1 of 4.
The cart base alone isn't read as one thing (it has only ever been seen with a top), so "hold a cart" isn't possible.

**First version, dropped.** Letting pieces swap for any other known thing filled the page with the biggest things piled
on each other: cheap to read, but mush. Saving rewards more stuff; the number of pieces has to be fixed.

**Result.** The mechanism works as recall, not yet as imagination: settling by the engine's energy pulls toward what has
been seen, and a never-seen pair costs more than its nearest seen neighbour, so it is never chosen. Novelty can only
come from something that makes unseen combinations as cheap as seen ones: a kind whose versions are shared across bases
(the open question in milestone 10), or a goal that pays for the new arrangement. Engine unchanged.

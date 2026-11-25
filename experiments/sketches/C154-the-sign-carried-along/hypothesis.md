# C154 · The sign carried along: hypothesis

Follows [C153](../C153-one-step-reads-the-sign/findings.md), where one learned step added and subtracted by reading the
sign from the page each column. But the encoder wrote the sign under every column, so the page did the carrying. Here
**the sign is written once**, and the step has to pass it along itself, the way it passes the carry: read it, use it,
and write it where the next column will read it. That's a variable carried through the frame by the procedure, which
is the frames-and-variables goal in miniature.

## What changes from C153

- **The sign is written once,** under the column where the work starts (the rightmost), in worked examples and test
  sums alike. On paper it would be on the left; here it's on the right because that's where the procedure starts, and
  that placement is the encoder's (declared).
- **The step has a sign write.** A step is now: three digit reads, a sign read, a units place, a carry place, **a sign
  place**, a move. The sign read's content is held one phase and, with the sign write place, written there, by the same
  fixed write rule that writes digits. A place that already holds something is never written.
- **In the lanes, a candidate's own sign writes are its own.** Lanes compare against the worked example rather than
  writing into it, because many candidates share it. A sign written by a lane goes into that lane's own copy of the
  place, held while its clock runs, and the lane reads it back like any written content. Only places empty in the
  example can be written. In the test circuit, the same write goes into the space by the write rule.
- **The worked examples don't show the carried sign.** The working (what must cool) is still the answer digits and the
  carries or borrows. So nothing marks the carried sign as something to get right. A candidate that doesn't carry the
  sign fails because the next column has no sign to read, so no facts and no answer digit, and the lane stops.
- **Candidates.** Stage A as C153. Stage B is split by the same heat logic as stage A. B1 runs each survivor with every
  carry place, move and sign read, with no sign write, and keeps those that cooled everything in the first column
  (its answer digit and its carry). B2 runs each of those with every sign place over the whole example. A lane that
  settles binds its step and link, as before.

## Arms

1. **Learn:** the sign written once. 12 worked examples per seed, alternating "+" and "−". 10 seeds.
2. **The sign under every column in training** (C153's pages), but once at test. Here nothing in training needs the
   sign carried, so this checks that the carrying is learned from the evidence and not built in. 4 seeds (it is
   expected to search every example, which is slow).

Test, per seed: the store's step and links bound into one circuit; 20 sums per length at 4 to 8 digits for each sign,
at a column not seen in training, **each with its sign written once**.

## The ledger

**Given:** the encoder (worked examples written in full, the sign written once under the starting column, the working
declared as heat); the cue "="; the two fact families; the circuit's fixed architecture (as C153, plus holding the
sign read one phase, the sign write place, and writing a sign by the same write rule; in the lanes, a lane's own copy
of the places it writes a sign into); proposing candidates (stages A, B1 and B2); moving the store's step and links
into the test circuit. **The engine:** running every candidate, carrying the sign column to column, cooling, stopping,
settling, binding the step and the link, recalling with copies counting, and running every test sum.

## Predictions (fixed before running)

1. **Learn, the store:** in every seed, "=" gives C153's step plus **write the sign at +1,−1** (under the next column
   to the left, where the moved focus will read it below). Links right. By example 2, and later examples by recall.
2. **Learn, the test:** 100% on both kinds at 4 to 8 digits with the sign written once, every run stopping by itself.
3. **The sign under every column in training:** there's no empty place in the sign row to write to, so where the
   sign is written makes no difference to any example, and every sign place settles alike. The store ties at that
   part and gives no step: 0% at test, in every seed.

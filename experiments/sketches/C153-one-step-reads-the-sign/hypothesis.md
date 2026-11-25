# C153 · One step reads the sign: hypothesis

Follows [C152](../C152-subtraction-on-the-same-circuit/findings.md). There, the circuit learned the subtraction step as
easily as the addition step, but the two couldn't live together: they shared four of seven parts, and wherever they
shared a part the store and the circuit lost track of which procedure was running. The sign started a procedure and was
then gone.

C152's two steps differed in only two parts: the facts used, and the order of the reads (addition read the bottom number
first, subtraction the top). Addition doesn't care about order, so reading the top first works for it too. Then the
only difference left is the facts. **The question here: if the sign is on the page, read like any digit, can one
learned step do both, with nothing to keep apart?** If so, the answer to "are separate states needed?" is "not here".
If not, how it fails should show what a second state would be for.

## What changes from C152

- **The sign is written on the page.** A fifth row, below the answer, holds the sum's sign under every column of the
  sum. The circuit's places grow by that row's three (15 in all). This applies to worked examples and test sums alike.
  Having the sign under every column, rather than once, is the encoder's doing and is declared as a crutch. A step that
  carries the sign along from one written sign is a later experiment.
- **The step has a fourth read, the sign,** and no family part. A step is: three digit reads, a sign read, a units
  place, a carry place, a move. The sign is read like a digit (attended in phase 1, its content on by completion, routed
  in phase 3), and what it's routed into is a family of facts.
- **Which family a sign means is learned, not wired.** Nothing in the code links "+" with the addition facts. A
  candidate is tried with either family for the example's sign. When a lane settles, the binding rule binds two things
  into the store: the step under a cue for "a written sum to work" ("="), and the link from the sign read to the family
  the lane used. Links are held in the store like steps, with copies counting.
- **One store, one cue.** Every settled lane, from either kind of example, binds its step under "=". What has been
  learned is whatever the store gives from "=", plus whatever family it gives from each sign.
- **Candidates.** Stage A is as in C152 (read sets with a family held on, at single columns, nearest ring first and one
  ring further), except that **addition is now proposed in all three orders too**, as subtraction is. Addition's facts
  don't care about order, so all three orders explain an addition. Only reading the top number first also explains a
  subtraction. Stage B runs each survivor over the whole example, with every carry place, every move and **every sign
  place**, and with the family now coming only from the sign read, through the candidate link. A lane only settles if
  it found the sign.

## Arms

1. **Learn:** 12 worked examples per seed, alternating "+" and "−" (2 and 3 digits). 10 seeds.
2. **Addition proposed unordered:** as arm 1, but addition is proposed in one order only, as C151 and C152 did (which
   reads the bottom number first). Then the addition and subtraction steps differ, and both are bound under "=". This
   checks whether one step emerging depends on addition's freedom of order being available.

Test, per seed: the store's step and links bound into one circuit; 20 sums per length at 4 to 8 digits for each sign,
at a column not seen in training, each started from "=" with its sign written under every column.

## The ledger

**Given:** the encoder (worked examples written in full, the sign under every column, declaring the working as heat);
the cue "=" that starts any written sum; the two fact families, formed beforehand; the circuit's fixed architecture (as
C152, plus sign routing); proposing candidates (stages A and B, now with sign places and candidate links); moving the
store's step and links into the test circuit. **The engine:** running every candidate, cooling, stopping on a misfit,
settling, binding the step and the link, recalling with copies counting, and running the test sums.

## Predictions (fixed before running)

1. **Learn, the store:** in every seed, "=" gives one step: read the top number (−2,0), then the bottom (−1,0) and the
   carry or borrow above (−3,0); read the sign below (+1,0); write the units at the focus and the carry or borrow at
   −3,−1; move ←. "+" links to the addition facts and "−" to the subtraction facts. It's learned by the second or third
   example, as soon as a subtraction has been settled: that's when reading the top first gets one more copy than the
   other orders. Later examples, of either kind, are settled by recall.
2. **Learn, the test:** 100% at 4 to 8 digits for both signs, in one circuit, every run stopping by itself.
3. **Addition proposed unordered:** the addition step (bottom first) and the subtraction step (top first) are both
   bound under "=" and share their other parts, so C152's rivalry returns. The store ends with no step in most seeds,
   and in no seed are both kinds of sum right.

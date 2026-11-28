# C179 · Three ways to adapt (round one of the fan-out): findings

Run, one arm at a time: `ARM=greedy node fanout.js > out-greedy.txt`, then `ARM=B`, `ARM=C`, `ARM=A` and `ARM=A+B`,
each into its own `out-*.txt`. Progress goes to `log-*.txt`. `log-first-run.txt` is the first full run, stopped during
spreading. About two hours in all. Read [the hypothesis](hypothesis.md) first, including the parts added during the
run.

## In short

**Heat lowering the bar was the best of the three: the cheapest, and reliable.** On the second row it took 226 runs
(greedy, the reference: 258) and got 200 of 200 new second rows right. It tries the nearest changes first, but keeps
widening until something cools more, then keeps the winner and starts near again. Near changes are cheap to try, and
widening means it's never stuck with only near ones.

**Spreading from the gap got stuck every time on the second row.** Counting only how far along from the start the
working has settled, no change of one or two parts improved it. The first gap, the first column's answer, needs the
answer moved down, the top read one over, and the carry read moved, all at once. Greedy and B get round this because
they count cooling anywhere: the carry row can come right before the first answer does. **Pieces don't come right in
the order the working is done.** Progress has to be counted wherever it shows up, not only at the front.

**Flow worked sometimes and was the least predictable.** It succeeded in 3 of 5 seeds (266, 545 and 1,131 runs) and got
stuck in 2, running out of steps while its units drifted on level ground. But it was the only rule that, in one seed,
found the right second row first time without learning the coincidence first. Randomness can avoid a trap that a
fixed order walks into, but it can't be relied on.

**Flow pulled toward the nearest changes was worse than flow alone: 1 of 5.** The second row needs far changes (three
to five rows), so a pull toward near changes starved the units of what they needed. In one seed it learned the
coincidence (holding a digit of the first row) and could never escape it. Later pages brought up that coincidence,
because its view matched best, and the near-biased units couldn't reach the far change that would fix it.

**Times one digit was easy for every rule** (11 to 46 runs), because the one change it needs is near.

## Results

| rule | times one digit (runs) | second row (runs) | second row test (200 new, from the start) |
|---|---|---|---|
| greedy (C177, reference) | 15 | 258 | 200 of 200 |
| **B · heat lowers the bar** | 14 | **226** | **200 of 200** |
| C · spreading from the gap | 15 | 6,631 (stuck on all four examples) | 0 of 200 |
| A · a budget flowing, seed 1 | 12 | 1,131 | 200 of 200 |
| A, seed 2 | 13 | 2,427 (stuck on all four) | 0 of 200 |
| A, seed 3 | 46 | 2,429 (stuck on all four) | 0 of 200 |
| A, seed 4 | 13 | 545 (right first time) | 200 of 200 |
| A, seed 5 | 26 | 266 | 200 of 200 |
| A + B, seed 1 | 13 | 937 | 200 of 200 |
| A + B, seeds 2, 3, 5 | 29 to 31, 12 | about 2,500 (stuck on all four) | 0 of 200 |
| A + B, seed 4 | 11 | 2,117 (learned the coincidence, then stuck) | 4 of 200 |

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | times one digit: every rule within a few dozen runs | **Holds** (11 to 46). |
| 2 | B on the second row: about greedy's 200 to 300, perhaps fewer; risk of a near coincidence leading it astray | **Holds:** 226. Like greedy, it learned the coincidence on the first example and corrected it on the second. |
| 3 | C on the second row: stuck | **Holds**, on every example. |
| 4 | A on the second row: some seeds succeed, more runs, wide spread, some stuck | **Holds:** 3 of 5, from 266 to 1,131; 2 stuck. |
| A+B | fewer stuck seeds than A, more runs than B | **Fails:** 4 of 5 stuck or wrong, worse than A. The near pull starved the far changes the second row needs. |
| 5 | an arm that learns only a coincidence tests worse | **Holds:** A + B seed 4, 4 of 200. |

## Disclosed

- **The first full run was stopped** after spreading had run over half an hour. A cap of 3,000 tries per worked example
  (counting as stuck) was added for every arm, and the arms were rerun one at a time. The cap didn't bind for any arm:
  spreading stopped by itself (stuck) at about 1,650 tries per example, and flow ran out of steps at about 600. Greedy
  and B gave the same numbers as in the first run.
- Runs slow down as the memory fills with frame cells from failed tries (from about 0.1 to over 0.3 seconds a run).
- The randomness in A and A + B is new here, and declared.

## The ledger

As C178. All four rules are the code's in this round. They're copies of how each candidate energy rule would choose
what to try, to learn their trade-offs before one is built into the engine. **Given:** the proposing in each form, and
the randomness in A.

## What it shows

1. **Count progress wherever it shows up.** Strict order (spreading from the gap) fails when several parts must change
   before the first place can come right.
2. **Start near, but keep widening.** Preferring near changes is cheap only if the rule never stops at near ones.
   Committing to near (A + B) fails when what's needed is far.
3. **Keep the winner and start again from it.** This is what greedy and B share, and what makes them steady. Flow's
   drifting wastes steps and can't be relied on.
4. **Randomness avoids some traps but adds others.** Flow once avoided the coincidence that every fixed order fell into,
   and more often ran out of steps.
5. **A coincidence learned early is dangerous when context is good:** the page brings it up again as the best match, so
   later learning starts from it. Rules that can reach far changes escape it; near-biased ones may not.

For round two this points at building **B into the engine**: heat lowering the bar around hot places ring by ring,
competition picking, the winner kept and the bar reset. Progress is counted anywhere. Flow's randomness is worth
keeping in mind as a way out of traps, not as the main rule.

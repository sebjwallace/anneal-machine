# C176 · One memory, two lessons: findings

Run: `node learn.js > out.txt` (about seventy-five seconds). Build check: `node sanity.js > sanity.txt`. Read
[the hypothesis](hypothesis.md) first. The first run's output, before the fix below, is kept as
[out-first-run.txt](out-first-run.txt).

## In short

**Lesson 2 took 12 runs in one memory, with nothing carried over by the code.** From scratch it took 1,112 runs (C175).
With my code reading pieces off lesson 1 and handing them to a separate search, it took 180. Here, one memory went
through both lessons. On the first times-one-digit page, the start brought up the six adding ways of working it had kept,
by association, because they share the start though not the view. None of them settled the page. Four got the first
column right and then stopped. Varying whether their first read is held or read turned one of them into times one digit,
which settled and was kept, seen with "×". On the second times page, the start brought it up straight away and it
settled first time. At test it did 200 of 200.

**The memory now keeps the lessons apart by what's in view.** After both lessons, a "+" page brings up the adding ways
of working, and a "×" page brings up times one digit. In the tie-break arm both tests were 200 of 200 from the same
memory. In the no-tie-break arm, adding was 0 of 200, because its six equals tie for ever (as C173 found). Times one digit
was 200 of 200.

**Transfer no longer depends on luck.** In C175, only one of the six adding ways of working led to times one digit, and
an arbitrary choice had a five-in-six chance of picking a dead end. Here, the start brings up all six as rivals and the
memory tries them all, so the one that carries over is found whichever was chosen for adding. One honest caveat: in this
run the tie-break happened to choose the one that carries over, so this run doesn't show a wrong choice being got past.
The mechanism that would get past it (all six offered) was used in both arms.

## Results

| arm | lesson 1 (runs) | lesson 2 (runs) | test: adding | test: times one digit |
|---|---|---|---|---|
| no tie-break | 2,053 + 7 | **11 + 1 = 12** | 0 of 200 (six equals tie) | 200 of 200 |
| the first formed wins (a declared crutch) | 2,053 + 1 | **11 + 1 = 12** | 200 of 200 | 200 of 200 |
| for comparison, C175: lesson 2 from scratch | | 1,112 | | |
| for comparison, C175: lesson 2 with my code carrying pieces over | | 180 | | |

Lesson 2's first example, in both arms: 1 recall run, 6 offers (none settled), and 4 variations (the first read held,
in each of the four that got furthest). One variation settled and was kept.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | lesson 1: six equal ways of working; tie and all settle on the second example | **Holds** (no tie-break). In the tie-break arm, the first wins and settles. |
| 2 | lesson 2, first example: the six come up and none settles; the two furthest varied; one becomes times one digit; about 9 runs | **Holds, with four furthest, not two:** with a 0 carried in, two more orders get the first column right by coincidence. 11 runs. |
| 3 | lesson 2, second example: the new one recalled and settles first time | **Holds after the fix** (below). In the first run's tie-break arm it failed. |
| 4 | tests: times 200 of 200 in both arms; adding 0 without a tie-break, 200 with | **Holds.** |
| 5 | transfer doesn't depend on which of the six was chosen | **Holds**, as all six were offered. Caveat: in this run the tie-break happened to choose the one that carries over, so this arm doesn't test a wrong choice. |

## Disclosed: the fix after the first run

In the first run's tie-break arm, the second times page brought up an adding way of working instead of the new one. The
cause was a flaw in my wiring. While a variation was being tried, the start's recall also pulled in an old adding way of
working one moment later, through the chain start → view → frame. It sat there doing nothing. But when the page settled,
binding linked every frame that was on, including that passenger, and linked it to "×". Being the older of two equals, it
won next time. The fix: binding links only the frame that was on when the work started (with the moment the clock
starts). Both arms were rerun. The no-tie-break arm's results didn't change. This is now architecture: what gets kept is
the way of working that did the work.

## The ledger

**Removed:** the code reading pieces off a learned way of working and carrying them to a separate search in another
memory.

**Given:**
- the view at the start (the encoder);
- reading the offers from the competition, ranking them by how much they cooled, and varying one part at a time (the
  code's: the new, smaller crutch);
- the very first example's search (the code's);
- the target, sheets and lesson order;
- the facts and the signs' meanings;
- the part vocabulary and frame cells made in advance;
- in arm 2, the tie-break.

**The engine:** every run from the cue, recall by association with competition and copies, agreement, settling, binding
on settling, and both tests, in one memory.

## What it shows

Learning transfers inside the memory itself. What one lesson leaves behind comes up by association in the next, and the
nearest of it is adapted. That took 12 runs against 1,112 from scratch. Two things are still done by my code: ranking
which old way of working got furthest, and changing it one part at a time. Those are the next crutch. The caveat from
C175 still holds: these two lessons look alike on paper, so the adaptation needed here was a single change.

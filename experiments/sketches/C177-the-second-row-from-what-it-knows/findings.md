# C177 · The second row from what it knows: findings

Run: `node learn.js > out.txt` (about three minutes). Build check: `node sanity.js > sanity.txt`. Read
[the hypothesis](hypothesis.md) first, including the fix found by the build check.

## In short

**The second row was learned in 412 runs, against 136,922 for blind search (C172).** That's over three hundred times
fewer. The memory had already learned adding and times one digit. On the first second-row page, the start brought up
times one digit, which cooled nothing, because it writes on top of the first row. Adapting it, guided by heat, got there
in a handful of rounds. A write may only move to a place still to be done, and a read only to a place holding something.
Each part changes on its own, and a change is kept if more of the working cools. With the learned way of working, 200
of 200 new second rows were right.

**The first example taught a coincidence, and the second corrected it.** On 525 × 67, adapting settled the page with
the carry read in the wrong place, which happened to give the right carries on that page. On 9188 × 54, that version
didn't settle. Adapting from times one digit again found the right one: hold the multiplier's other digit, read the top
one place right, read the carry from the row above the second row, write the answer three rows down, write the carry
one place left. That's the hand-written second-row frame, plus a sign write that only ever lands on places already
holding the sign, so it does nothing.

**What the memory adapted from mattered more than the search.** Each round tried about 50 single changes. Pairs were
needed only once, at the end, when the answer and the carry read had to move together. The heat restriction is what
keeps rounds small: writes go only where there's work to be done.

**The context problem is unchanged, as predicted.** From the start, every second-row page brought up times one digit,
because both are seen with "×" and times one digit has more copies. So second rows from the start were 0 of 200. The
memory can do the second row but can't yet tell when to. Adding and times one digit stayed 200 of 200 in the same memory.

## Results

| | runs | result |
|---|---|---|
| lesson 1 (adding), lesson 2 (times one digit) | 2,053 + 1; 11 + 1 | as C176 |
| second row, 525 × 67: recall, offers, adapting times one digit (4 rounds) | 204 | settled, with a coincidental carry read |
| second row, 9188 × 54: recall, offers (incl. the first one's result: 9 cooled, not settled), adapting times one digit again (4 rounds) | 208 | settled: the right way of working |
| **second row in all** | **412** | against 136,922 blind (C172) and 15,646 recounted with heat first and pieces (C174) |

| test (200 new, the same memory) | right |
|---|---|
| adding | 200 of 200 |
| times one digit | 200 of 200 |
| second rows, from the start | 0 of 200 (times one digit brought up every time) |
| second rows, the learned way of working offered | **200 of 200** |

How the adapting went (from out.txt):

- **525 × 67:** the answer write moved one row down and one place left (4 cooled), then the carry write (5), then the
  top read one place right (7). Finally, two changes together, the answer write and the carry read (10), and it settled.
- **9188 × 54:** the carry write (2), the top read (6), the answer write (8). Finally, the answer write and the carry
  read together (12), and it settled.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | adding and times one digit as C176 | **Holds.** |
| 2 | times one digit brought up, cools nothing, no offer settles; a pair first, then singles; 1,000 to 3,000 tries; risk of a coincidence | **Partly.** As predicted up to the adapting. But **singles came first** (partial agreements, some by coincidence), and a pair was needed only at the end. **204 runs**, far fewer than predicted. **The coincidence risk came true:** the result was wrong in its carry read. |
| 3 | second example: times one digit brought up, fails, the new one settles as an offer | **Fails:** the first example's version (a coincidence) didn't settle. Adapting from times one digit again found the right one (208 runs). |
| 4 | tests: adding and times stay 200; second rows offered 200; from the start mostly wrong | **Holds:** 200, 200, 200; from the start 0 of 200. |

## The ledger

**Removed:** C176's one-part variation over every place. Changes to writes are limited to where the heat is.

**Given:**
- the adapting's proposing, ranking and tie order (the code's);
- the second row's start and composition (learned in C171, given here);
- the first row on the page and the padding (the encoder);
- the view, target, sheets and lesson order;
- the facts;
- the vocabulary and frame cells made in advance;
- the tie-break;
- lesson 1's first search;
- adapting from what the start brought up, not from the nearest offer (a choice in the code; on the second example the
  first example's version had cooled more, 9 places, than times one digit, 0).

**The engine:** every run, recall, competition and copies, agreement, settling, binding.

**Disclosed:** the fix found by the build check (in the hypothesis).

## What it shows

Starting from what it already knows, and changing only where the heat says there's work, the memory reached a way of
working that is five parts away from anything it had learned, in a few hundred tries instead of over a hundred thousand.
Two worked examples were needed to rule out a coincidence. The memory can now do the second row but can't tell when a
page calls for it. That needs more of the page in view at the start than just the sign. The adapting itself, meaning
which change to try and keeping what cools more, is still the code's. It is now a small, local rule: move a part toward
the heat, or toward something there to read.

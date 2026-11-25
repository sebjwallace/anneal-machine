# C157 · Holding a value: hypothesis

Follows [C156](../C156-long-multiplication-a-taste/findings.md), a short taste of long multiplication. On a page with a
two-digit multiplier written as on paper, the learned step can't do even the first row. It carries the multiplier by
writing it into the place to its left, which already holds the multiplier's next digit, so from the second column it
multiplies by the wrong digit. Nothing the learner could find fitted. The indication was that the multiplier has to be
**held** while a row runs, the way a person keeps "times 6" in mind, rather than written on the page. Here a hold is
**offered as a part a step can have**, and the question is whether the long pages pick it.

## What a hold is

Any of a step's three digit reads can be a **hold** instead of a read. A held read picks up the digit at its place
once, in the column where the step starts, and keeps that value on, held by the clock like the step's parts, for as
long as the step runs. Every later column takes that slot's digit from the held value, not from the page. It's fixed
architecture, the same in the lanes and in the test circuit: a pick-up cell that comes on only at the start, a held
value per digit, and gates from the held value into the slot. Whether a step holds, and which read it holds, is learned.

## How holds are proposed

A hold can't be tested column by column, so stage A can't propose one. Holds are proposed by **varied replay**: if
recall and replay both fail, every step in the store is tried once more with each of its three reads turned into a
hold at the same place, with each family as the sign's link. Whatever settles binds itself. That is: try what you know,
then what you know with one part changed, and only then search. It's a new part of the proposer, declared.

## Why this is expected to cause trouble

A step that holds the bottom digit can't add or subtract, because there the bottom digit changes every column. A step
that reads it every column can't do long rows. So if the long pages pick the hold, **the store will hold two genuinely
different steps under one cue ("=") for the first time**. C153 avoided two steps by finding one that fitted
everything. Here there is no such step. The experiment shows what the store does with that.

## Arm and test

**Learn:** 12 worked examples per seed: "+", "−", "×" one digit, then three long-multiplication first rows, then "+",
"−", "×" one digit again, then three more long first rows. The long pages are as C156's (first row only: the top
number times the multiplier's units digit). 10 seeds.

Test, per seed: whatever the store gives from "=", in one circuit, on 20 sums per length (3 to 5 digit top numbers) of
each kind: long first rows (two-digit multiplier as on paper), "×" one digit, "+" and "−".

## The ledger

**Given:** as C156, plus the hold architecture (pick-up at the start, held value, gates into the slot) and varied
replay in the proposer. **The engine:** as C156, plus picking up, holding and using held values.

## Predictions (fixed before running)

1. **Long pages pick the hold.** The first long page fails recall and replay, as in C156, and is settled by varied
   replay: the C155 step with its second read (the bottom digit, the multiplier) **held**, under the Π link. Search is
   never needed.
2. **The hold step also fits single-digit multiplication,** where holding the multiplier works as well as passing it
   on, but **never fits an addition or subtraction**.
3. **The store can't give both.** It now holds a read step (bound by additions, subtractions and single-digit
   multiplications) and a hold step (bound by long rows and, once recalled, by single-digit multiplications), rivals
   from the second part on. Whichever has more copies at the time is recalled, and the other kind of sum fails. **In
   no seed are all four kinds right at the end.** Which one wins, or whether they tie, depends on the counts. I won't
   guess that, beyond expecting it to flip as the examples alternate.
4. If so, the indication is that this procedure needs **two steps, each recalled in its own situation**: the first real
   need for something that picks a step by what's on the page, and the question of states in its plainest form.

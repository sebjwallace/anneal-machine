# C158 · Only the parts it uses: hypothesis

Follows [C157](../C157-holding-a-value/findings.md). There, long-multiplication rows picked a step that holds the
multiplier in mind for the whole row instead of reading it every column. But the store never gave that step back.
Once the multiplier is held, the step's pass-on (writing a digit on to the next column) does nothing, so every long row
bound the hold step in dozens of versions that differ only in that useless part. Each version was equally supported,
they tied for ever, and a tie gives nothing.

## The idea

**Let a step leave out parts it doesn't use, and add no rule preferring the smaller.** Wherever a step is tried (in
replay, in varied replay, in search), it is also tried without its pass-on, without its sign write, and without both.
Whatever settles binds itself, as always, and copies count, as always.

Why that should be enough. A lean frame without a useless part explains everything the bloated versions explain, and
it is one structure, so it collects all the repetition while they split theirs. It should outcompete them. A part that
does matter somewhere is different: the frame with it explains more of what's been seen than the frame without it, so
it keeps the part. The fewest parts that explain the most should come out of repetition alone.

This removes parts rather than adding a new kind. The one piece of building is that the store and recall now cope with
steps of different lengths, read back by their parts' names.

## Setup

C157's learner and its twelve examples ("+", "−", "×" one digit, three long-multiplication first rows, then the same
again), with the variants above. **4 seeds**, agreed with the owner, since recent runs have behaved alike from seed to
seed. If the seeds disagree, that will be reported as a reason to run more, not run quietly. Test as C157: whatever the
store gives from "=", on long first rows, "×" one digit, "+" and "−".

## The ledger

**Given:** as C157, plus proposing every step with and without each of its last two writes. **The engine:** as C157.

## Predictions (fixed before running)

1. **The hold step comes back as one structure without a pass-on**, and is recalled whenever its copies lead. In
   C157 it was never recalled at all.
2. **The read step keeps its pass-on.** The single-digit multiplications need it, so the full read step outcollects
   the lean one. Single-digit multiplication still works whenever the read step is recalled.
3. **The rivalry is now visible.** The store holds two steps that can't stand in for each other, and gives whichever
   has been bound more (or nothing on a tie). So the store flips between them as the examples alternate, and **in no
   seed are all four kinds right at the end.**
4. **The risk:** if the lean read step (no pass-on) wins instead, single-digit multiplication breaks, and the counting
   isn't as fair as argued above.

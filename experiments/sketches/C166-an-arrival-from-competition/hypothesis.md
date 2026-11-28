# C166 · An arrival from competition: hypothesis

Follows [C165](../C165-a-hand-over-on-an-arrival/findings.md), where a held procedure handed over from one way of
working to the next when the first ran out. The "ran out" (the arrival) was a trick: **code looked at the moment,
noticed that no units digit was there, and switched the Stalled cell on.** That was the one place where code saw
something the memory can't see for itself, an absence. Asked by the owner to sort out risky crutches before going on,
this replaces it with something native.

## The change

The clock's step after phase 5 gets **two alternatives**: carrying on (phase 6) or Stalled. In the engine, two things
that can follow the same thing are rivals. **Carrying on** is backed by phase 5 and a found units digit. **Stalled** is
backed by phase 5 alone. When a digit is found, carrying on has more support and wins. When nothing is found, Stalled
is the only one standing. Absence comes from competition, which is the owner's view of how associative memory says no.
No code looks for absence. The alternatives are part of the clock's fixed structure, declared as architecture.

Everything else is C165's: same frames, procedure, hand-over, arms and sums, run both ways ("code", as C165, and
"competition").

## Predictions (fixed before running)

1. **"Competition" gives exactly C165's results** in every arm: one hand-over per sum with the procedure held, none
   without it, a loop without the sample of A. A right and B copying right in every sum.
2. **Stalled never comes on while a digit is found,** so nothing is cut short. That would show as A or B going wrong.

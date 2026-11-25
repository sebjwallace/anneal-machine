# C147 · Rule B: hypothesis

[Candidate B](../../../docs/theories/candidate-energy-rules.md): **heat lowers the bar around a hot cell, and rival
hypotheses are judged together.** It was blocked because rival hypotheses would blur in one set of fact slots; C146
removed that (lanes: copies of the facts, each fed by its own hypothesis and judged by the engine, 100% at up to 8 at
once, with company counted from the facts only). With the facts in memory (C144), wrong digits rejected by rivals from
place (C145) and lanes (C146), rule B can now be tried.

## The question

**If the hypotheses tried at a hot cell are only those the lowered bar lets open, nearest places first and further only
while heat remains, and they are judged side by side in lanes by the engine, does column addition still learn the same
step from the same short worked examples, and how much is tried?**

## The rule, as built here

- **The bar, by distance.** A read place's distance from the focus is the number of moves to reach it (C141's gates: up,
  down, left, right). The bar starts at distance 1: only read sets whose three places are all within one move can open.
  While the hot cell stays hot after every open hypothesis has been judged and none has explained the example, the bar
  lowers to distance 2, then 3, then 4. **When some hypothesis explains everything, the bar stops lowering.**
- **Judging in lanes.** At each column, every open hypothesis that reaches that column is given a lane (8 lanes). The
  contents of the places around the focus, each lane's three read selectors and the written units digit are routed by
  the engine's gates into the lane's copy of the fact slots, and the lane keeps the written digit or drops it (C146's
  protocol, C145's rivals, company counted from the facts only). More hypotheses than lanes wait for the next batch.
- **Following the heat** as C143's best arm: each hypothesis keeps its own heat; only cool cells explain; a carry is
  explained by a hot cell holding it; explained cells cool; the focus moves to remaining heat; an explanation counts only
  if it leaves no heat.
- **Across examples**, C139's held-open rule as before, and recall of the bound step first (C142).

## Also checked

**The refined rule leaves C145 unchanged.** C145's judging (all 1,000 right and 9,000 wrong written digits), with company
counted from the facts only instead of from everything.

## Arms

- **Rule B** (above), 20 seeds, the same worked examples and test as C142 to C145.
- **C145 for comparison** (C143's search, the units judged by the engine one hypothesis at a time).

## The ledger

**Given:** the lanes (formed beforehand), the content cells, switching on each hypothesis's selectors; **the order of
the bar (by number of moves)**; **lowering it when heat remains and every open hypothesis has failed**: the trigger is
the engine's judgements, but acting on it is the experiment's code; stopping once something explains everything; the
carry check (comparing the recalled tens with the carry cell, as C145); following each hypothesis's heat; the held-open
rule across examples; picking among hypotheses that all explain everything. **Not done here:** competition **between**
lanes choosing the winner. Lanes are kept apart (that is what makes them work), and the pick among explanations that
fit is still the held-open rule. **The engine:** routing, completing the facts, rivals from place, judging every
hypothesis; storing and recalling the step; every move.

## Predictions (fixed before running)

1. **The refined rule leaves C145 unchanged:** 1,000 of 1,000 right digits kept and 9,000 of 9,000 wrong ones dropped.
2. **Rule B learns the same step** as C142 to C145 in every seed (read the carry above and the two digits; units at the
   focus; carry one left in the carry row; move left); **100%** on 4 to 8 digit sums at a new position; every run
   stopping by itself.
3. **The bar stops at distance 3** in every searched example: the true read places (one, two and three rows above the
   focus) need it, and nothing nearer explains a whole example. It never lowers to 4.
4. **Fewer hypotheses tried than C145:** at most half as many hypotheses judged per seed.

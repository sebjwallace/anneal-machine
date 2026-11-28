# C184 · Nothing undone: hypothesis

Written before the run. Date: 2026-11-27. It follows [C183](../C183-residue-with-a-sparse-sample/findings.md) and the
second exchange with the owner ([convergence and the map](../../../docs/theories/convergence-and-the-map.md), section 9).

## The question

In C183, the second row was learned in 2 of 3 seeds. But every seed stuck on the first two worked examples, in a local
optimum: the two changes needed together each made things worse alone, and worse was undone. The owner's view:

- no totals, since a total is averaging;
- no verdicts: a change that causes trouble is kept, and its trouble is where the next change goes;
- the basin already tried fills with heat and pushes you out;
- lateral moves toward a way up, like lightning finding the path of least resistance;
- the best so far isn't sacred.

Does dropping "worse is undone" get the memory out of the local optimum?

## The setup

C183, with one change to the rule: **every change is kept.** There's no comparison with the best and no undoing. The
trouble a change causes heats the parts acting where it happened (residue with a sparse sample, as C183), so the next
part to give way is wherever the heat is now, relative to its convergence. The map rules out going back to any way of
working already tried on this worked example, so the stuck place can't be returned to. The best so far is kept only for
reporting. Same three seeds as C183, and 1,500 attempts per worked example.

## Predictions

1. **Times one digit:** about as easy as before, within about 6 attempts.
2. **The second row:** gets out of the local optimum more often than C183. It settles on more of the first two worked
   examples than C183's none, and learns the right way of working in at least 2 of 3 seeds, 200 of 200 at test.
3. **Risks:**
   - **Drift:** with nothing undone, the way of working can wander away from what was good. That's novelty search's
     risk of diverging without converging, so some examples may run to the limit, with more runs than C183.
   - **The coincidence** may be settled.
   - It may be no better than C183, if heat sends the next change somewhere other than the partner.

## The ledger (planned)

As C183, minus the comparison with the best and the undo. The rule that reads the structure is still the code's.

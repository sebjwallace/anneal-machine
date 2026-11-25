# C148 · More structure wins: hypothesis

The jam has now caused failures in four experiments (C139, C140, C143, C147): once a wrong step is bound, binding the
right step later, even several times, never wins. Recall from "+" brings on both, and the result is read as no answer.
The owner's principle (nothing breaks) is that being wrong is more structure: new structure forms beside the old and
**outcompetes** it, and reinforcement is more supporting structure built up over repeated encounters, not a strength
on a bond. That isn't happening.

## Why it isn't happening (from the engine's code)

1. **Each binding is a separate chain on fresh members.** `declareWord` chooses members round each population, so every
   binding of the step starts from a different member of "+", and the chains never meet. Nothing competes; they all
   run at once.
2. **Even on the same cells, copies wouldn't add up.** If every binding used the same cells (one "+", one cell per
   place, as decision 009 says), the right and wrong chains would start from the same "+" and become rivals. But each
   opening's support is counted on its own, so three copies of the right chain and one of the wrong have the same
   support each, and they tie.

## The change under test

- **The same cells everywhere for the step's parts** (populations of one member, so binding the same step again forms
  exactly the same structure again).
- **Copies count (one change to the engine).** When competing openings are the same structure (same shape, same
  members), they count together: among rivals at the same support, **the structure that exists more times wins**. This
  is counting from the structure itself, not a weight on a bond: a step confirmed three times *is* three times the
  structure of one bound once. A tie remains a tie only when the counts are equal too.

## Parts

1. **A direct probe.** Bind a wrong step once ("read the answer to the right, the bottom and the top digit": seed 17's
   coincidence in C147), then the right step 0, 1, 2 or 3 times, and recall from "+" alone. Three arms: **as before**
   (fresh members per binding, copies not counted); **same cells only**; **same cells, copies count**.
2. **The failures rerun.** C147's rule B, first-run version (the one that failed seed 17), and its "one step further"
   version, with same cells and copies counting. 20 seeds, the same test.

## The ledger

**Given:** as C147. The change: same cells for the step's parts (a declared choice of populations), and the engine's
rule that copies count. **The engine:** everything it did in C147, plus counting copies in competition.

## Predictions (fixed before running)

1. **Probe, as before:** with the wrong step and any number of right ones bound, recall brings on more than one step at
   once: no answer. With only the wrong one: the wrong step.
2. **Probe, same cells only:** with the wrong step and any number of right ones, the rivals tie: no answer.
3. **Probe, same cells, copies count:** wrong once and right once: a tie, no answer. Right twice or more: **the right
   step**. Only the wrong one: the wrong step.
4. **Rule B, first-run version, with the change:** seed 17 recovers. **100%**, 20 of 20 seeds.
5. **Rule B, one step further, with the change:** unchanged, 100%.
6. Every other seed learns the same step at the same example as in C147.

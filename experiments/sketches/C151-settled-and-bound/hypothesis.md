# C151 · Settled and bound: hypothesis

Follows [C150](../C150-learning-in-the-circuit/findings.md), where the circuit learned column addition by running
candidates over worked examples, with no separate checker. Four things were still the experiment's: proposing
candidates, reading off "no heat left", choosing among ties, and binding the winner. This sketch moves the middle three
into the circuit.

## The changes

- **Heat and cooling as the circuit's own cells.** The write place is attended a phase earlier, so its written content
  is on when the write happens. An **agreement gate** {write place, value, the same written content} switches on a Cool
  cell for that place, held while the clock runs. **The clock only goes round again if the units place at the focus
  was cooled,** so a misfit stops the lane where it happens.
- **Settled.** The encoder declares the example's working as heat: one gate per lane whose key is every working cell
  cooled, opening a **Settled** cell. A lane settles only if it cooled every cell of the working.
- **Binding as a rule of the architecture.** When a lane's Settled cell is on, the binding rule binds that lane's step
  to "+" in a long-term **program store** (C148's form: same cells every time, copies counting). No code decides it.
- **No held-open rule.** Every lane that settles binds itself, in every example, including a recalled step that settles
  the next example (recall as confirmation). **What has been learned is whatever the store gives from "+"**: the
  structure bound most often wins (C148), and equal counts tie.

Candidates are proposed as in C150 (stage A by rule B's order, then stage B), and the test is C149's circuit with the
store's step. A smoke test on one seed was run while building, before this hypothesis.

## Arms

As C150: **learn**, and **learn from sums without carries**. 20 seeds each.

## The ledger

**Given:** the encoder (worked examples written in full, and declaring their working as heat); the circuit's fixed
architecture, including the agreement gates, the clock that stops on a misfit, the Settled gate and the binding rule;
proposing candidates (stages A and B); reading stage A's cooled units from the engine's moments; moving the store's step
into C149's circuit for the test. **The engine:** running every candidate, cooling, stopping on a misfit, settling,
binding into the store, and recalling from the store with copies counting.

## Predictions (fixed before running)

1. **Learn:** the store gives the right step in every seed, by the second or third example (when the true step has
   settled more often than any coincidence), and every later example is settled by recall.
2. **Learn, test:** 100% at 4 to 8 digits, every run stopping by itself.
3. **Without carries:** the two explanations C150 found ("read the carry above" and "read the carry to the left") both
   settle every example, so both are bound equally often and the store **ties: no step, 0% at test**, in every seed.
   Unlike C150, where distance quietly broke the tie, nothing here chooses between explanations the evidence can't
   tell apart.

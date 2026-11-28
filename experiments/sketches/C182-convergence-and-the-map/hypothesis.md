# C182 · Convergence and the map: hypothesis

Written before the run. Date: 2026-11-27. Builds the design settled with the owner in [convergence and the
map](../../../docs/theories/convergence-and-the-map.md), including residue heat (section 5a).

## The question

C181's energy layer churned. The owner and the assistant then agreed a design:

- no strength: a part holds by convergence;
- one change at a time;
- three outcomes, with "no change" riding along;
- no tracing back;
- every attempt forms structure, a goal-agnostic map;
- heat tilts the landscape, with no fixed bar;
- residue heat bound to its context.

Built as far as it can be in structure, does it learn the two lessons without churning?

## The setup

C181's harness (one memory replayed through its earlier lessons; times one digit from adding; the second row from times
one digit; tests from the start), with a new arm, `mapRule`.

### What persists between attempts, all as structure in the substrate

- **The map:** each attempt's way of working is a frame cell in the substrate (as before), now marked with a context
  cell for the worked example.
- **Residue heat:** when heat arises, the parts acting at that moment are marked "Hurt" in this context. "Acting" is
  C180's blame:
  - a write whose writing didn't cool;
  - the reads, sign, holding and move, when a wrong digit landed on the working;
  - a read of an empty place where the work stopped.

  It's marked each time it arises, so residue builds up.
- **Convergence:** each place that cools marks every part that was on, with that place and context. The same mark is
  never formed twice, so it counts distinct example-and-place pairs, never repeats. Convergence counts across all worked
  examples.

The marks are inert assemblies: their keys are never on together in a run. So the substrate holds them, but its running
dynamics don't use them yet.

### The rule that reads the structure (the code's: small, fixed, declared)

1. **The part that gives way** is the one most heated relative to what has converged on it: its residue in this
   context, less its convergence. Only parts with some residue count. One per attempt, with ties by a fixed order.
2. **Its alternatives are tried nearest first.** Holding or not, and the move's direction, count as nearest. An
   alternative is skipped if it carries residue in this context (the slimy rock), or if it would give a way of working
   already on the map here. Writes move only to places of the working still to be done, and reads only to places
   holding something, as before.
3. **Outcomes:**
   - better: kept as the best state;
   - no change: rides along as the current state;
   - worse: the best state so far comes back.
4. Each worked example has a limit of 1,500 attempts. If no part with residue has an alternative left, it's stuck.

**Context is the worked example** (declared: narrow, so residue doesn't carry from one worked example to the next).

**Gone from the code since C180:** the heat levels and the "already tried" marks (now residue and the map, in the
substrate), the reach schedule, and the pairs fallback. **Still the code's:** the reading rule above, practising, blame,
and comparing an attempt with the best.

## Predictions

1. **Times one digit:** within 5 attempts. The stall blames the read of an empty place. That read has the most residue
   relative to its convergence, and holding at the same place is its nearest alternative.
2. **The second row: settles, without churn.** It changes one part per attempt, and states that make things worse are
   replaced by the best. Expected 100 to 800 attempts in all, and 200 of 200 at test if the right way of working is
   settled.
3. **Pairs:** where two parts must move together, the first move rides along if it makes no difference. But if it makes
   things worse, it's undone, and the pair may never be found. That's the main risk of getting stuck.
4. **The coincidence:** it may be settled on the first example and corrected later, as with greedy.

## The ledger (planned)

As C181, with the marks (map, residue, convergence) as structure in the substrate, and the reading rule as the code's.

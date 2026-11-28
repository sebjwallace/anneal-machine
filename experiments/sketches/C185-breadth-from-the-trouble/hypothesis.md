# C185 · Breadth from the trouble: hypothesis

Written before the run. Date: 2026-11-28. It follows C183 (worse undone: stuck in local optima, the second row in 2 of 3
seeds) and C184 (nothing undone: drifted, 0 of 3). It also follows a third exchange with the owner. Running off and
never returning was depth-first. Returning to the best and trying only single changes was breadth-first one step deep,
too shallow to reach a pair. The balance is logical, not a midpoint: breadth-first, anchored at the best, widening
from the trouble, nearest and most relevant first.

## The question

Keeping what worked (one change at a time; the map; residue with a sparse sample; convergence; slimy rocks), can an
anchored, widening search reach the pair the second row needs, without getting stuck or drifting?

## The setup

C183's harness and structure (the same three seeds, run one at a time so each seed's samples don't depend on the
others), with the loop replaced:

- **Anchored:** every attempt starts from the best so far.
- **Which parts take part:** those whose residue is felt in the best state's situation (heat, as structure), as before.
- **Candidates:** one change to one such part, or two changes to two such parts. Each is a nearest-first alternative as
  in C183, skipping slimy rocks and anything already on the map. They're ordered by how far they reach in all (the sum
  of the moves' distances), with a single before a pair on a tie. Pairs are generated only once no single change within
  a reach of 2 is left: **the widening.** The ordering is the code's (declared).
- **No totals:** the best so far is replaced only by an attempt that cools every place it cooled, and more. That's
  judged by inclusion, the places themselves, not a count.
- Every attempt still forms the map, residue and convergence. 1,500 attempts per worked example.

## Predictions

1. **Times one digit:** within about 5 attempts in every seed. Holding is a single change at a reach of 1.
2. **The second row: learned in all 3 seeds,** 200 of 200 at test. Single changes take it to the local optimum as before.
   Then the pair (the answer write and the carry read together) is reached once the widening opens pairs, instead of
   sticking (C183) or drifting (C184). Expected 200 to 1,500 runs a seed.
3. **Risks:**
   - **Inclusion may be too strict.** A right change that breaks a place cooled only by coincidence never covers the
     best, so the anchor can't move past a coincidence.
   - **Pairs are many,** so some examples may hit the limit.
   - **A pair that cools everything plus more may be a coincidence,** learned and corrected later.

## The ledger (planned)

As C183, with the anchored, widening loop and the inclusion test. **Still the code's:**
- the candidates' ordering and the widening;
- practising, blame, and the inclusion test.

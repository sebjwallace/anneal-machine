# C183 · Residue with a sparse sample: hypothesis

Written before the run. Date: 2026-11-27. It follows [C182](../C182-convergence-and-the-map/findings.md) and the owner's
two ideas in [convergence and the map](../../../docs/theories/convergence-and-the-map.md), section 5b.

## The question

In C182, residue heat bound to the whole worked example barred the two changes the second row needed. Each had been
tried once in the wrong company, made things worse then, and was never allowed back. The owner's ideas:

1. residue sits between too specific and too generic, and generalises by convergence;
2. a sparse sample of the situation keeps it loose.

With residue bound like that, does the second row become learnable while times one digit stays easy?

## The setup

C182, with residue changed:

- **A mark of residue** binds the part at fault with a sparse sample of its situation. The situation is the worked
  example's context cell and the other six parts in play. The sample is **2 elements, chosen at random** (seeded). The
  size is a knob, and the randomness is new here; both are declared.
- **Residue is felt** only where a situation contains a mark's sample. A part that hurt with one companion isn't
  affected where that companion is absent. A part that hurts in many situations gathers marks with different samples,
  and comes to be felt nearly everywhere: generalising by convergence.
- **A slimy rock bars a change** only if the residue felt in the new situation outweighs what has converged on the
  alternative (C182 barred on any residue). So a wrong bar can be outweighed.
- **The part that gives way** is as C182: residue felt in its current situation, less its convergence.
- Everything else as C182: the map, convergence, one change at a time, no change rides along, worse brings back the
  best.
- **Three seeds,** since the sample is random.

## Predictions

1. **Times one digit:** within about 5 attempts in every seed, as C182.
2. **The second row:** settles in at least 2 of the 3 seeds, because the needed changes can now be tried again in
   different company. Expected 100 to 600 runs a seed, and 200 of 200 at test where the right way of working is
   settled.
3. **Risks:**
   - **A sample missing the companion that mattered:** the bar then bleeds into the right company. It can be outweighed
     only if the alternative has converged structure, which a change never yet part of a success doesn't have. So some
     seeds may still stick.
   - **Too little residue:** if the samples rarely match, old mistakes get repeated, and runs go up.
   - **The coincidence** may be settled first, as with greedy and B.

## The ledger (planned)

As C182. **Changed:** residue bound with a sparse random sample of its situation, and the bar weighed against convergence.
**Added:** the sample size and its randomness (declared).

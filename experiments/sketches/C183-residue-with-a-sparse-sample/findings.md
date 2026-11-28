# C183 · Residue with a sparse sample: findings

Run: `node heat.js > out.txt` (about six minutes, three seeds). Read [the hypothesis](hypothesis.md) first, written before
the run.

## In short

**With residue bound to a sparse sample of its situation, the second row was learned in 2 of 3 seeds**, right, 200 of 200
new second rows from the start, in 154 and 196 runs. The third seed stuck on all four worked examples (307 runs, 0 of 200).
Times one digit stayed easy in every seed (11 or 12 runs, 200 of 200). There was no churn, and no coincidence was learned
on the way. When it settled, it settled the right way of working.

**How it got there.** In every seed the first two worked examples still stuck one step short, as in C182. On the third
worked example (905 × 79), in seeds 2 and 3, the carry read moved to the right place and that alone cooled more. Its
earlier residue had been formed with samples that weren't present in the new situation, or was outweighed. Then the last
change, the answer write or a second carry-read step, settled the page. The fourth example was recalled and settled
first time. Seed 1 never found that opening: its samples kept the carry read's residue felt in the situations where it
was needed.

**What this says.** Binding residue loosely, to the part at fault and a sparse sample of its situation, is what let a
change that hurt in the wrong company be tried again later. That's the owner's slimy-rock principle with his sparse
sample, and it made the difference between C182 (never) and here (2 of 3). But the pair problem isn't solved by the
dynamics yet. In every seed, the first two examples stuck because the two changes needed together each made things
worse alone, and "worse" is undone. Success came when a page happened to let one half show an improvement by itself. So
learning depends on meeting the right example, which is real, but not yet reliable.

## Results

| | times one digit (runs) | second row (runs) | second row test (200 new, from the start) |
|---|---|---|---|
| seed 1 | 12 | 307 (stuck on all four) | 0 of 200 |
| seed 2 | 12 | 154 (stuck, stuck, settled on the third, recalled on the fourth) | **200 of 200** |
| seed 3 | 11 | 196 (stuck, stuck, settled on the third, recalled on the fourth) | **200 of 200** |
| C182 (residue bound to the worked example) | 12 | 203 (stuck on all four) | 0 of 200 |
| C180 (heat kept by the code) | 14 | 341 | 200 of 200 |

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | times one digit within about 5 attempts, every seed | **Holds** (3 or 4 attempts). |
| 2 | the second row settles in at least 2 of 3 seeds; 100 to 600 runs; 200 of 200 where right | **Holds:** 2 of 3; 154 and 196 runs; 200 of 200. |
| 3 | risks: a sample missing the companion that mattered (some seeds stick); too little residue; the coincidence | **The first came true in seed 1.** The coincidence didn't appear. |

## The ledger

As C182, with residue bound to the part at fault and a sparse random sample of 2 elements of its situation (seeded, a
knob, declared), and a bar weighed against convergence. **In the substrate:** the map, residue and convergence, as
structure. **The code's:** the reading rule, practising, blame, and the comparison with the best.

## What it shows

The owner's refinement works where C182 failed. Loose, sampled residue lets a past mistake stop being a mistake in
different company, and learning then succeeds, in 2 of 3 seeds. What's left is the pair: two changes that only help
together. One change at a time, with "worse" undone, can't find a pair unless a page lets one half show its worth
alone. Next is how the substrate should hold a change that made things worse, but only because its partner wasn't there
yet.

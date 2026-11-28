# C187 · The final adding: findings

Run: one arm-seed at a time, `ARM='hubs by relation (seed N' node heat.js > out-hubsbyrelationseedN.txt`, and the same
for `no hubs` (about three minutes each). Diagnostic, added after the run: `DIAG=1 ARM='no hubs (seed 1' node heat.js`
([diag.txt](diag.txt)). Read [the hypothesis](hypothesis.md) first, written before the run. Build check:
[sanity.txt](sanity.txt).

## In short

**The stress test failed. The final adding wasn't learned in any arm or seed, with hubs or without** (0 of 200 in all six).
The relational abstraction that carried the second row didn't reach this lesson.

**Why.** The start brought up the adding way of working, the right one to start from (the "+" in view). But the final
adding is adding turned upside down. Adding reads the two numbers just above where it writes. The final adding reads two
rows that are three rows apart and writes the sum two rows below the lower one. From adding, five of its eight parts must
move, most of them a long way (four to seven rows). And of the relations between parts, almost none are the same: only
the carry written one left of where it's read, and the sign written along beside where it's read. So the hubs had almost
nothing true to complete with, and the most widely shared relations (adding's own: the reads just above the answer)
pulled parts to the wrong places. The anchored search, limited to single changes and pairs, used up everything within
reach in 20 to 100 attempts per example, with only up to 6 places ever cooling.

**What it says about the abstractions.** They generalise exactly as far as the relations that are really shared. The
second row shares most of its relations with what came before, so it was carried. The final adding shares almost none
at the level they're held: exact offsets. **The hubs are too specific.** A relation like "the carry read is three rows
above the answer" is exact. What adding and the final adding share is fuzzier: the answer goes below what's read, the
carry sits between, moving left after each column. That's the owner's point about sparse, fuzzy assemblies: specific
enough to point, loose enough to bleed into similar situations. The hubs here hold exact offsets, so they can't bleed.

## Results

| arm | seed | second row (background, runs) | final adding (runs) | test: final adding (200 new) | test: second row (200 new, after) |
|---|---|---|---|---|---|
| no hubs | 1 | 291 | 226 | 0 | 200 |
| no hubs | 2 | 140 | 244 | 0 | 17 |
| no hubs | 3 | 338 | 246 | 0 | 200 |
| hubs by relation | 1 | 291 | 258 | 0 | 200 |
| hubs by relation | 2 | 140 | 264 | 0 | 17 |
| hubs by relation | 3 | 338 | 243 | 0 | 200 |

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | the start brings up adding | **Holds** (diagnostic). |
| 2 | both arms find it harder than the second row | **Holds, far harder:** not learned at all. |
| 3 | hubs by relation better than no hubs, 2 of 3 against 0 or 1 | **Fails:** both 0 of 3. |
| 4 | the second row stays right | **Holds where it was learned** (seeds 1 and 3: 200 of 200). In seed 2 the background second row was only 17 of 200 (below). |
| 5 | risks: completion misleading; coincidence; everything stuck | **Everything stuck.** |

## Disclosed

- **Two wiring mistakes before any run** (the results table used before it existed, then dropped entirely). Each crashed at
  once, so no results were produced or discarded.
- **Seed 2's background second row differs from C186's.** Here the earlier lessons are learned by C176's rule, so the
  second row's random samples start at a different count than in C186 (where times one digit used the same rule as the
  second row). In this run it settled a coincidence on its last example and tested 17 of 200. It's the same in both arms,
  so the comparison stands.
- The diagnostic was added after the run, and changes nothing.

## The ledger

As C186, with the final-adding lesson page (the encoder: the "+" placed, the first row's signs left off) and "+" signs
readable.

## What it shows

Relational hubs carry a new lesson only as far as the relations it truly shares with what's known, at the grain the
relations are held. Exact offsets are too specific to reach a lesson laid out differently. The next question, from the
owner's own ideas about fuzziness and sparsity, is whether relations held more loosely (below, above, beside, between)
let the abstraction reach further.

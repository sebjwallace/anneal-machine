# C82 · Rebinding a variable: findings

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after development seed 1. Output: `out.txt`; side check:
`house-and-shed.txt`. Serves: CTR-1 CAP-4 (binding what happens together), CON-1 (energy: structure that doesn't fit
should go), OPZ-3 (minimality); CTR-2 CON-2, CON-7.

## Results (pooled over five seeds, 1,000 rebindings each; probes after every rebinding)

| | exactly the current value | values per probe | completing segments, start → end | links per rebinding |
|---|---|---|---|---|
| core, never shared | 0-1% | 9.7-10.0 | 111 → 116 | 1.0 in quarter 1, then 0 |
| **loosen, never shared** | **100%** in every quarter | 1.00 | 44 → 44 | 12.0 every quarter |
| core, shared freely | 0-1% | 9.7-10.0 | 112 → 116 | 1.0, then 0 |
| loosen, shared freely | 90-91% | 0.90-0.91 | 43 → 44 | 12.0 every quarter |

In loosen, shared freely, every failed probe (961 of 961) came after the other variable had been bound to this one's
value. No probe grew or cut anything, in any arm.

## Predictions

| | prediction | result |
|---|---|---|
| P1 | loosen, never shared: exact ≥ 99% every quarter | **Holds:** 100%. |
| P2 | loosen: segments flat (within 10%), links per rebinding steady (within 10%) | **Holds:** 44 → 44 and 43 → 44; 12.0 throughout. |
| P3 | core: exact ≤ 5%, ≥ 9 values per probe from quarter 2 | **Holds:** 0%, 10.00. |
| P4 | loosen, shared: ≥ 5 points below never shared; ≥ 95% of failures after the other took the value | **Holds:** 9-10 points below; 100%. |
| P5 | no probe changes structure | **Holds:** 0. |
| P6 | loosen never brings back two values | **Holds:** ≤ 1.00. |

## Side check: a whole made once from known parts (not preregistered)

"AB", "CD", "ABCD" (tied from "AB" and "CD"), then "ABEF":

| | "ABC" brings back | "ABE" brings back |
|---|---|---|
| core | "D" | "F" |
| loosen | "EF" | "F" |

With the change, "ABCD" is forgotten the moment "ABEF" arrives. "AB" brought back "CD", the input had its own remainder
("EF"), and "AB" and "CD" were each held on their own, which is exactly the condition for loosening. All 16 of the
core's tests still pass on the loosened copy, because none of them checks "ABCD" after "ABEF" when "ABCD" was built from
known parts. (The "ABC" probe was itself partly new, so it tied a fresh "C" cell. That is why "AB" alone later brings
back "C1".)

## What it means

- **Unbinding works, and it's cheap.** A variable rebound a thousand times brings back exactly its current value every
  time. Structure doesn't grow: each rebinding ties one joint (12 links) and loosens the old one. The heat that drives
  it is read from the moment itself (a joint bringing back what the input has replaced), with no signal set by hand.
- **The core keeps every binding forever,** so "x" alone brings back all ten values. Its structure is flat here only
  because ten values give just 20 possible pairs. With an open set of values it would keep growing.
- **The rule is symmetric, and binding isn't.** A variable holds one value, but a value can belong to many variables.
  Nothing in the structure says which side is which, so "y = 1" breaks "x = 1". This is the 9-10% lost when values are
  shared.
- **It can't tell a fast bond from a lasting one.** "ABCD", built from parts and seen once, is a whole in the same way
  "x = 3" is, so it is forgotten as easily. This is what C83 asks about: whether a bond seen many times should resist.

## Violations (CTR-2 CON-7)

- **Given by hand (CON-2):** the inputs and their order; a blank before every input, so that no transitions are learnt
  (they would grow with every moment and are not what this asks about); which columns are a variable and which a value
  (each its own three columns).
- **The change itself** is a proposed rule, not in any reference model: RM-8 leaves a composition of the two pieces
  alone. It is unconditional, like every growth and cut in the core (no energy rule, RM-9).
- **Measured by our code:** which values are brought back is read by the experiment from the moment's report. The
  volume never reads it.
- No bookkeeping in the engine: the loosening reads the same cells and segments the cut does.

## Words (CTR-2 CON-5)
"Joint" (the segments that hold a whole's parts together), "loosen" and "harden" are this experiment's words, not yet
agreed. "Variable" is used in its arithmetic sense ("x" holding a value), close to but not the same as the glossary's (a
place in a frame).

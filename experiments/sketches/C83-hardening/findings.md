# C83 · Hardening by repetition: findings

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after development seed 1. Output: `out.txt`. Serves:
CTR-1 CON-9 (no strengths: hardness made structural), CAP-11 (two kinds of memory), CON-1; CTR-2 CON-2, CON-7.

## Results

**The race** ("x 3" k times, then "x 5" five times; does "x" alone still bring back "3"?):

| k | core | loosen | harden |
|---|---|---|---|
| 1 | 100% after every clash | 0% | 0% |
| 2 | 100% | 0% | 60% (3 of 5 seeds), unchanged over all five clashes |
| 3-5 | 100% | 0% | 100%, unchanged over all five clashes |

"5" was brought back after every clash in every arm. Completing segments before the clashes: core and loosen 13 at every
k; harden 13, 17, 21, 25, 29 (four per repetition), and growing by about 3 per clash after (each "x 5" seen again is
hardened too).

**House and shed** ("AB", "CD", "ABCD" k times, then "ABEF"):

| k | "ABC" brings back "D": core | loosen | harden |
|---|---|---|---|
| 1 | 100% | 0% | 0% |
| 2-4 | 100% | 0% | **100%** |

"ABE" brought back "F" in every arm at every k.

**The core's tests on the harden copy:** 15 of 16. Test 9 ("the Z again, nothing grows") fails by design: hardening is
growth on a repeat.

## Predictions

| | prediction | result |
|---|---|---|
| P1 | race, loosen: 3 never brought back after a clash | **Holds:** 0% at every k. |
| P2 | race, harden: k = 1 gone ≥ 80%; k ≥ 4 kept ≥ 80% | **Holds:** 0% kept at k = 1; 100% kept at k = 4, 5. |
| P3 | race: 5 brought back after every clash, every arm | **Holds:** 100%. |
| P4 | race, harden: kept at the first clash means kept at the fifth | **Holds:** every row constant across the five clashes. |
| P5 | house: core ≥ 80%; loosen ≤ 20%; harden ≤ 20% at k = 1, ≥ 80% at k ≥ 3; "ABE" ≥ 80% everywhere | **Holds.** |
| P6 | harden: segments before the clashes rise with k; core and loosen flat | **Holds:** 13 → 29 against 13 throughout. |

## What it means

- **Repetition does protect a bond, with no strength on any segment.** A bond seen once breaks at the first clash. Seen
  three or more times, it survives. The house built from parts, seen twice, now survives the shed, which loosening alone
  could not manage (C82).
- **But a bond is heated once, not worn down.** I expected each clash to take a segment, so that "x 3" five times would
  last five clashes. It doesn't work that way. From the second "x 5" on, "x" and "5" are a whole wholly seen, the old
  "x = 3" loses to it by share (RM-5), so it is never brought back and never heated. Whatever survives the first clash
  is kept for good, and "x" then brings back both values. That is right for the house and shed, which should both last.
  It is wrong for a variable, which should end up holding one value. So the race the owner described, where whichever
  is seen more wins, does not happen here.
- **Why k = 2 is a coin toss.** A re-tie picks its handle cells afresh, so the extra segments don't always land on the
  cells the first tie used. Where they don't, every cell holds one spanning segment, and loosening takes them all.
  Hardness here depends on where the segments land as well as how many there are.
- **The price is structure.** Every repetition of a whole adds about four segments, without limit. That is the
  unconditional growth RM-9 is meant to stop: here a bond keeps paying in links for being seen, whether or not it needs
  to be any harder.

## Violations (CTR-2 CON-7)

- **Given by hand (CON-2):** the inputs, their order and the counts k; a blank before every input (no transitions).
- **A declared reading:** a whole's parts are read from each cell's first completing segment (the part it was first
  tied into). The order of a cell's segments is used as structure. It is not in any model, and it reads the innermost
  parts, not the ones a nested whole was tied from.
- **Both changes are proposed rules,** unconditional (no energy rule, RM-9), on top of a copy of the core.
- **Measured by our code:** what is brought back is read from the moment's report.

## Words (CTR-2 CON-5)
"Joint" (the segments that hold a whole's parts together), "loosen" and "harden" are this experiment's words, not yet
agreed. "Variable" is used in its arithmetic sense ("x" holding a value), close to but not the same as the glossary's (a
place in a frame).

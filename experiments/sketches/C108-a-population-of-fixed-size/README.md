# C108 · A population of fixed size

C107's local check, with each piece pricing its uses by a population of fixed size N (picking one out of N), so it
knows how crowded memory is without anything being added up. Run at nine sizes, from 8 to 1024. Contrary to the
prediction, the cuts barely change from N = 24 to N = 256 (more than a factor of 10), and the total stays within 1.4%
of the global total's, because a pointer's price grows only with the logarithm of N. It breaks only at the ends: too
small and the population fills with whatever came first; too large and too little forms. So N behaves as an
architectural constant, not a tuned parameter, as long as there is plenty of room.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `population.js`, plain JavaScript, no dependencies (its shared code is copied from C107's `local.js`). Run:
  `node population.js` (add `steps` to print every step).

# C123 · The engine reads a buffer

The solution from C106 to C121, put into the engine copy from C122. The engine reads each sentence whole
(`readBuffer`: the cheapest description by the states it holds) instead of one letter a moment. What nothing explains is
annealed into the engine's own states, transitions and members, with the energy rule. The results match the sketches
(C118) within 3 points on both books. *Buster Brown*: 63% clean, 71% coverage, cuts at word boundaries 47% (chance
25%). *Alice*: 54% clean, 75% coverage. It cools from about 85% of letters unexplained to about 27%. Members per letter
make no difference. C122's failure was reading one letter a moment, not the engine's structures. The copy still
matches the Go engine everywhere else (`check/check.sh`).

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C122's copy plus `readBuffer` and speed indexes; changes and departures listed at the top) · `check/`
  (the check against the Go engine) · `buffer.js` (the experiment). Plain JavaScript; the check needs Go. Books:
  `gutenberg.zip` from `github.com/nltk/nltk_data` (`packages/corpora`), unzipped. Run:
  `node buffer.js <folder> carroll-alice.txt 8`.

# C128 · No search limits

Distillation D-03, step 1. C127's learning chose an anneal partner only among the 40 held pieces sharing the most
three-letter runs with a hot stretch, and stopped annealing 30 levels deep: two numbers chosen for speed. With both
removed, energy changes by 0.2% and every reading measure is the same or a point better, on both books. The limits did
nothing but save time, and weren't needed for that either. V7 is removed.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (as C127) · `check/` · `limits.js`. Needs `gutenberg.zip` from `github.com/nltk/nltk_data`
  (`packages/corpora`), unzipped. Run: `node limits.js <folder> carroll-alice.txt 8`.

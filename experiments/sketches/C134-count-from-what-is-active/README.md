# C134 · Count from what is active

Distillation D-03, V4. The energy rule's count of the held patterns containing a new piece no longer uses a
three-letter index over all of memory. It counts only what is in front of the machine: the two wholes being compared,
and the held chains this reading saw running over the letters. Neutral energy is slightly lower than with the index
(−0.7% on *Buster Brown*, −0.2% on *Alice*), and reading is within two points.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (as C133) · `check/` · `count.js`. Needs `gutenberg.zip` from `github.com/nltk/nltk_data`
  (`packages/corpora`), unzipped. Run: `node count.js <folder> carroll-alice.txt 8`.

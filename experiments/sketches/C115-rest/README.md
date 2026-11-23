# C115 · Rest

C114 with a rest phase: every 100 or 400 utterances, the pieces formed since the last rest are compared with the other
held pieces, the same way utterances are. Rest adds a few points of coverage (4 to 6), but doesn't clean the pieces
(flat or down by up to 3 points). C114's slips (`[tthing]`, `[denyi]`) are still read, though rest has formed the
clean pieces beside them. The slips are a reading problem: the cheapest description takes one use of `tthing` over a
letter and a use of `thing`. The next question is how overlapping pieces compete in reading, now that most candidates
are clean.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `rest.js`, plain JavaScript, no dependencies (C114's `differentiate.js` with rest added). Needs `gutenberg.zip` from
  `github.com/nltk/nltk_data` (`packages/corpora`), unzipped. Run: `node rest.js <folder>`.

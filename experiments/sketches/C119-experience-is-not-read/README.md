# C119 · Experience is not read

C118 with raw experience (wholes or hot gaps) kept apart: compared with, never read with, so that only pieces derived by
comparison and kept by the energy rule are used in reading. It failed. The clean share barely moved (−3 to +9 points),
while coverage, whole words and the overall cuts all fell back. The bad pieces now come from comparison itself:
shared runs that really do recur but don't sit at word boundaries (`atter` from "hatter" and "matter", `esaid` from
"alice said" and "he said"). C118's arrangement is the better one. What's left is a limit of comparing letters, and it
raises the question of what the scoring should count as good.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `apart.js`, plain JavaScript, no dependencies (C118's `heat.js` with experience kept apart). Needs `gutenberg.zip`
  from `github.com/nltk/nltk_data` (`packages/corpora`), unzipped. Run: `node apart.js <folder>`.

# C127 · Spelled pieces

An audit after C126 found that the engine copy's reading, since C123, had treated every held state as a piece. That
included compositions, which anneal builds from about half of each part's members, and long words whose repeated
letters had been dropped. Their letters spelled strings that never occurred, such as "hape" and "saidin": 98 of 1,357
held patterns in *Buster Brown*, about 13% of the letters held. Fixed from the engine's own structure: a state is a
piece only when a chain spells it, and the piece's text is that chain's letters. A stretch seen again is now credited
once, as the piece, not also as its letters. Phantoms fall to zero. Energy falls 8 to 12%, mostly because of what is
now counted. Reading on unseen text barely moves, so C126's conclusions stand, though *Buster Brown*'s reading figures
were a little flattered (words whole 46% to 43%).

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C125's, with spelled pieces) · `check/` · `spelled.js`. Needs `gutenberg.zip` from
  `github.com/nltk/nltk_data` (`packages/corpora`), unzipped. Run: `node spelled.js <folder> carroll-alice.txt 8`.

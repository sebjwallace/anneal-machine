# C126 · Seen again

An audit after C125 found the twin of the "the" problem. A hot stretch was stored again as new raw experience even
when its letters were already held (`it` 204 times, `to` 196 in *Alice*), so short words never became familiar. Fixed
here with anneal's own reuse first: a hot stretch already held is counted as seen again, not stored again. The energy
rule now counts each different pattern once, and the agreed yardstick (energy = memory + the cost of describing unseen
text) is reported. Repeats fall from thousands to single figures, and memory holds 60 to 69% fewer assemblies. Energy
falls by 16 to 17%, though unseen text costs 1 to 2% more per letter. Loose letters on unseen text fall to 8 to 10%,
and half of all words in *Alice* are read whole (50%), with 56% of cuts at word boundaries: both the best so far.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (as C125) · `check/` · `seen.js`. Needs `gutenberg.zip` from `github.com/nltk/nltk_data`
  (`packages/corpora`), unzipped. Run: `node seen.js <folder> carroll-alice.txt 8`.

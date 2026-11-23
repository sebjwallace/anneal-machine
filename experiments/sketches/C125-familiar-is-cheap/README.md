# C125 · Familiar is cheap

Since C106, using a held piece cost about 4 letters whatever it was, so "the" (3 letters) was cheaper read loose than as
its own assembly. A learnt "the" was never used on its own, and caused heat every time. Fixed here with the standard
principle that the cost of using something is how surprising it is: familiar letters and pieces are cheap, rare ones
dear, with uses counted from the structure. With that, "the" is read inside a piece 98 to 99% of the time, mostly as
`the` itself, and costs about 1 letter. Heat on unseen text falls from about 27% to about 15%. Words read whole rise to
37 to 44%, and cuts at word boundaries to 53%, both the best so far. The pieces are shorter, mostly reusable parts
(`hat` + `ter`, `anxious` + `ly`, `noth` + `ing`), so the strict clean share falls to 35 to 37%. Dropping the flat
placement charge alone lowers heat but doesn't fix "the".

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C123's copy, with readBuffer able to price each letter and piece) · `check/` · `familiar.js`. Needs
  `gutenberg.zip` from `github.com/nltk/nltk_data` (`packages/corpora`), unzipped. Run:
  `node familiar.js <folder> carroll-alice.txt 8`.

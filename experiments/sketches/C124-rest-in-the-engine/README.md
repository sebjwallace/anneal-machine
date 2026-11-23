# C124 · Rest in the engine

C120's rest (split held patterns against each other, keep a part only if it makes memory cheaper) put into the engine
copy as `restSplit`, and run with C123's learning on *Alice* at two link prices. Rest adds almost nothing: 43 parts and
−0.3% energy at a link of 4.0, 14 parts and +0.3% at 2.3. `atter` isn't formed at either. Annealing already splits
every hot stretch and its partner into what they share and what varies, so little is left for rest to find. The link
price is what changes the results. At 2.3 the engine reads 86% of the text and 36% of words whole (the most of any
run), but its pieces are much less clean (31% against 54%). What should set that price is open.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C123's copy plus `restSplit` and `memoryCost`, listed at the top) · `check/` · `rest.js`. Needs
  `gutenberg.zip` from `github.com/nltk/nltk_data` (`packages/corpora`), unzipped. Run:
  `node rest.js <folder> carroll-alice.txt 8`.

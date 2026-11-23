# C114 · Differentiation

Utterances (stretches between full stops and the like) are held whole and split only by comparison with what is held,
as anneal on `main` does: the shared run, and what varies before and after it. Nothing is built up from letters and
nothing is chunked. Words come out even with **no spaces at all**: 69 to 75% of the pieces read have both edges at real
word boundaries (chance is roughly 6 to 10%). *Alice* with no spaces reads as `[themarchhare][interrupted]
[inagreathurry]`, and its most used pieces include `saidtheking`, `ofthe`, `would`, `with`, `jury`, `court`. With
spaces, 77 to 79%, cleaner than anything since C106. The open problem is coverage: only 30 to 59% of the text is read
into pieces, and the rest stays loose.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `differentiate.js`, plain JavaScript, no dependencies. Needs `gutenberg.zip` from `github.com/nltk/nltk_data`
  (`packages/corpora`), unzipped. Run: `node differentiate.js <folder>`.

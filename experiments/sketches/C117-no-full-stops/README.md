# C117 · No full stops

Is cutting the text at full stops a crutch? The text without spaces is cut three ways (sentences; fixed stretches of
60 letters; random stretches of 30 to 150 letters, all cut mid-word where they fall) and learnt by C116's
differentiation. Scoring is made strict, and that is the first finding: C114 to C116 counted the starts and ends of
utterances as clean word boundaries, which inflated their "clean pieces" from about 50% to about 70%. Scored strictly,
about half the pieces have both edges at real word boundaries (chance is roughly 6%). Without full stops, words still
come out (`said`, `they`, `saidtheking`, `thewhiterabbit`). With fixed cuts and cheapest reading it is about as clean
as with sentences. With random cuts, and with the support reading, it is clearly worse. Full stops aren't what makes
it work, but they help.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `nostops.js`, plain JavaScript, no dependencies (C116's `support.js` with the cuts and strict scoring). Needs
  `gutenberg.zip` from `github.com/nltk/nltk_data` (`packages/corpora`), unzipped. Run: `node nostops.js <folder>`.

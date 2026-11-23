# C113 · Real books

The best mechanisms from C106 to C112 on public-domain books (*Buster Brown*, *Alice*, Bryant's *Stories*, the first
300,000 characters of *Emma*), each streamed once and measured on its last tenth. More text was not the answer: the
mechanisms cut about as they did on the small texts. Greedy longest-match (C110) is the best. About two thirds of its
cuts fall at a word gap (chance is about 40%), rising to 72% on the biggest text, but about half its pieces still
start or end inside a word. AMP-style pairwise competition (C112) is worse on every book, and counting ways in alone is
at chance. The global rule at rest makes the cleanest pieces but can't stream and leaves much of the text loose. None
of them uses the space as anything but a letter.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `books.js`, plain JavaScript, no dependencies. Needs `gutenberg.zip` from `github.com/nltk/nltk_data`
  (`packages/corpora`), unzipped. Run: `node books.js <folder>` (add `quick` for the main settings only).

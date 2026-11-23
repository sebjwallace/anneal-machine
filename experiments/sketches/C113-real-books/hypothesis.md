# C113 · Real books: hypothesis

Written before running. Follows C106 to C112.

## The question

Every sketch from C106 to C112 was judged on a few hundred to 1,600 characters written for the sketch. On text that
small, some "mistakes" are real patterns of that text (`d_the_` from "and the"), and words aren't yet the obvious unit.
Infants find words over hours of speech. So: **with a real amount of text, do the mechanisms cut at words, and does
the gap between the global rule (C106, C108) and the local ones (C110, C112) close?**

## Texts

Public-domain books from Project Gutenberg, taken from NLTK's corpus collection (`gutenberg.zip`, from
`github.com/nltk/nltk_data`). Lowercased, with everything but letters turned into single spaces (a space is `_`).

| book | characters, cleaned | words | different words |
|---|---|---|---|
| Burgess, *Buster Brown* (children's) | 80,174 | 16,353 | 1,521 |
| Carroll, *Alice in Wonderland* | 135,021 | 27,335 | 2,569 |
| Bryant, *Stories to Tell to Children* | 231,029 | 46,697 | 3,834 |
| Austen, *Emma* (adult; first 300,000 characters) | 300,000 | about 57,000 | — |

Each book is streamed **once**, nothing repeated. The **last tenth** is measured.

## What is run

- **G** (global, the reference): C108's rule on a whole stretch of text at once, at rest. Every repeated run of 2
  to 16 letters is a candidate; the one that saves most is taken (k · b > b + k · use, a use costing
  1 + log2(N) / log2(alphabet)); repeat until nothing pays. Pieces are never edited. It is too slow for a whole book,
  so it runs on the **first 40,000 characters** of *Buster Brown* and *Alice*, and is measured on its last tenth. The
  streaming runs are also given the same 40,000 characters, for a like-for-like comparison.
- **greedy** (C110, hot): streaming; tentative pieces met again take part in reading; the longest that fits is read.
- **compete** (C112, length then ways in): streaming; rivals compete as in AMP, with ties broken by ways in.
- **ways** (C112, ways in): streaming; support is ways in.

Pool T and population N: 1024 and 4096 each. Main run: T = 4096, N = 4096.

## Measures (on the measured part)

- **Words read whole**: the share of words read as one unit, the word alone or with its space(s), lined up with it.
- **Cut inside a word**: the share of pieces read that start or end between two letters.
- **Loose**: the share of letters read loose.
- The 30 lasting pieces read most often there.
- How hot over the run: the share of letters read loose, per tenth.

## Predictions

1. **All the streaming mechanisms do better on real books than on the small texts**: a smaller share of pieces cut
   inside a word, and a rising share of words read whole over the run.
2. **G is best on the 40,000 characters**, but the gap to the streaming ones is smaller than on the small texts.
3. **greedy and compete end close to each other.** ways is worse (frequent short pieces straddling word gaps).
4. **Common words are read whole**: `the`, `and`, `was`, `said`, `he`, `of`, `to`. Common endings form (`ing`, `ed`).
   Frequent two-word pieces (`of_the_`, `in_the_`, `said_the_`) form too, and on a real book that is right, not a fault.
5. **It cools**: the share of loose letters falls over the run, steeply at first.
6. **N = 1024 fills up** on the bigger books (C108's cliff moves up with the amount of text). 4096 doesn't, or only late.

## Success and failure

- **Success:** on *Alice* or *Bryant*, the main streaming run reads at least half of the measured words whole, and
  fewer than a quarter of its pieces cut inside a word.
- **Failure:** on real books the streaming mechanisms are no better than on the small texts. Then the problem is the
  mechanisms, not the texts.

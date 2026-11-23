# C113 · Real books: findings

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece (fixed by the population size, about 3.6 to 4 letters), while a loose letter cost 1.
> So a familiar short piece ("the", say) could cost more to use than to spell out: it was never worth reading on its
> own, it counted as heat each time it appeared, and nothing that judged what pays could keep it as a piece. That is the wrong
> way round: an established piece should be the cheapest thing to reach for. C125 replaced the flat price with cost as
> surprise (the more familiar a letter or piece, the cheaper it is to use), and that fixed it. Read the results here
> with that in mind: some may not depend on it, but anything about short pieces, what pays, or what counts as heat
> may.

Run: `node books.js <folder>` (about two minutes; everything is in [out.txt](out.txt)), where the folder holds the
unzipped `gutenberg.zip` from NLTK's corpus collection (`github.com/nltk/nltk_data`, `packages/corpora`). The books
aren't copied into the repo. Read [the hypothesis](hypothesis.md) first.

One measure was added after the first look and before this run: **cuts at a word gap**, the share of the cuts made
between units that fall next to a space, against **chance** (the share of all positions that are next to a space).
This is boundary precision, the usual measure in work on how infants segment speech. It was added because the
"cutting inside a word" measure counts word endings like `ed_`, `ing_` and `ly_` against the machine, though they
are real parts of words.

## In short

**More text was not the answer.** On real books, streamed once, the mechanisms do about as well as on the small
texts, not clearly better.

- **Greedy (C110) is the best of the streaming mechanisms**, and clearly above chance. About two thirds of its cuts
  fall at a word gap (63 to 72%, against chance at 38 to 42%), and it does best on the biggest text (*Emma*: 72%).
  It reads about 40% of words whole, and 60 to 72% of words sit inside a piece with clean edges (a word, or a phrase
  of whole words). But about half of its pieces still start or end inside a word, and many of those are word endings
  (`ed_`, `ing_`, `ly_`, `s_`).
- **compete (C112, AMP's rule, length then ways in) is worse than greedy on every book**: about half its cuts at a
  word gap, a quarter of words whole.
- **ways in (C112) is at chance**: 40 to 45% of its cuts at a word gap, with chance at 38 to 42%. Counting sightings
  alone finds nothing about words.
- **G (the global rule at rest, on 40,000 characters)** makes the cleanest pieces (only 24 to 27% cut inside a word,
  and phrases like `_the_edge_of`, `_thought_alice_`, `_no_one_said`), but leaves 23 to 31% of letters loose. That
  drags its word gap share down to about 50%, since every loose letter is a cut. Some of its pieces are cut off by
  the 16-letter limit (`farmer_brown_s_b`, `_the_green_fores`).

| book (main run, T 4096, N 4096) | greedy: whole, clean, cuts at a gap (chance) | compete | ways in |
|---|---|---|---|
| *Buster Brown* (80,000) | 40%, 68%, 69% (41%) | 25%, 46%, 53% | 22%, 31%, 41% |
| *Alice* (135,000) | 37%, 65%, 66% (40%) | 20%, 40%, 49% | 21%, 29%, 41% |
| *Bryant* (231,000) | 38%, 60%, 64% (40%) | 23%, 41%, 50% | 21%, 29%, 41% |
| *Emma* (first 300,000) | 42%, 72%, 72% (38%) | 26%, 50%, 54% | 23%, 32%, 40% |

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | all streaming mechanisms better on real books than on the small texts | **Not clearly.** Greedy is about the same, with a slight rise at 300,000 characters; the others are no better. |
| 2 | G best on the 40,000 characters, smaller gap | **Mixed.** G's pieces are the cleanest, but it reads fewer words whole than greedy, because it leaves many letters loose. |
| 3 | greedy and compete close; ways worse | **Greedy is clearly ahead of compete**; ways is worst, at chance. |
| 4 | common words read whole; endings; two-word pieces | **As predicted**: `and_`, `the_`, `of_`, `was_`, `had_`, `that_`, `she_`, `her_`, `not_`, `very_` among the most used; `ed_`, `ing_`, `ly_`; `in_the_`, `of_the_`, `to_the_`, `at_the_`. |
| 5 | it cools: loose letters fall, steeply at first | **Greedy, yes** (11% to 1% on *Buster Brown*, 5% to 1% on *Bryant*). Compete and ways fall a little and then stay level (about 12% and 18 to 20%). |
| 6 | N = 1024 fills on the bigger books | **As predicted**: it fills on every whole book. 4096 doesn't. The pool size matters too: greedy does better with T 4096 than 1024 on every book. |

## Against the success and failure criteria

**Neither cleanly; nearer failure.** No mechanism reads half the words whole with fewer than a quarter of pieces
cutting inside a word. By the criterion written beforehand, "no better on real books than on the small texts" is met
for compete and ways, and nearly met for greedy. **So the problem is mostly the mechanisms, not the texts.** The one
thing the bigger texts show is that greedy finds word gaps well above chance, and more so on the biggest book.

## What this says for C106 to C113

1. **Small texts weren't hiding a working mechanism.** The question C112 left open is answered: given hundreds of
   thousands of characters, the local mechanisms cut much as they did on a few hundred.
2. **Greedy longest-match beats AMP-style pairwise competition, every time.** Competing with each overlapping rival
   one at a time, as built in C112, makes the cuts worse, not better. (This is a statement about the sketch's version
   of the rule, not about AMP's competition in the engine, which works on members and gates.)
3. **Counting alone (ways in) finds no words.** Whatever finds words here comes from length and longest match, not
   from frequency.
4. **The one rule that makes clean pieces is the global one** (whole descriptions compared at rest), and it can't
   stream, can't run on a whole book in this form, and leaves much of the text loose.
5. Infants have more than letters to go on (stress, pauses, where words start and end in what they hear, meaning,
   people pointing at things). Text with spaces is in some ways easier, but these mechanisms see the space as just
   another letter, so they don't use the most useful cue the text has.

## Givens to keep in mind

- Books lowercased, letters only, every run of anything else turned into one space.
- Measured on each book's last tenth. Words that are one letter, read as one loose letter, count as read whole.
- G: candidates of 2 to 8 symbols and at most 16 letters; ranked by an upper bound, the best 200 checked exactly; no
  unpack; run on the first 40,000 characters only.
- Everything else as C110 (greedy) and C112 (compete, ways). The pool counts by buckets of sightings, and the oldest in
  a bucket goes first on a tie, which is close to C110's oldest-born rule but not identical.

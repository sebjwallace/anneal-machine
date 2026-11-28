# C173 · The memory keeps what it finds (a taste): findings

Run: `node keep.js > out.txt` (about seventy seconds). Build check: `node sanity.js > sanity.txt`. Read
[the hypothesis](hypothesis.md) first. Engine: C172's, plus a tie-break variant (off unless set). Circuit and teacher as
C172.

## In short

**One memory did the keeping and the choosing itself.** It worked six worked examples, kept what settled, tried what it
had kept on the next example, and was tested, without being rebuilt or copied. No code picked a winner, and no code
built a test circuit from one.

**Repetition removed the coincidences.** The search had found six ways of working on the first example. Three were
right, and three got that page right by holding a first-row digit that happened to equal the multiplier's other digit.
On every later example only the three right ones settled. Their copies grew and the coincidences fell behind. In both
arms, a coincidence was never recalled again once the right ones had pulled ahead, and never at test.

**Equals stayed tied for ever, as predicted.** With no tie-break, the three right ways of working gained a copy each
time, together, from 2 copies to 7 each. So recall at the hand-over always tied and brought on nothing. At test: 200 of
200 first rows, 0 of 200 second rows. The memory knew three right answers and could use none of them by itself.

**With a tie-break, the tie only had to be broken once.** With "the first formed wins", on the third example the first
of the three right ones won, settled, and gained a copy. From then on it was ahead on copies, so it won by repetition,
not by the tie-break. It ended with 7 copies against 3 for each of the other two. Recall alone settled every later
example, and the test was 200 of 200 on both rows, all from the memory's own recall. But which of the three won was
decided by the order my code listed them in, which is no reason at all.

## Results

| arm | how each worked example was settled (S search, O offers, R recall) | copies at the end (coincidences / right) | test: first row | test: second row | recalled at test |
|---|---|---|---|---|---|
| no tie-break | S O O O O O | 2, 2, 2 / 7, 7, 7 | 200 of 200 | 0 of 200 | nothing (tie), 200 times |
| the first formed wins (a declared crutch) | S O R R R R | 2, 2, 2 / 7, 3, 3 | 200 of 200 | **200 of 200** | the first right frame, 200 times |

The full table, example by example, is in [out.txt](out.txt).

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | first example: the search's 6 kept, all 6 settle again in the memory | **Holds** (6 of 6). |
| 2 | no tie-break: coincidences drop out, the three right ones tie for ever; test 200 / 0 | **Holds.** |
| 3 | first formed wins: a coincidence recalled once and failing; the first right frame wins from the third example; test 200 / 200 | **Holds.** |
| 4 | coincidences never recalled at test | **Holds.** |

## Disclosed

- **The check counted as experience.** After the search's six were kept, each was run again in the memory to check it
  settles there too. That check settled, so binding added a copy. Every frame, coincidences included, starts with 2
  copies, not 1. That's the rule working as designed (binding on settling doesn't know a check from practice), but it
  means the first example counted twice. It doesn't change which frames win, because all six got the same extra copy.
- The number of fresh sheets made in advance was raised from 240 to 320 after the first attempt ran out. That's a size
  only, with no change in behaviour.
- The search on the first example is C172's, reused, on the same example and in the same trial circuit. That's
  disclosed in the hypothesis.

## The ledger

**Given:**
- the first row;
- the hand-over's form;
- the search for the first example (the code's, reused);
- reading the offers from the competition (the code's);
- the target given as held activity, and a fresh sheet per problem (the encoder);
- the facts;
- the part vocabulary, frame cells and sheets made in advance (architecture);
- in arm 2, the tie-break.

**The engine:** every page from the cue, recall by competition with copies counting, agreement and settling, binding a
copy on settling, and the test, all in one memory.

**Removed:** the code choosing a single winner across worked examples, and the code building a fresh circuit from it to
test.

## What it shows, and what it suggests

Keeping and choosing by repetition works in the memory itself, and it handles the coincidence problem from C172
naturally: right answers keep being right and wrong ones don't. What it can't do is choose among true equals, because
repetition reinforces equals equally. But a tie only needs breaking once, since after that repetition keeps the choice.
That suggests the fix doesn't need to be a rule in competition. Anything that gives one of the equals a single extra
copy would do it. For example, a child who stops at the first offer that works instead of trying every offer. In this
run my code tried every offer, which is exactly what kept the equals level. That's a candidate for a later taste, but
it moves the arbitrariness into the order the offers are tried in, so it isn't free.

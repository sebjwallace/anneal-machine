# C178 · Seeing more at the start: findings

Run: `node learn.js > out.txt` (about three minutes). Build check: `node sanity.js > sanity.txt`. Read
[the hypothesis](hypothesis.md) first.

## In short

**The memory now tells a second-row page from a first-row page, and uses what it learned without being told.** At the
start it sees what's at each place within reach: a digit, a sign or nothing. It keeps the way of working that did the
work together with that view. On new pages, the way of working whose view matches best comes up. In the test, in one
memory, all four kinds came out right from the start alone: adding 200 of 200, times one digit 200 of 200, and **second
rows 200 of 200** (C177: 0 of 200). Each kind of page brought up its own way of working every time.

**Seeing more also made learning cheaper.** The second row took 258 runs over four worked examples (C177: 412 over two).
On the second example, the start brought up the first example's result, because its view matched best, rather than
times one digit. That result was the coincidence again, but it was only one change from right, so adapting it took 43
runs instead of 208. On the third example the coincidence still won, as the first formed of two equals. It failed, and
the right one settled as an offer. On the fourth, the right one, now with more copies, came up first and settled first
time.

**Repetition sorted out the coincidence, as in C173.** The right second-row way of working ended with 3 copies, the
coincidence with 1.

## Results

| worked example | how it was settled | runs |
|---|---|---|
| second row, 525 × 67 | times one digit brought up, adapted in four rounds (the coincidence) | 204 |
| second row, 9188 × 54 | the coincidence brought up (its view matched), adapted in one change | 43 |
| second row, 905 × 79 | the coincidence brought up (first formed of two equals), failed; the right one settled as an offer | 10 |
| second row, 7894 × 27 | the right one brought up, settled first time | 1 |
| **second row in all** | | **258** (C177: 412; blind, C172: 136,922) |

| test (200 new, the same memory, from the start) | right | brought up |
|---|---|---|
| adding | 200 of 200 | the adding way of working, 200 times |
| times one digit | 200 of 200 | times one digit, 200 times |
| second rows | **200 of 200** | the right second-row way of working, 200 times |

## Against the predictions

Every prediction held: adding and times as before; the first example as C177; the second adapted from the first's result
in far fewer runs (43); the third settled by an offer after the coincidence won the tie; the fourth recalled the right
one; all tests 200 of 200. The risk (pages of one kind matching only partly) didn't show: no page brought up a way of
working of another kind.

## The ledger

As C177. **Added:** the fuller view at the start, given by the encoder as the kind of thing at each place in reach (an
abstraction, declared), and kept with the way of working by binding.

**Removed:** the context failure. The memory now chooses the right way of working from the page itself, among four.

## What it shows

Context from what's actually on the page lets one memory hold several ways of working and bring up the right one, and
it makes the nearest earlier result the starting point for the next adaptation. What's still given: the view is handed
in by the encoder as a digit, sign or nothing at each place (the memory doesn't look for itself), and the adapting is
still the code's rule.

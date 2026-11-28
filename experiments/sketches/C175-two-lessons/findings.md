# C175 · Two lessons (a taste): findings

Run: `node lessons.js > out.txt` (about four minutes), then `node each.js > each.txt`. Read [the hypothesis](hypothesis.md)
first, including the part added after the first run. Engine and circuit as C172. One way of working is run from the cue.

## In short

**The second lesson was learned with a fraction of the tries once the first lesson's pieces were offered.** Lesson 2,
times one digit, took 1,112 tries from scratch. Offering the pieces of every way of working learned in lesson 1 cut that
to 180. Offering the pieces of the right one of them cut it to 2, where the only open question was whether to hold the
digit below or keep reading it. Every arm learned the same way of working, and it did 200 of 200 new sums right.

**But the first attempt took more tries, not fewer (8,220).** That was partly unfair: the pieces search lacked the
filter the from-scratch search had. It was also partly real, because of the second finding.

**A choice that didn't matter in one lesson matters in the next.** Adding treats all three digits it reads alike, so
lesson 1 settled six equally right ways of working, one for each order of the reads, and nothing could tell them apart.
Times one digit treats them differently: one digit is held, one is read, and one is the carry. Offered one at a time, only
1 of the 6 led to times one digit. The other five gave nothing, because their pieces put the hold or the carry in the
wrong place. So if the tie had been broken arbitrarily (C173's "first formed wins"), there would have been a five-in-six
chance of choosing a version that doesn't carry over. Keeping all the equals (arm b) was slower but safe. Choosing one
was fast only if the choice happened to be the right one.

**The caveat named before the run stands.** On paper, these two lessons look almost the same: times one digit is adding
with one read held and a different sign. A big saving was expected. This shows the mechanism, reuse of pieces from an
earlier lesson. It doesn't yet show it on lessons that look less alike.

## Results

| | tries | learned | test: 200 new |
|---|---|---|---|
| lesson 1, adding, from scratch | 2,052 | 6 equal ways of working (the three reads in every order) | 200 each |
| lesson 2, times one digit, from scratch | 1,112 | hold the digit below, read the top, carry above (as on paper) | 200 |
| lesson 2 with lesson 1's pieces (first run, no filter) | 8,220 | the same | 200 |
| (b) with lesson 1's pieces, plus the same filter (added) | **180** | the same | 200 |
| (c) with the pieces of the first of lesson 1's six, plus the filter (added) | **2** | the same | 200 |
| (c) repeated with each of the six on its own (each.js) | 2 each | the same from 1 of the 6; nothing from the other 5 | 200 / - |

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | lesson 1 learns adding, twice over (top and bottom can swap); 200 of 200 | **Holds, with six, not two:** the carry read can swap with either number too, as adding treats all three alike. |
| 2 | lesson 2 from scratch: times one digit, 200 of 200, a few thousand tries | **Holds** (1,112). |
| 3 | with pieces: at least twenty times fewer tries | **Fails on the first run** (8,220, more). |
| (b) | with pieces and the filter: a few times fewer | **Holds:** about six times fewer (180). |
| (c) | one way of working's pieces with the filter: at least twenty times fewer | **Holds for the first of the six** (2 tries). **But it was luck:** 5 of the 6 lead nowhere (each.js, after the run). |

## Disclosed

- Arms (b) and (c) were added after the first run, with their predictions written before they ran.
- `each.js` was written after the full run, because "the first of six" in arm (c) was an arbitrary choice that needed
  checking.

## The ledger

**Given:**
- the order of lessons (the syllabus);
- the layouts and padding (the encoder);
- the target;
- the facts and the signs' meanings;
- the search, and the proposing with pieces (the code's);
- reading pieces off a learned way of working (the code's).

**The engine:** every run from the cue, agreement, settling. **Not done here:** one memory keeping things across lessons
(as in C173), and the engine fitting pieces itself.

## What it shows

Learning gets cheaper when earlier lessons' pieces are reused, and the saving can be very large. Reuse has a hidden
condition, though: the earlier lesson must have settled on the version whose pieces fit the later one, and an earlier
lesson can't know which that is. Either the memory keeps all of its equals, which is slower but safe, or a later lesson
has to be able to reach back past a choice that turned out wrong.

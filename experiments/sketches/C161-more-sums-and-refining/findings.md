# C161 · More sums, and refining (a taste): findings

A taste, by agreement: `node taste.js > out.txt`, about six minutes. Read [the hypothesis](hypothesis.md) first.
Engine: C160's copy, unchanged.

## In short

**More sums help, slowly, but the structure kept grows fast.** Forming overlaps against every earlier view (as C160),
"nothing recalled" fell from 21% at 8 worked sums to 15% at 24 and 14% at 48, and right answers rose to between 78 and
91%. But the overlaps kept grew from 7 per seed to 31 and then 89, nearly all of them coincidences. The gain is already
flattening (long rows dipped from 91% at 24 sums to 78% at 48).

**Refining was worse, and it shows why it can't work as designed.** Comparing each new sum only with the frame's
existing overlaps kept the structure tiny (3 overlaps per seed, even at 48 sums), as hoped. But it recalled nothing
for 33 to 42% of sums, at every size. The reason is plain in what it kept. The reading frame serves two signs. Its first
overlap came from an addition meeting a subtraction, which share no sign, so it held only "0 carried in" (plus a
coincidental 4). After that, every new sum was compared with that, and you can't get "+" back by narrowing something
that never had it. **Refining assumes one core per frame**, but the reading frame's real context is "+ or −", two
abstractions, not one. What's lost early is lost for good.

**Wrong frames stayed at zero** (1 in 320 at 8 sums with episodes, 0 everywhere else). Whatever the memory recalls,
it recalls right. What's failing is deciding at all.

## Results

| worked sums | overlaps formed | + | − | × | long row | nothing recalled | wrong frame | overlaps kept per seed |
|---|---|---|---|---|---|---|---|---|
| 8 | against every view | 80.0% | 80.0% | 87.5% | 68.8% | 20.6% | 1 of 320 | 7 |
| 8 | refining | 62.5% | 61.3% | 71.3% | 47.5% | 39.4% | 0 of 320 | 3 |
| 24 | against every view | 85.0% | 71.3% | 92.5% | 91.3% | 15.0% | 0 of 320 | 31 |
| 24 | refining | 72.5% | 70.0% | 58.8% | 67.5% | 32.8% | 0 of 320 | 3 |
| 48 | against every view | 88.8% | 87.5% | 91.3% | 77.5% | 13.8% | 0 of 320 | 89 |
| 48 | refining | 70.0% | 58.8% | 66.3% | 38.8% | 41.6% | 0 of 320 | 3 |

What was kept at 48 sums, seed 1. **Against every view:** the reading frame had 57 overlaps, among them the clean ones
("+, 0 carried in" and "−, 0 carried in") and many coincidences ("5 in the bottom units, 0 carried in, +"...). The
holding frame had 30, among them "×, 0 carried in". **Refining:** the reading frame had {4 in the top's tens, 0 carried
in} and {0 carried in}. The holding frame had {0 carried in, ×}.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | against every view: "nothing" falls with more sums, overlaps grow fast, the gain flattens or reverses | **Holds:** 21% to 15% to 14%; 7 to 31 to 89 overlaps; already flattening. |
| 2 | refining: few overlaps, the clean ones, and less "nothing" than against every view, near-perfect by 48 | **Fails:** few overlaps, but not the clean ones for the reading frame (its sign was lost at the first overlap), and more "nothing" at every size. |
| 3 | wrong frames rare in both | **Holds:** 1 in 1,920 overall. |

## The ledger

**Given:** as C160, plus, for refining, the binding rule keeping track of which chains are its overlaps (bookkeeping
inside the fixed rule). **The engine:** as C160. **Disclosed:** one run, as described.

## What it suggests next

The clean abstractions are there when overlaps are formed against every view. The trouble is all the coincidences
around them, and they're structure that's never confirmed again. The owner's own principle covers this: forgetting is
part of lowering energy. Keep what matters, and let structure that's never reinforced go cold and drop out of
competition (archived, not deleted). So the next taste is overlaps against every view, as here, but **an overlap that
isn't confirmed again by later sums goes cold and stops competing.** The sign-based abstractions are confirmed by
nearly every sum of their kind and stay warm. A coincidence is confirmed rarely and fades. That should bound the
structure kept and clear the ties, without assuming one core per frame.

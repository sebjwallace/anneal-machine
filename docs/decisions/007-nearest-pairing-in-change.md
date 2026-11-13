# 007 · Pairing things nearest first when pricing change

**What:** when the energy prices what changed between two pictures, each thing in the picture before is paired with the same thing in the picture after, nearest pairs first. Its change is "this thing moved by dx, dy".

**Why:** it's the simplest reading of "the same thing, a moment later". With one object of each kind per picture, which is most cases so far, there is nothing to choose.

**Alternative:** pick the pairing that makes the whole change description cheapest. That follows from the energy rule itself, but it means searching over pairings. It's worth doing once scenes hold several of the same thing moving differently.

**Note:** `change.js` dropped "pair nearest with nearest" as a crutch, because it compares whole changes. This pairing is the same idea coming back in the energy's change term. It's declared so it doesn't creep in unseen. It should be replaced by the energy-derived pairing, or by `change.js`'s whole-change comparison, when the two are merged.

# C106 · The price decides the cut

A buffer of text, with an empty memory, is compared with itself, and a piece is kept only if it makes the whole
description cheaper (CON-1, priced as in the docs). On a buffer of a few hundred characters the cuts mostly make sense:
no sentence is ever stored, and the first pieces are `_the_`, `_and`, `ing`, `was_`, `_of_the_`. A word seen once forms
nothing; seen three times in one buffer, it forms. On small buffers it cuts at coincidences (`cat_sa` from "sat" and
"saw"), and because pieces are never edited, those cuts stay and get used for everything read after.

The energy is bookkeeping over the whole buffer, which breaks cells first (CON-19) on purpose: the sketch tests the
price, not a mechanism.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `anneal.js`, plain JavaScript, no dependencies. Run: `node anneal.js` (add `steps` to print every step).

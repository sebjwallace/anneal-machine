# C112 · Rivals compete as in AMP

C110 with reading settled by AMP's competition rule: most support wins, one more is enough, ties are held, and parts
aren't rivals of their whole. It failed in all three readings of support. With support as length, nothing forms:
from nothing every rival is a two-letter pair, neighbours always tie, and held ties freeze the symmetry. With support
as ways in, or length then ways in, it learns, but cuts worse than C110's greedy reading. Pairwise local competition
didn't reproduce what made C106's global cheapest reading cut well. The leftover "errors" (`d_the_` from "and the")
are real regularities of a tiny text, so the next step should be much more text before more mechanism.

- [hypothesis.md](hypothesis.md) (with an addendum written between the runs) · [findings.md](findings.md) ·
  [out.txt](out.txt)
- `compete.js`, plain JavaScript, no dependencies (texts and measures copied from C110's `hot.js`). Run:
  `node compete.js` (add `steps` to list every run's pieces).

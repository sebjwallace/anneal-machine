# C162 · Abstraction from competition (a taste)

A change to the engine's competition, with no overlaps stored: when tied rivals all agree on what comes next, it comes
on; what they disagree on stays held. With each frame remembered only with its full view, right answers rose from 7 to
24% (old competition) to 24 to 59% at 8 worked sums and 44 to 63% at 24, with no wrong or broken frame in 960. Weaker
than storing overlaps by a rule, but it stores nothing and keeps improving with more sums. About half of sums still
recall nothing at 24 sums, likely ties between episodes of different frames.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt) · [frames.txt](frames.txt)
- `engine.js` (C159's plus `tieOverlap`) · `circuit.js`, `lanes.js` (C159's) · `taste.js` (three arms).
- Run: `node taste.js > out.txt 2> frames.txt` (under two minutes).

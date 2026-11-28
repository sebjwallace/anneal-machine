# C161 · More sums, and refining (a taste)

C160's overlaps at 8, 24 and 48 worked sums, formed either against every earlier view or by refining the frame's
existing overlaps. Against every view: "nothing recalled" falls slowly (21% to 14%) and right answers rise to 78 to 91%,
but the overlaps kept grow from 7 to 89 per seed, mostly coincidences. Refining keeps 3 overlaps but recalls nothing for
a third or more of sums: the reading frame serves two signs, its first overlap lost the sign, and narrowing can't get
it back. Wrong frames stay at zero. Next: let overlaps that are never confirmed again go cold.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js`, `circuit.js` (C160's) · `lanes.js` (the refining option) · `taste.js` (sizes and arms).
- Run: `node taste.js > out.txt` (about six minutes).

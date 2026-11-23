# C110 · A hot start

No buffers: text streams in a character at a time. Each unit read pairs with the one before it as a tentative piece
in a small pool, and a tentative piece becomes lasting once it pays for itself (nucleation). First run: nothing forms
at all. A pair of letters costs less than a use, so growing from the smallest pieces up has a barrier at the bottom,
as in nucleation. Second run: tentative pieces met again take part in reading and grow while still tentative. It
crosses the barrier, learns words from a plain stream (`river`, `children_`, `miller_`, `_the_river`), and reads "the
zebra sat on the mat" as `[_the_zebra][_sat_on_the_mat_]`. But lasting pieces inherit the cut points of the one greedy
reading made while hot (`d_tha`, `an_s`), so fragments lock in. Next idea: hot should mean many overlapping readings
at once, not one.

- [hypothesis.md](hypothesis.md) (with an addendum written between the runs) · [findings.md](findings.md) ·
  [out.txt](out.txt)
- `hot.js`, plain JavaScript, no dependencies. Run: `node hot.js` (add `steps` to list every run's pieces).

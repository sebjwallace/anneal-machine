# C109 · The better cut wins (it didn't)

Buffers read in turn. Reading takes the cheapest description the loaded pieces allow, so rival pieces compete. New
pieces form beside old ones, and the least chosen go to stored when the population is full. The test was whether
C106's bad early cuts (`the_cat_sa`, `t_on_the_`) would be outcompeted. **They weren't.** No better piece ever formed,
and on a second pass nothing changed. Two reasons. The price can't tell a good cut from a bad one when both take the
same number of pointers. And an old piece is already paid for, while a rival must pay its whole body from one buffer.
A better piece saves a little in many buffers, so something would have to carry its evidence across buffers. That is
a new mechanism, left for the owner to decide.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt) · [out-why.txt](out-why.txt)
- `compete.js`, plain JavaScript, no dependencies. Run: `node compete.js` (add `steps` for every change on the
  second pass). `why.js` probes the rivals on buffer 1: `node why.js compete.js`.

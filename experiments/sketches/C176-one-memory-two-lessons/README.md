# C176 · One memory, two lessons

One memory goes through lesson 1 (adding with carrying) and lesson 2 (times one digit), and is tested on both, with
nothing carried between lessons by the code. In lesson 2, the start brought up the kept adding ways of working by
association. The furthest were varied one part at a time (whether the first read is held), and one became times one
digit. Lesson 2 took 12 runs, against 1,112 from scratch and 180 with the code carrying pieces over (C175). At test,
times one digit got 200 of 200. Adding got 200 of 200 with the declared tie-break and 0 of 200 without it (six equals
tie). The view at the start keeps the lessons apart. One fix came after the first run (binding only the frame that did
the work), and it's disclosed.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt) · [out-first-run.txt](out-first-run.txt)
  · [sanity.txt](sanity.txt)
- `engine.js` (C173's) · `circuit.js` (C172's) · `c175-lessons.js` (C175's pages and first search) · `learn.js` · `sanity.js`.
- Run: `node learn.js > out.txt` (about seventy-five seconds); `node sanity.js > sanity.txt`.

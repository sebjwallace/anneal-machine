# C179 · Three ways to adapt (round one of the fan-out)

The three candidate energy rules, copied as ways of choosing what to try when the memory adapts what the start brought
up, plus one combination. Each runs on the same two lessons in the same one memory (C178's): times one digit from
adding, and the second row from times one digit. On the second row, heat lowering the bar (nearest first, widening
until something cools more, the winner kept) was cheapest and reliable: 226 runs, 200 of 200. Spreading from the gap
got stuck every time, because pieces don't come right in the order the working is done. A budget flowing succeeded in
3 of 5 seeds. Flowing toward the nearest was worse, at 1 of 5, because the second row needs far changes. All rules are
the code's in this round. Round two builds the winner into the engine.

- [hypothesis.md](hypothesis.md) (with the parts added during the run) · [findings.md](findings.md)
- `out-greedy.txt`, `out-B.txt`, `out-C.txt`, `out-A.txt`, `out-AB.txt` and their `log-*.txt`; `log-first-run.txt` (the
  first full run, stopped).
- `fanout.js` · `memory.js` (C178's, with C179's search cache and more frame cells) · `pages.js` (C177's second-row
  pages) · `engine.js`, `circuit.js`, `teacher.js`, `c175-lessons.js` (as C178).
- Run: `ARM=<greedy|B|C|A|A+B> node fanout.js > out-<arm>.txt` (from a few minutes to about forty minutes an arm).

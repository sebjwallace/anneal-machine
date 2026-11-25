# C143 · A search steered by heat

Follows C142 (column addition learned from short sums), replacing its exhaustive search (every possible step, replayed
on each worked example) with one steered by heat: explain the hot cell at the focus from cool cells nearby, cool what
is explained, move to where heat remains. First run: 184 times fewer checks, but one seed settled on a wrong step and
jammed (95% right). After the first run (declared): with each explanation keeping its own heat and counting only if it
leaves none, results match C142 exactly (100%, every run stopping by itself) with 241 times fewer checks. Lessons for
the engine's energy rules: rivals can't share their settling, and an explanation is finished only when no heat is left.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C142's copy, unchanged) · `heat.js` (C142's world and step, the heat-steered searches, the arms; GIVEN
  and ENGINE marked). Run: `node heat.js > out.txt`.

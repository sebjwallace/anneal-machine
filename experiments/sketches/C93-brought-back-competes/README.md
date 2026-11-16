# C93 · Brought back competes

Follows C92. Fixes the leak C92 found (a part brought back woke every whole it belongs to) by reading wholes instead of
connected groups, in competition, in the handles of compositions and in the cut. With C92's warm layer, a shared part
holds all its endings warm and one letter brings back exactly one.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine/`: C92's engine with three options (`warmth`, `brought`, `perWhole`), marked "C93 sketch".
- `test/`: the core's tests, run against every combination (see findings).
- Run: `node run.js`

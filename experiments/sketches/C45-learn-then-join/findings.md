# C45 · Findings (out-100.txt, out-300.txt, out-1000.txt)

| days | walks kept | kinds | real way exists: found / undecided / missed / wrong | no way exists: said so |
|---|---|---|---|---|
| 100 | 3 | 1 | 2 / 3 / 15 / 0 | 158 of 158 |
| 300 | 9 | 3 | 2 / 8 / 6 / 0 | 150 of 154 |
| 1000 | 10 | 7 | 2 / 12 / 0 / 0 | 144 of 152 |

**Missed: you can only join through what you kept.** With little experience, rarely walked stretches aren't worth
keeping, so the pushes have nothing to travel along. With more days, misses go to zero.

**Undecided is mostly right.** Most pairs crossing C…E have two equally good real routes (by D or by K). "Undecided"
is the true answer there. (A to O is one of them.)

**The real problem: made-up routes.** With more experience, energy keeps kinds with two slots whose choices actually
depend on each other, for example "D/K → E → F/Z → G/W": after F comes G, after Z comes W, but the kind lets any start
go with any end. Its made-up versions (E → Z → G) are never paid for, because nothing that was seen uses them. So the
pushes travel along paths that don't exist: "Z → G → H → O", "X → E → F …" (4 wrong at 300 days, 8 at 1000).
In C43's paired control no kind formed, but with enough varied experience it does, and it over-generalises.

**Result.** Learn-then-join works end to end and fast. It finds routes it never walked, says "no way" when there is
none, and says "undecided" at real forks. But a kind's free choices can invent connections, and today nothing in energy
counts against a version that was never seen. That is the open question from milestone 10 again, now with a concrete cost.

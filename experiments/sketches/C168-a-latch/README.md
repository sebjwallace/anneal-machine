# C168 · A latch

C167's jump-and-let-go, with the procedure's start place held as a latch: a start marker that is held only while the
procedure is held (wiring the same for every place, set up in advance). Two sums run straight on in one memory with
nothing reset between them: with the latch, both were right in all 100 pairs, and the second jump went only to its own
start. With a bond (as C167), or with the latch but no letting go, the second jump went to both starts, and the second
sum was right in only 6. All by hand.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js`, `circuit.js` (C167's) · `latch.js` (the circuit for this test, the arms, the report).
- Run: `node latch.js > out.txt` (about twenty seconds).

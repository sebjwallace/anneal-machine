# C165 · A hand-over on an arrival

The first step in [schema and spatial memory](../../../docs/theories/schema-and-spatial-memory.md): two ways of working,
held by a procedure, all written by hand. When the first runs out (an arrival: a Stalled cell switched on by the fixed
machinery when a step finds nothing), the held procedure's one hand-over gate brings on the second. It worked in all 200
sums. With no procedure, nothing followed. With the hand-over keyed without a sample of the first frame, the second
frame's own ending triggered it again, giving a loop. The work stops by itself, but the procedure stays held: letting go
is still open.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js`, `circuit.js` (C163's) · `handover.js` (the circuit for this test, the arms, the report).
- Run: `node handover.js > out.txt` (under twenty seconds).

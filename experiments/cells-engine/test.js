// CELLS ENGINE · tests. node test.js
'use strict';
const { Region } = require('./region.js');
let pass = 0, fail = 0; const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log('FAIL', msg); } };
// segments fire at two active links, never one
{ const r = new Region({ C: 4 }); const [a, b, c] = [r.cellsOf('a')[0], r.cellsOf('b')[0], r.cellsOf('c')[0]]; r.grow(c, [a, b]);
  ok(!r.firing([a]).has(c), 'one active link does not fire'); ok(r.firing([a, b]).get(c) === 2, 'two active links fire'); }
// an assembly completes from two of its cells; a cue split across two assemblies at equal support brings back both only at the top level
{ const r = new Region({ C: 4 }); const A = ['a', 'b', 'c', 'd'].map((s) => r.cellsOf(s)[0]), B = ['e', 'f', 'g', 'h'].map((s) => r.cellsOf(s)[1]); r.store(A); r.store(B);
  const back = r.settle([A[0], A[1]]); ok(A.every((x) => back.has(x)) && !B.some((x) => back.has(x)), 'completion brings back A only'); }
// binding a sample: two cells per part; one part brings back the others
{ const r = new Region({ C: 8 }); const P = [0, 1, 2].map((k) => ['p', 'q', 'r', 's'].map((s) => r.cellsOf(s + k)[0])); P.forEach((p) => r.store(p)); r.bind(P);
  const back = r.settle(P[0]); ok(P.flat().every((x) => back.has(x)), 'binding: one part brings back the whole'); }
// reading: the column is identity, the cell context; after one reading, "the cat eats fish" / "the dog eats meat" predicts sharply
{ const r = new Region({ C: 16, context: 2 }); const read = (s) => { r.reset(); for (const w of s.split(' ')) r.step(w); };
  read('the cat eats fish'); read('the dog eats meat');
  const pred = (s) => { r.reset(); for (const w of s.split(' ')) r.step(w, false); return new Set([...r.predicted().keys()].map((c) => r.symOf(c))); };
  const p1 = pred('the cat eats'), p2 = pred('the dog eats');
  ok(p1.has('fish') && !p1.has('meat'), 'after "the cat eats": fish, not meat'); ok(p2.has('meat') && !p2.has('fish'), 'after "the dog eats": meat, not fish'); }
// no list of assemblies: the region holds only columns, segments, the index and use counts
{ const r = new Region(); ok(Object.keys(r).sort().join(',') === 'C,K,cols,feeds,past,segs,used,work', 'only cells-level state'); }
console.log(`cells engine: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);

// C178 · build check (before the hypothesis): times one digit and the second-row way of working, each kept with the view
// at the start of one page of its kind; on new pages the start brings up the right one; offering still works
'use strict';
const src = require('fs').readFileSync(__dirname + '/learn.js', 'utf8').split("const out = ['C178")[0];
const mod = { exports: {} };
new Function('require', 'module', 'exports', 'process', src + ';module.exports={secondRowLesson,secondRowRight,START};')(require, mod, mod.exports, process);
const { secondRowLesson, secondRowRight, START } = mod.exports;
const M = require('./memory');
const { S, H } = require('./teacher');
const { viewOf } = M;
const mem = M.buildMemory({ tieFirstFormed: true });
const p1 = M.lesson('×', [4, 7, 2], [6]), p2 = secondRowLesson([3, 1, 8], [4, 7]);
const fT = M.keepFrame(mem, { reads: H.reads, hold: 0, s: H.s, u: H.u, k: H.k, w: H.w, mv: H.mv }, '×', viewOf(p1.page, 10));
const fS = M.keepFrame(mem, { reads: S.reads, hold: 0, s: S.s, u: S.u, k: S.k, mv: S.mv }, '×', viewOf(p2.page, START));
console.log('views:', viewOf(p1.page, 10).length, 'and', viewOf(p2.page, START).length, 'things in view');
const r = M.rng(4); const tally = { t: new Map(), s: new Map() }; let okT = 0, okS = 0;
for (let i = 0; i < 10; i++) {
  const top = M.digitsOf(r, 2 + i % 4), m1 = M.digitsOf(r, 1), m2 = M.digitsOf(r, 2);
  const a = M.lesson('×', top, m1), ra = M.runPage(mem, '×', a.page, null, null);
  if (M.right('×', top, m1, ra.content)) okT++; const ka = [...ra.log.startFr].join('+'); tally.t.set(ka, (tally.t.get(ka) || 0) + 1);
  const b = secondRowLesson(top, m2), rb = M.runPage(mem, '×', b.page, null, null, START);
  if (secondRowRight(top, m2, rb.content)) okS++; const kb = [...rb.log.startFr].join('+'); tally.s.set(kb, (tally.s.get(kb) || 0) + 1);
}
console.log(`times-one pages: right ${okT}/10, started ${[...tally.t]}; second-row pages: right ${okS}/10, started ${[...tally.s]} (times one is ${fT}, second row is ${fS})`);

// C177 · build check (before the hypothesis): the hand-written second-row way of working, offered in the one memory on a
// second-row lesson page, settles and is right; times one digit offered there doesn't
'use strict';
const src = require('fs').readFileSync(__dirname + '/learn.js', 'utf8').split("const out = ['C177")[0];
const mod = { exports: {} };
new Function('require', 'module', 'exports', 'process', src + ';module.exports={secondRowLesson,secondRowRight,START};')(require, mod, mod.exports, process);
const { secondRowLesson, secondRowRight, START } = mod.exports;
const { buildMemory, keepFrameNoLink, runPage, rng, digitsOf } = require('./memory');
const { S, H } = require('./teacher');
const mem = buildMemory({ tieFirstFormed: true });
const fs_ = keepFrameNoLink(mem, { reads: S.reads, hold: 0, s: S.s, u: S.u, k: S.k, mv: S.mv });
const fh = keepFrameNoLink(mem, { reads: H.reads, hold: 0, s: H.s, u: H.u, k: H.k, w: H.w, mv: H.mv });
const r = rng(4); let set = 0, ok = 0, setH = 0; let t = Date.now();
for (let i = 0; i < 10; i++) {
  const top = digitsOf(r, 2 + i % 4), mult = digitsOf(r, 2);
  const { page, target } = secondRowLesson(top, mult);
  if (runPage(mem, '×', page, target, fs_, START).log.settled) set++;
  if (secondRowRight(top, mult, runPage(mem, '×', page, null, fs_, START).content)) ok++;
  if (runPage(mem, '×', page, target, fh, START).log.settled) setH++;
}
console.log('second-row way of working: settled', set, '/10, right', ok, '/10; times one digit settled', setH, '/10;', ((Date.now() - t) / 30).toFixed(0), 'ms a run');
// after the fix: offering times one digit in a memory where the second-row way of working is kept and linked
const mem2 = buildMemory({ tieFirstFormed: true });
const a = keepFrameNoLink(mem2, { reads: S.reads, hold: 0, s: S.s, u: S.u, k: S.k, mv: S.mv });
const b = keepFrameNoLink(mem2, { reads: H.reads, hold: 0, s: H.s, u: H.u, k: H.k, w: H.w, mv: H.mv });
const r2 = rng(4); let sa = 0, sb = 0, rec = 0;
for (let i = 0; i < 10; i++) { const top = digitsOf(r2, 2 + i % 4), mult = digitsOf(r2, 2); const { page, target } = secondRowLesson(top, mult); if (runPage(mem2, '×', page, target, a, START).log.settled) sa++; if (runPage(mem2, '×', page, target, b, START).log.settled) sb++; if (runPage(mem2, '×', page, target, null, START).log.settled) rec++; }
console.log('with the second-row way of working kept: offering it settled', sa, '/10; offering times one digit settled', sb, '/10; recall alone settled', rec, '/10');

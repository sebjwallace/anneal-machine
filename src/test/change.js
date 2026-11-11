// ENGINE TEST · change: C23's worlds (tested where trained) and C24's (tested in a place never seen), on the engine.
'use strict';
const path = require('path');
const { CATALOGUE, rng } = require(path.join(__dirname, '../worlds/catalogue.js'));
const { SW, SH } = require(path.join(__dirname, '../engine/see.js'));
const { SceneWorld } = require(path.join(__dirname, '../worlds/scenes.js'));
const { Codes } = require(path.join(__dirname, '../engine/cells.js')), { Change } = require(path.join(__dirname, '../engine/change.js'));
const { load } = require(path.join(__dirname, 'world.js'));
const W = new SceneWorld(CATALOGUE), m = load(), C = new Codes(m), S = W.shapes, PX = SW * SH;
const scene = (list) => { const x = new Uint8Array(PX); for (const [pts, ox, oy] of list) for (const [a, b] of pts) { const p = ox + a, q = oy + b; if (p >= 0 && q >= 0 && p < SW && q < SH) x[q * SW + p] = 1; } return x; };
const roof = ([px, py]) => (e) => { const out = []; let d = 0; for (let k = 0; k < 16; k++) { out.push([scene([[S.chevron, px + d, py], [S.box, px + 1, py + 2]]), null]); d = d === 0 ? (e() < 0.5 ? -1 : 1) : 0; } return out; };
const move = (y) => () => Array.from({ length: 11 }, (_, x) => [scene([[S.stick, x, y]]), null]);
const two = (y) => () => Array.from({ length: 8 }, (_, x) => [scene([[S.stick, x, y], [S.stick, x + 4, y]]), null]);
const still = (y, sx, sy) => () => Array.from({ length: 11 }, (_, x) => [scene([[S.stick, x, y], [S.stick, sx, sy]]), null]);
const bounce = (y, ctx) => (e) => { const out = []; let x = Math.floor(e() * 11), d = 1; for (let k = 0; k < 30; k++) { out.push([scene([[S.stick, x, y]]), ctx ? (d > 0 ? 'right' : 'left') : null]); if (x + d < 0 || x + d > 10) d = -d; x += d; } return out; };
const rowsC23 = (gen) => (e) => gen(e);   // C23: trained and tested in the same places
const WORLDS = [
  ['roof slides (branch)', [[roof([1, 1]), 15], [roof([6, 5]), 15]], roof([2, 6]), [roof([1, 1]), roof([6, 5])]],
  ['one stick moving right', [[move(1), 1]], move(7), [move(1)]],
  ['two sticks moving together', [[two(2), 1]], two(6), [two(2)]],
  ['one moving, one staying', [[still(1, 8, 7), 1]], still(5, 2, 9), [still(1, 8, 7)]],
  ['bouncing, no context', [[bounce(4, false), 4]], bounce(8, false), [bounce(4, false)]],
  ['bouncing, direction as context', [[bounce(4, true), 4]], bounce(8, true), [bounce(4, true)]],
  ['bouncing, context, trained on 2 rows', [[bounce(1, true), 4], [bounce(4, true), 4]], bounce(8, true), [bounce(1, true), bounce(4, true)]],
];
const key = (c) => c.col.id + '|' + c.x + ',' + c.y, same = (P, T) => P.length === T.length && P.every((c) => T.some((d) => key(d) === key(c)));
const nowCache = new Map(), nowOf = (L, x) => { let n = nowCache.get(x); if (!n) { n = L.now(x); nowCache.set(x, n); } return n; };
console.log('ENGINE TEST · change. Next state right: no cue / with cue. (C23/C24 results on the old code in brackets.)\n');
console.log('world'.padEnd(38) + 'changes kept   trained place        new place            moving thing seen as two');
const OLD = { 'roof slides (branch)': ['80/100', '75/100'], 'one stick moving right': ['100/100', '100/100'], 'two sticks moving together': ['100/100', '100/100'], 'one moving, one staying': ['100/100', '100/100 (luck)'], 'bouncing, no context': ['59/100', '47/100'], 'bouncing, direction as context': ['100/100', '93/93'], 'bouncing, context, trained on 2 rows': ['100/100', '93/100'] };
for (const [name, trains, test, trainedTests] of WORLDS) {
  const e = rng(1), L = new Change(C), runs = []; for (const [gen, n] of trains) for (let k = 0; k < n; k++) runs.push(gen(e));
  for (const run of runs) for (let t = 1; t + 1 < run.length; t++) L.learn(L.state(nowOf(L, run[t][0]), nowOf(L, run[t - 1][0]), run[t][1]), nowOf(L, run[t + 1][0]));
  const nk = L.rest();
  let dbl = 0, cnt = 0;
  const score = (testRuns) => { let n = 0, a = 0, b = 0; for (const run of testRuns) for (let t = 1; t + 1 < run.length; t++) { const A = L.state(nowOf(L, run[t][0]), nowOf(L, run[t - 1][0]), run[t][1]), B = nowOf(L, run[t + 1][0]), ka = new Set(L.nowOf(A).map(key)), cue = B.filter((c) => !ka.has(key(c))).slice(0, 1);
    const p = L.predict(A, []); n++; if (same(p, B)) a++; if (same(L.predict(A, cue), B)) b++; cnt++; const per = (Q) => { const mm = new Map(); for (const c of Q) mm.set(c.col.id, (mm.get(c.col.id) || 0) + 1); return mm; }, pp = per(p), bb = per(B); for (const [k2, v] of pp) if (v > (bb.get(k2) || 0)) { dbl++; break; } }
    return `${(100 * a / n).toFixed(0)}% / ${(100 * b / n).toFixed(0)}%`; };
  const f = rng(2), trainedRuns = trainedTests.flatMap((g) => [g(f), g(f)]), newRuns = [test(f), test(f), test(f), test(f)];
  const tr = score(trainedRuns), nw = score(newRuns);
  console.log(name.padEnd(38) + String(nk).padEnd(15) + (tr + ' (' + OLD[name][0] + ')').padEnd(21) + (nw + ' (' + OLD[name][1] + ')').padEnd(21) + dbl + ' of ' + cnt);
}

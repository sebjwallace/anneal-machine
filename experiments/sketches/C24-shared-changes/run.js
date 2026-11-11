// C24: decomposed transitions. Train in some places, test in places never seen. C23's exact memory vs C24.
'use strict';
const path = require('path');
const { CATALOGUE, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model, SceneWorld, SW, SH } = require(path.join(__dirname, '../../models/flow.js'));
const { Codes } = require(path.join(__dirname, '../../models/codes.js'));
const { Transitions } = require(path.join(__dirname, '../../models/transitions.js'));
const { Shared } = require(path.join(__dirname, '../../models/shared.js'));
const W = new SceneWorld(CATALOGUE), r0 = rng(4242), m = new Model('FL', {});
for (let t = 1; t <= 600; t++) { m.step(W.next(r0, 0).x); if (t % 98 === 0) m.rest(); } m.rest();
const C = new Codes(m, {}), S = W.shapes, PX = SW * SH;
const scene = (list) => { const x = new Uint8Array(PX); for (const [pts, ox, oy] of list) for (const [a, b] of pts) { const p = ox + a, q = oy + b; if (p >= 0 && q >= 0 && p < SW && q < SH) x[q * SW + p] = 1; } return x; };
const roof = ([px, py]) => (e) => { const out = []; let d = 0; for (let k = 0; k < 16; k++) { out.push([scene([[S.chevron, px + d, py], [S.box, px + 1, py + 2]]), null]); d = d === 0 ? (e() < 0.5 ? -1 : 1) : 0; } return out; };
const move = (y) => () => Array.from({ length: 11 }, (_, x) => [scene([[S.stick, x, y]]), null]);
const two = (y) => () => Array.from({ length: 8 }, (_, x) => [scene([[S.stick, x, y], [S.stick, x + 4, y]]), null]);
const still = (y, sx, sy) => () => Array.from({ length: 11 }, (_, x) => [scene([[S.stick, x, y], [S.stick, sx, sy]]), null]);
const bounce = (y, ctx) => (e) => { const out = []; let x = Math.floor(e() * 11), d = 1; for (let k = 0; k < 30; k++) { out.push([scene([[S.stick, x, y]]), ctx ? (d > 0 ? 'right' : 'left') : null]); if (x + d < 0 || x + d > 10) d = -d; x += d; } return out; };
// [name, training worlds (each run n times), test world in a NEW place]
const WORLDS = [
  ['roof slides (branch)', [[roof([1, 1]), 15], [roof([6, 5]), 15]], roof([2, 6])],
  ['one stick moving right', [[move(1), 1]], move(7)],
  ['two sticks moving together', [[two(2), 1]], two(6)],
  ['one moving, one staying', [[still(1, 8, 7), 1]], still(5, 2, 9)],
  ['bouncing, no context', [[bounce(4, false), 4]], bounce(8, false)],
  ['bouncing, direction as context', [[bounce(4, true), 4]], bounce(8, true)],
  ['bouncing, context, trained on 2 rows', [[bounce(1, true), 4], [bounce(4, true), 4]], bounce(8, true)],
];
const key = (c) => c.col.id + '|' + c.x + ',' + c.y, sc = (L) => L.filter((c) => !String(c.col.id).startsWith('ctx:')), same = (P, T) => { const a = sc(P), b = sc(T); return a.length === b.length && a.every((c) => b.some((d) => key(d) === key(c))); };
const enc = (s, T) => s.cells || (s.cells = T.state(s.x, s.ctx));
const T0 = new Transitions(C, 'changes');
console.log('C24 · shared changes. Trained in some places, tested in a place never seen. Next state right: no cue / with cue.\n');
console.log('world'.padEnd(38) + 'shared changes   C23 exact, new place   C24, new place   C24, trained place');
for (const [name, trains, test] of WORLDS) {
  const e = rng(1), trainRuns = []; for (const [gen, n] of trains) for (let k = 0; k < n; k++) trainRuns.push(gen(e).map(([x, ctx]) => ({ x, ctx })));
  const testRuns = Array.from({ length: 4 }, () => test(e).map(([x, ctx]) => ({ x, ctx })));
  const ex = new Transitions(C, 'changes'), sh = new Shared(C);
  for (const run of trainRuns) for (let k = 0; k + 1 < run.length; k++) { const A = enc(run[k], T0), B = enc(run[k + 1], T0); ex.learn(A, B); sh.learn(A, B); }
  const nShared = sh.rest();
  const score = (P, runs) => { let n = 0, a = 0, b = 0; for (const run of runs) for (let k = 0; k + 1 < run.length; k++) { const A = enc(run[k], T0), B = enc(run[k + 1], T0), ka = new Set(A.map(key)), cue = sc(B).filter((c) => !ka.has(key(c))).slice(0, 1);
    n++; if (same(P.predict(A, []), B)) a++; if (same(P.predict(A, cue), B)) b++; } return `${(100 * a / n).toFixed(0)}% / ${(100 * b / n).toFixed(0)}%`; };
  console.log(name.padEnd(38) + String(nShared).padEnd(17) + score(ex, testRuns).padEnd(23) + score(sh, testRuns).padEnd(17) + score(sh, trainRuns.slice(0, 4)));
  if (process.env.LIST) for (const s of sh.shared.values()) console.log('    ×' + s.n + '  before: ' + s.bef.map(key).join(' ') + '  after: ' + s.aft.map(key).join(' '));
}

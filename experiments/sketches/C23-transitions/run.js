// C23: transition memory. Learns shapes with C20, cells as C21, then learns transitions between settled states.
'use strict';
const path = require('path');
const { CATALOGUE, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model, SceneWorld, SW, SH } = require(path.join(__dirname, '../../models/flow.js'));
const { Codes } = require(path.join(__dirname, '../../models/codes.js'));
const { Transitions } = require(path.join(__dirname, '../../models/transitions.js'));
const W = new SceneWorld(CATALOGUE), r0 = rng(4242), m = new Model('FL', {});
for (let t = 1; t <= 600; t++) { m.step(W.next(r0, 0).x); if (t % 98 === 0) m.rest(); } m.rest();
const C = new Codes(m, {}), S = W.shapes, PX = SW * SH;
const scene = (list) => { const x = new Uint8Array(PX); for (const [pts, ox, oy] of list) for (const [a, b] of pts) { const p = ox + a, q = oy + b; if (p >= 0 && q >= 0 && p < SW && q < SH) x[q * SW + p] = 1; } return x; };

// ---- the step-by-step worlds: each returns a list of [scene, context] for one run
const HOUSES = [[1, 1], [6, 5], [2, 6]];
const FAM = {
  'roof slides (branch at the normal house)': (e) => { const [px, py] = HOUSES[Math.floor(e() * HOUSES.length)], out = []; let d = 0;
    for (let k = 0; k < 16; k++) { out.push([scene([[S.chevron, px + d, py], [S.box, px + 1, py + 2]]), null]); d = d === 0 ? (e() < 0.5 ? -1 : 1) : 0; } return out; },
  'one stick moving right': (e) => { const y = 1 + Math.floor(e() * 3) * 3, out = []; for (let x = 0; x < 11; x++) out.push([scene([[S.stick, x, y]]), null]); return out; },
  'two sticks moving together': (e) => { const y = 2 + Math.floor(e() * 2) * 4, out = []; for (let x = 0; x < 8; x++) out.push([scene([[S.stick, x, y], [S.stick, x + 4, y]]), null]); return out; },
  'one moving, one staying': (e) => { const out = []; for (let x = 0; x < 11; x++) out.push([scene([[S.stick, x, 1], [S.stick, 8, 7]]), null]); return out; },
  'bouncing stick, no context': (e) => { const out = []; let x = Math.floor(e() * 11), d = 1; for (let k = 0; k < 30; k++) { out.push([scene([[S.stick, x, 4]]), null]); if (x + d < 0 || x + d > 10) d = -d; x += d; } return out; },
  'bouncing stick, direction held as context': (e) => { const out = []; let x = Math.floor(e() * 11), d = 1; for (let k = 0; k < 30; k++) { out.push([scene([[S.stick, x, 4]]), d > 0 ? 'right' : 'left']); if (x + d < 0 || x + d > 10) d = -d; x += d; } return out; },
};
const key = (c) => c.col.id + '|' + c.x + ',' + c.y, sc = (L) => L.filter((c) => !String(c.col.id).startsWith('ctx:')), same = (A0, B0) => { const A = sc(A0), B = sc(B0); return A.length === B.length && A.every((c) => B.some((d) => key(d) === key(c))); };
const doubled = (P0, T0) => { const P = sc(P0), T = sc(T0); const n = (L) => { const m2 = new Map(); for (const c of L) m2.set(c.col.id, (m2.get(c.col.id) || 0) + 1); return m2; }, a = n(P), b = n(T); for (const [k, v] of a) if (v > (b.get(k) || 0)) return true; return false; };

console.log('C23 · transition memory. States are settled scenes ("where" cells; a held context is not scored); 30 training runs and 4 test runs per world.\n');
console.log('world'.padEnd(44) + 'version   next state right: no cue / with cue   moving thing seen as two');
for (const [name, gen] of Object.entries(FAM)) {
  const runs = (seed, n) => { const e = rng(seed); return Array.from({ length: n }, () => gen(e).map(([x, ctx]) => ({ x, ctx }))); };
  const train = runs(1, 30), test = runs(2, 4);
  for (const mode of ['whole', 'changes']) { const T = new Transitions(C, mode); const enc = (s) => s.cells || (s.cells = T.state(s.x, s.ctx));
    for (const run of train) for (let k = 0; k + 1 < run.length; k++) T.learn(enc(run[k]), enc(run[k + 1]));
    let n = 0, ok = 0, okc = 0, dbl = 0;
    for (const run of test) for (let k = 0; k + 1 < run.length; k++) { const A = enc(run[k]), B = enc(run[k + 1]), ka = new Set(A.map(key)), cue = B.filter((c) => !ka.has(key(c))).slice(0, 1);
      const p = T.predict(A, []), pc = T.predict(A, cue); n++; if (same(p, B)) ok++; if (same(pc, B)) okc++; if (doubled(p, B)) dbl++; }
    console.log((mode === 'whole' ? name : '').padEnd(44) + mode.padEnd(10) + `${(100 * ok / n).toFixed(0)}% / ${(100 * okc / n).toFixed(0)}%`.padEnd(32) + `${dbl} of ${n}`); }
}
// generalisation: a stick moving right, trained on rows 1 and 4, tested on row 7 (a place never seen moving)
{ const mk = (y) => Array.from({ length: 11 }, (_, x) => ({ x: scene([[S.stick, x, y]]) }));
  for (const mode of ['whole', 'changes']) { const T = new Transitions(C, mode), enc = (s) => s.cells || (s.cells = T.state(s.x));
    for (const y of [1, 4]) { const run = mk(y); for (let k = 0; k + 1 < run.length; k++) T.learn(enc(run[k]), enc(run[k + 1])); }
    const run = mk(7); let ok = 0; for (let k = 0; k + 1 < run.length; k++) if (same(T.predict(enc(run[k]), []), enc(run[k + 1]))) ok++;
    console.log(`\nnew place: stick moving right on a row never seen moving, ${mode}: next state right ${ok} of ${run.length - 1}`); } }

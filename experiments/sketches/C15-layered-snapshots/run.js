// C15 layered snapshots: per layer, columns and heat; overall heat (most specific layer that matched, else deepest); held-out
// new shapes; filling in 30% missing; cells. Thresholds 90, 80, 70, 60, 50% unless set.
'use strict';
const path = require('path');
const { CATALOGUE, noisy, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model } = require(path.join(__dirname, '../../models/snapstack.js'));
const P = CATALOGUE.patterns, PX = 25, ids = P.filter((p) => p.family !== 'bar triples').map((p) => p.id), held = P.filter((p) => p.family === 'bar triples').map((p) => p.id);
const PASSES = 20, ink = (b) => b.reduce((a, x) => a + x, 0), ham = (a, b) => { let d = 0; for (let i = 0; i < PX; i++) d += a[i] !== b[i]; return d; };
function drop(b, r) { const y = b.slice(); for (let i = 0; i < PX; i++) if (y[i] && r() < 0.3) y[i] = 0; return y; }
function run(arm, o, noise, seed) {
  const r = rng(seed * 7919 + 13), m = new Model(arm, o);
  for (let p = 0; p < PASSES; p++) { const ord = ids.slice(); for (let i = ord.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ord[i], ord[j]] = [ord[j], ord[i]]; } for (const id of ord) m.step(noisy(P[id].bits, noise, r)); }
  const E = { cols: m.layers.map((L) => L.cols.length), lheat: m.layers.map(() => 0), heat: 0, from: m.layers.map(() => 0) };
  for (const id of ids) { const q = m.read(P[id].bits), n = ink(P[id].bits); E.heat += (q.left.length + q.misses) / n / ids.length; E.from[q.from] += 1;
    q.per.forEach((p, i) => { E.lheat[i] += (p.left.length + p.misses) / n / ids.length; }); }
  E.held = held.reduce((a, id) => { const q = m.read(P[id].bits); return a + (q.left.length + q.misses) / ink(P[id].bits); }, 0) / held.length;
  const e = rng(seed + 999); let miss = 0, nz = 0, c = 0; E.fromMissing = m.layers.map(() => 0); E.fromNoisy = m.layers.map(() => 0);
  for (const id of ids) for (let v = 0; v < 3; v++) { const qm = m.read(drop(P[id].bits, e)), qn = m.read(noisy(P[id].bits, 0.15, e));
    miss += ham(qm.recon, P[id].bits); nz += ham(qn.recon, P[id].bits); E.fromMissing[qm.from]++; E.fromNoisy[qn.from]++; c++; }
  E.fromMissing = E.fromMissing.map((v) => (100 * v) / c); E.fromNoisy = E.fromNoisy.map((v) => (100 * v) / c);
  E.missing = miss / c; E.err15 = nz / c; E.cells = m.cellCount(); return E;
}
const f = (a, d = 2) => a.map((v) => v.toFixed(d)).join(' ');
console.log('98 patterns x 20 passes, seeds 1,2. Doing nothing: missing 2.15, 15% noise 3.80. "answered by" = which layer gave the overall picture (clean patterns).');
const ONLY = process.env.ONLY ? process.env.ONLY.split('|') : null;
for (const measure of ['agree', 'overlap']) for (const noise of [0, 0.05]) for (const arm of ['LF', 'LA']) for (const after of ['deeper', 'none']) {
  if (ONLY && !ONLY.includes(`${measure} ${noise} ${arm} ${after}`)) continue;
  const o = { measure, after }, R = [1, 2].map((s) => run(arm, o, noise, s)), av = (k) => R[0][k].map((_, i) => R.reduce((a, q) => a + q[k][i], 0) / R.length), sc = (k) => R.reduce((a, q) => a + q[k], 0) / R.length;
  console.log(`\n${measure === 'agree' ? 'all-pixel' : 'overlap'} · noise ${noise * 100}% · ${arm} · after: ${after}`);
  console.log(`  columns per layer ${f(av('cols'), 0)} · each layer's heat ${f(av('lheat'))} · overall heat ${sc('heat').toFixed(2)} · answered by layer ${f(av('from'), 0)}`);
  console.log(`  held-out new shapes ${sc('held').toFixed(2)} · missing 30% error ${sc('missing').toFixed(2)} · 15% noise error ${sc('err15').toFixed(2)} · cells ${sc('cells').toFixed(0)}`);
  console.log(`  answered by layer (% of cues): 30% missing ${f(av('fromMissing'), 0)} · 15% noise ${f(av('fromNoisy'), 0)}`);
}

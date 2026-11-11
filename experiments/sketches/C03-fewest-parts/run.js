// C03 runner: arms and budgets side by side, 5 seeds each. Score: columns (structure) against heat (left over + wrong).
'use strict';
const fs = require('fs'), path = require('path');
const { CATALOGUE, noisy, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model, K } = require(path.join(__dirname, '../../models/compress.js'));
const P = CATALOGUE.patterns, PX = 25;
const held = P.filter((p) => p.family === 'bar triples').map((p) => p.id), trainIds = P.filter((p) => p.family !== 'bar triples').map((p) => p.id);
const PASSES = +(process.env.PASSES || 30), SEEDS = [1, 2, 3, 4, 5];
const EXPS = [
  { name: 'R cut once, shrink', arm: 'R', noise: 0.05 },
  { name: 'G grow towards', arm: 'G', noise: 0.05 },
  { name: 'GP + pay its way', arm: 'GP', noise: 0.05 },
  { name: 'GEP + economy', arm: 'GEP', noise: 0.05 },
  { name: 'GEP no noise', arm: 'GEP', noise: 0 },
  { name: 'GEP cap 30', arm: 'GEP', noise: 0.05, cap: 30 },
  { name: 'GEP cap 20', arm: 'GEP', noise: 0.05, cap: 20 },
  { name: 'GEP cap 15', arm: 'GEP', noise: 0.05, cap: 15 },
  { name: 'GEP cap 10', arm: 'GEP', noise: 0.05, cap: 10 },
  // round 2: the price of structure (heat a column must save, per pixel it stores, per rest window)
  ...[2, 4, 8, 16, 32].map((p) => ({ name: `GEP price ${p}`, arm: 'GEP', noise: 0.05, price: p })),
  ...[2, 4, 8, 16, 32].map((p) => ({ name: `GEP price ${p} no noise`, arm: 'GEP', noise: 0, price: p })),
];
const only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const ink = (b) => b.reduce((a, x) => a + x, 0), ham = (a, b) => { let d = 0; for (let i = 0; i < PX; i++) d += a[i] !== b[i]; return d; };
const heatShare = (q, b) => (q.left.length + q.misses) / ink(b);

function evaluate(m, r) {
  const E = {}, tr = trainIds.map((id) => m.read(P[id].bits));
  E.cols = m.cols.length; E.stored = m.cols.reduce((a, c) => a + m.size(c), 0); E.cells = m.cellCount();
  E.heat = tr.reduce((a, q, k) => a + heatShare(q, P[trainIds[k]].bits), 0) / tr.length;
  E.cool = tr.filter((q, k) => heatShare(q, P[trainIds[k]].bits) <= 0.15).length;          // patterns at or under 15% heat
  E.parts = tr.reduce((a, q) => a + q.claims.length, 0) / tr.length;
  E.distinct = new Set(tr.map((q) => q.claims.map((c) => c.c.id).sort((a, b) => a - b).join())).size;
  let nh = 0, ne = 0, n = 0; for (const id of trainIds) for (let v = 0; v < 5; v++) { const q = m.read(noisy(P[id].bits, 0.05, r)); nh += heatShare(q, P[id].bits); ne += ham(q.recon, P[id].bits); n++; }
  E.noisyHeat = nh / n; E.noisyErr = ne / n;
  const h = held.map((id) => m.read(P[id].bits)); E.heldHeat = h.reduce((a, q, k) => a + heatShare(q, P[held[k]].bits), 0) / h.length;
  return E;
}
const art = (c) => { const rows = []; for (let y = 0; y < 5; y++) { let s = ''; for (let x = 0; x < 5; x++) s += c.m[y * 5 + x] >= K.CUT ? '#' : '.'; rows.push(s); } return rows; };
function gallery(m, title) { const cs = [...m.cols].sort((a, b) => b.uses - a.uses); let out = `\n== ${title}: ${cs.length} columns (most used first)\n`;
  for (let i = 0; i < cs.length; i += 14) { const A = cs.slice(i, i + 14).map(art); for (let y = 0; y < 5; y++) out += A.map((a) => a[y]).join('  ') + '\n'; out += '\n'; } return out; }

const keys = ['cols', 'stored', 'cells', 'heat', 'cool', 'parts', 'distinct', 'noisyHeat', 'noisyErr', 'heldHeat', 'ms'], results = []; let gal = '';
for (const X of EXPS) { if (only && !only.has(X.name)) continue; const runs = [];
  for (const seed of SEEDS) { const r = rng(seed * 7919 + 13), m = new Model(X.arm, { ...(X.cap ? { cap: X.cap } : {}), ...(X.price ? { price: X.price } : {}) }), t0 = Date.now();
    for (let p = 0; p < PASSES; p++) for (const id of shuffle(trainIds.slice(), r)) m.step(noisy(P[id].bits, X.noise, r));
    const E = evaluate(m, rng(seed + 999)); E.ms = Date.now() - t0; runs.push(E); if (seed === 1) gal += gallery(m, X.name); }
  const mean = {}, lo = {}, hi = {}; for (const k of keys) { const v = runs.map((E) => E[k]); mean[k] = v.reduce((a, b) => a + b) / v.length; lo[k] = Math.min(...v); hi[k] = Math.max(...v); }
  results.push({ ...X, mean, lo, hi });
}
const f = (v, d = 2) => v.toFixed(d);
console.log(`${trainIds.length} patterns x ${PASSES} passes; seeds ${SEEDS.join(',')}; heat = (left over + wrong) / ink; "cool" = patterns at or under 15% heat (of ${trainIds.length})`);
console.log(['experiment'.padEnd(20), 'cols', 'range', 'px', 'cells', 'heat', 'cool', 'parts', 'dist', 'nHeat', 'nErr', 'hHeat', 'ms'].join(' '));
for (const R of results) { const M = R.mean; console.log([R.name.padEnd(20), f(M.cols, 0).padStart(4), `${R.lo.cols}-${R.hi.cols}`.padStart(7), f(M.stored, 0).padStart(4), f(M.cells, 0).padStart(5),
  f(M.heat).padStart(4), f(M.cool, 0).padStart(4), f(M.parts, 1).padStart(5), f(M.distinct, 0).padStart(4), f(M.noisyHeat).padStart(5), f(M.noisyErr).padStart(4), f(M.heldHeat).padStart(5), f(M.ms, 0).padStart(5)].join(' ')); }
fs.writeFileSync(path.join(__dirname, process.env.OUT || 'results.json'), JSON.stringify(results, null, 1));
fs.writeFileSync(path.join(__dirname, process.env.GAL || 'gallery.txt'), gal);

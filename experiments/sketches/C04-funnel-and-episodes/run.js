// C04 runner: the funnel (FP, FS), columns plus episodes (X1), and C03's best (GEP) for comparison. 5 seeds each.
'use strict';
const fs = require('fs'), path = require('path');
const { CATALOGUE, noisy, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { EpisodicModel } = require(path.join(__dirname, '../../models/episodes.js'));
const F = require(path.join(__dirname, '../../models/funnel.js'));
const P = CATALOGUE.patterns, PX = 25;
const held = P.filter((p) => p.family === 'bar triples').map((p) => p.id), trainIds = P.filter((p) => p.family !== 'bar triples').map((p) => p.id);
const PASSES = +(process.env.PASSES || 30), SEEDS = [1, 2, 3, 4, 5];
const make = { GEP: () => new EpisodicModel('GEP'), X1: () => new EpisodicModel('X1'), FP: (o) => new F.Model('FP', o), FS: (o) => new F.Model('FS', o) };
const EXPS = [
  { name: 'GEP columns only (C03)', kind: 'GEP', noise: 0.05 },
  { name: 'X1 columns + episodes', kind: 'X1', noise: 0.05 },
  { name: 'X1 no noise', kind: 'X1', noise: 0 },
  { name: 'FP funnel, parallel', kind: 'FP', noise: 0.05 },
  { name: 'FS funnel, stacked', kind: 'FS', noise: 0.05 },
  { name: 'FP no noise', kind: 'FP', noise: 0 },
];
const only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const ink = (b) => b.reduce((a, x) => a + x, 0), ham = (a, b) => { let d = 0; for (let i = 0; i < PX; i++) d += a[i] !== b[i]; return d; };
const hs = (q, b) => (q.left.length + q.misses) / ink(b);
function dropPart(b, r) { const y = b.slice(); for (let i = 0; i < PX; i++) if (y[i] && r() < 0.3) y[i] = 0; return y; }   // remove ~30% of the pixels

function evaluate(m, r, kind) {
  const E = {}, funnel = kind === 'FP' || kind === 'FS';
  E.cols = m.cols.length; E.eps = m.eps ? m.eps.length : 0; E.cells = m.cellCount();
  const tr = trainIds.map((id) => m.read(P[id].bits));
  E.heat = tr.reduce((a, q, k) => a + hs(q, P[trainIds[k]].bits), 0) / tr.length;
  let nh = 0, n = 0; for (const id of trainIds) for (let v = 0; v < 5; v++) { nh += hs(m.read(noisy(P[id].bits, 0.05, r)), P[id].bits); n++; } E.noisyHeat = nh / n;
  E.heldHeat = held.reduce((a, id) => a + hs(m.read(P[id].bits), P[id].bits), 0) / held.length;
  // completion: wrong pixels against the full pattern, from a cue with ~30% of its pixels removed
  let cb = 0, ca = 0, ce = 0, added = 0; n = 0;
  for (const id of trainIds) for (let v = 0; v < 3; v++) { const cue = dropPart(P[id].bits, r);
    if (funnel) { const c = m.complete(cue); cb += ham(c.before, P[id].bits); ca += ham(c.after, P[id].bits); ce += ham(c.every, P[id].bits); added += c.added; }
    else { const q = m.read(cue); cb += ham(cue, P[id].bits); ca += ham(q.recon, P[id].bits); } n++; }
  E.cueErr = funnel ? cb / n : cb / n; E.completeErr = ca / n; E.everyErr = funnel ? ce / n : NaN; E.added = added / n;
  // assembly: the same cells under 5% noise as for the clean pattern
  let same = 0; n = 0; const key = (q) => q.cells.map((z) => z.cell.id).sort((a, b) => a - b).join();
  for (let k = 0; k < trainIds.length; k++) { const k0 = key(tr[k]); for (let v = 0; v < 3; v++) { if (k0 && key(m.read(noisy(P[trainIds[k]].bits, 0.05, r))) === k0) same++; n++; } }
  E.cellStable = same / n;
  E.layerHeat = funnel ? m.layers.map((L, li) => tr.reduce((a, q, k) => a + hs(q.per[li], P[trainIds[k]].bits), 0) / tr.length) : null;
  E.layerCols = funnel ? m.layers.map((L) => L.cols.length) : null;
  return E;
}
const art = (c) => { const rows = []; for (let y = 0; y < 5; y++) { let s = ''; for (let x = 0; x < 5; x++) s += c.m[y * 5 + x] >= 0.5 ? '#' : '.'; rows.push(s); } return rows; };
function gallery(cols, title) { const cs = [...cols].sort((a, b) => b.uses - a.uses); let out = `\n== ${title}: ${cs.length} columns (most used first)\n`;
  for (let i = 0; i < cs.length; i += 16) { const A = cs.slice(i, i + 16).map(art); for (let y = 0; y < 5; y++) out += A.map((a) => a[y]).join('  ') + '\n'; out += '\n'; } return out; }

const keys = ['cols', 'eps', 'cells', 'heat', 'noisyHeat', 'heldHeat', 'cueErr', 'completeErr', 'everyErr', 'added', 'cellStable', 'ms'], results = []; let gal = '';
for (const X of EXPS) { if (only && !only.has(X.name)) continue; const runs = [];
  for (const seed of SEEDS) { const r = rng(seed * 7919 + 13), m = make[X.kind](), t0 = Date.now();
    for (let p = 0; p < PASSES; p++) for (const id of shuffle(trainIds.slice(), r)) m.step(noisy(P[id].bits, X.noise, r));
    const ms = Date.now() - t0, E = evaluate(m, rng(seed + 999), X.kind); E.ms = ms; runs.push(E);
    if (seed === 1) { if (m.layers) m.layers.forEach((L, i) => { gal += gallery(L.cols, `${X.name}, layer ${i + 1} (size ${L.n})`); }); else gal += gallery(m.cols, X.name); } }
  const mean = {}; for (const k of keys) mean[k] = runs.reduce((a, E) => a + E[k], 0) / runs.length;
  if (runs[0].layerHeat) { mean.layerHeat = runs[0].layerHeat.map((_, i) => runs.reduce((a, E) => a + E.layerHeat[i], 0) / runs.length); mean.layerCols = runs[0].layerCols.map((_, i) => runs.reduce((a, E) => a + E.layerCols[i], 0) / runs.length); }
  results.push({ ...X, mean, colsRange: [Math.min(...runs.map((E) => E.cols)), Math.max(...runs.map((E) => E.cols))] });
}
const f = (v, d = 2) => (Number.isNaN(v) ? '  - ' : v.toFixed(d));
console.log(`${trainIds.length} patterns x ${PASSES} passes; seeds ${SEEDS.join(',')}. heat = (left over + wrong)/ink. completion: cue = pattern with ~30% of pixels removed; errors = wrong pixels vs full pattern`);
console.log(['experiment'.padEnd(24), 'cols', 'eps', 'cells', 'heat', 'nHeat', 'hHeat', 'cueErr', 'compl', 'every', 'added', 'cStab', 'ms'].join(' '));
for (const R of results) { const M = R.mean; console.log([R.name.padEnd(24), f(M.cols, 0).padStart(4), f(M.eps, 0).padStart(4), f(M.cells, 0).padStart(5), f(M.heat).padStart(4), f(M.noisyHeat).padStart(5),
  f(M.heldHeat).padStart(5), f(M.cueErr).padStart(6), f(M.completeErr).padStart(5), f(M.everyErr).padStart(5), f(M.added, 1).padStart(5), f(M.cellStable).padStart(5), f(M.ms, 0).padStart(5)].join(' '));
  if (M.layerHeat) console.log('    per layer (size: columns used, heat alone): ' + M.layerHeat.map((h, i) => `${[100, 50, 25, 12, 6][i]}: ${M.layerCols[i].toFixed(0)} cols, ${h.toFixed(2)}`).join(' | ')); }
fs.writeFileSync(path.join(__dirname, process.env.OUT || 'results.json'), JSON.stringify(results, null, 1));
fs.writeFileSync(path.join(__dirname, process.env.GAL || 'gallery.txt'), gal);

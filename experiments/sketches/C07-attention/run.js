// C07 attention cascade. All arms: funnel 100,50,25,13,6, plasticity 0.4 (wide) -> 0.025 (narrow), 5% noise, shuffled.
// Tests, first sight and no learning: clean heat; seeing through 15% noise; filling in 30% missing; new shapes made of known
// parts; wrong pixels on their own (the blind spot); work = columns checked per flash.
'use strict';
const fs = require('fs'), path = require('path');
const { CATALOGUE, noisy, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model } = require(path.join(__dirname, '../../models/funnel.js'));
const P = CATALOGUE.patterns, PX = 25, trainIds = P.filter((p) => p.family !== 'bar triples').map((p) => p.id);
const FLASHES = +(process.env.FLASHES || 6000), SEEDS = [1, 2, 3], ARMS = (process.env.ARMS || 'FP,AG,AGL,AD').split(',');
const geo = (a, b, n) => Array.from({ length: n }, (_, i) => a * Math.pow(b / a, i / (n - 1)));
// FLIP=1: plasticity reversed (the narrow, generic layers fast; the wide, detailed layers slow)
const OPT = { sizes: [100, 50, 25, 13, 6], plastic: process.env.FLIP ? geo(0.025, 0.4, 5) : geo(0.4, 0.025, 5), forget: true };
const ink = (b) => b.reduce((a, x) => a + x, 0), ham = (a, b) => { let d = 0; for (let i = 0; i < PX; i++) d += a[i] !== b[i]; return d; };
// NEW SHAPES: pairs of small known patterns overlaid (at most one shared pixel, not already in the catalogue), plus the 6 held-out triples
const known = new Set(P.map((p) => p.bits.join(''))), newShapes = P.filter((p) => p.family === 'bar triples').map((p) => ({ name: p.name, bits: p.bits }));
{ const r = rng(77), small = trainIds.filter((i) => ink(P[i].bits) <= 6); let tries = 0;
  while (newShapes.length < 30 && tries++ < 5000) { const a = small[Math.floor(r() * small.length)], b = small[Math.floor(r() * small.length)]; if (a === b) continue;
    const u = P[a].bits.map((v, i) => v | P[b].bits[i]); let ov = 0; for (let i = 0; i < PX; i++) ov += P[a].bits[i] & P[b].bits[i];
    const k = u.join(''); if (ov <= 1 && !known.has(k)) { known.add(k); newShapes.push({ name: `"${P[a].name}" + "${P[b].name}"`, bits: Uint8Array.from(u) }); } } }
function drop(b, r) { const y = b.slice(); for (let i = 0; i < PX; i++) if (y[i] && r() < 0.3) y[i] = 0; return y; }

function run(arm, seed) {
  const r = rng(seed * 7919 + 13), m = new Model(arm, { ...OPT, seed }); let order = [], oi = 0, work = 0, nw = 0;
  for (let t = 0; t < FLASHES; t++) { if (oi >= order.length) { order = trainIds.slice(); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } oi = 0; }
    const out = m.step(noisy(P[order[oi++]].bits, 0.05, r)); if (t >= FLASHES - 1000) { work += out.work; nw++; } }
  const e = rng(seed + 999), E = { cols: m.cols.length, workTrain: work / nw };
  let h = 0, wr = 0, wk = 0; for (const id of trainIds) { const q = m.read(P[id].bits), n = ink(P[id].bits); h += (q.left.length + q.misses) / n; wr += q.misses / n; wk += q.work; }
  E.heat = h / trainIds.length; E.wrong = wr / trainIds.length; E.work = wk / trainIds.length;
  let n15 = 0, n05 = 0, miss = 0, c = 0; for (const id of trainIds) for (let v = 0; v < 3; v++) { const b = P[id].bits;
    n15 += ham(m.read(noisy(b, 0.15, e)).recon, b); n05 += ham(m.read(noisy(b, 0.05, e)).recon, b); miss += ham(m.read(drop(b, e)).recon, b); c++; }
  E.err5 = n05 / c; E.err15 = n15 / c; E.errMissing = miss / c;
  let nh = 0, nwr = 0; for (const s of newShapes) { const q = m.read(s.bits), n = ink(s.bits); nh += (q.left.length + q.misses) / n; nwr += q.misses / n; }
  E.newHeat = nh / newShapes.length; E.newWrong = nwr / newShapes.length;
  E.layerCols = m.layers.map((L) => L.cols.length);
  return E;
}
// what doing nothing scores (the input itself as the picture), for the seeing-through tests
const base = (() => { const e = rng(999); let a = 0, b = 0, c = 0, n = 0; for (const id of trainIds) for (let v = 0; v < 3; v++) { const x = P[id].bits; a += ham(noisy(x, 0.05, e), x); b += ham(noisy(x, 0.15, e), x); c += ham(drop(x, e), x); n++; } return [a / n, b / n, c / n]; })();
console.log(`${FLASHES} flashes, 5% noise, shuffled; seeds ${SEEDS.join(',')}; ${newShapes.length} new shapes (6 bar triples + ${newShapes.length - 6} overlaid pairs).`);
console.log('heat/wrong as a share of ink; errors = wrong pixels in the rebuilt picture against the clean pattern.');
console.log(`doing nothing: error at 5% noise ${base[0].toFixed(2)}, at 15% ${base[1].toFixed(2)}, with 30% missing ${base[2].toFixed(2)}\n`);
console.log(['arm'.padEnd(5), 'cols', 'heat', 'wrong', 'err5%', 'err15%', 'errMiss', 'newHeat', 'newWrong', 'work(read)', 'work(train)', '  columns per layer'].join(' '));
const res = [];
for (const arm of ARMS) { const R = SEEDS.map((s) => run(arm, s)), av = (k) => R.reduce((a, q) => a + q[k], 0) / R.length;
  const row = { arm, ...Object.fromEntries(['cols', 'heat', 'wrong', 'err5', 'err15', 'errMissing', 'newHeat', 'newWrong', 'work', 'workTrain'].map((k) => [k, av(k)])), layerCols: R[0].layerCols.map((_, i) => R.reduce((a, q) => a + q.layerCols[i], 0) / R.length) };
  res.push(row);
  console.log([arm.padEnd(5), row.cols.toFixed(0).padStart(4), row.heat.toFixed(2).padStart(4), row.wrong.toFixed(2).padStart(5), row.err5.toFixed(2).padStart(5), row.err15.toFixed(2).padStart(6),
    row.errMissing.toFixed(2).padStart(7), row.newHeat.toFixed(2).padStart(7), row.newWrong.toFixed(2).padStart(8), row.work.toFixed(0).padStart(10), row.workTrain.toFixed(0).padStart(11), '  ' + row.layerCols.map((v) => v.toFixed(0)).join(' ')].join(' ')); }
fs.writeFileSync(path.join(__dirname, process.env.FLIP ? 'results-flip.json' : 'results.json'), JSON.stringify({ base, res }, null, 1));

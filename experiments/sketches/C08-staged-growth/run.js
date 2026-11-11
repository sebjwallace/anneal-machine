// C08 staged growth: one small slow layer; when it settles, the next (twice as big) appears. Three ways to build on the layer
// below. Same first-sight tests as C07. Prints when each layer appeared and settled (seed 1).
'use strict';
const fs = require('fs'), path = require('path');
const { CATALOGUE, noisy, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model } = require(path.join(__dirname, '../../models/staged.js'));
const P = CATALOGUE.patterns, PX = 25, trainIds = P.filter((p) => p.family !== 'bar triples').map((p) => p.id);
const FLASHES = +(process.env.FLASHES || 20000), SEEDS = (process.env.SEEDS || '1,2,3').split(',').map(Number), ARMS = (process.env.ARMS || 'SC,SR,SF').split(',');
const OPT = process.env.OPT ? JSON.parse(process.env.OPT) : {};
const ink = (b) => b.reduce((a, x) => a + x, 0), ham = (a, b) => { let d = 0; for (let i = 0; i < PX; i++) d += a[i] !== b[i]; return d; };
const known = new Set(P.map((p) => p.bits.join(''))), newShapes = P.filter((p) => p.family === 'bar triples').map((p) => ({ name: p.name, bits: p.bits }));
{ const r = rng(77), small = trainIds.filter((i) => ink(P[i].bits) <= 6); let tries = 0;
  while (newShapes.length < 30 && tries++ < 5000) { const a = small[Math.floor(r() * small.length)], b = small[Math.floor(r() * small.length)]; if (a === b) continue;
    const u = P[a].bits.map((v, i) => v | P[b].bits[i]); let ov = 0; for (let i = 0; i < PX; i++) ov += P[a].bits[i] & P[b].bits[i];
    const k = u.join(''); if (ov <= 1 && !known.has(k)) { known.add(k); newShapes.push({ bits: Uint8Array.from(u) }); } } }
function drop(b, r) { const y = b.slice(); for (let i = 0; i < PX; i++) if (y[i] && r() < 0.3) y[i] = 0; return y; }
function run(arm, seed, show) {
  const r = rng(seed * 7919 + 13), m = new Model(arm, { seed, ...OPT }); let order = [], oi = 0, work = 0, nw = 0; const curve = [];
  for (let t = 0; t < FLASHES; t++) { if (oi >= order.length) { order = trainIds.slice(); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } oi = 0; }
    const out = m.step(noisy(P[order[oi++]].bits, 0.05, r)); if (t >= FLASHES - 1000) { work += out.work; nw++; } if ((t + 1) % 2000 === 0) curve.push(m.layers.length); }
  if (show) { console.log(`  ${arm} seed ${seed} timeline: ` + m.timeline.map((e) => `${e.t}: ${e.event}`).join(' | ')); }
  const e = rng(seed + 999), E = { cols: m.cols.length, layers: m.layers.length, workTrain: work / nw };
  let h = 0, wr = 0, wk = 0; for (const id of trainIds) { const q = m.read(P[id].bits), n = ink(P[id].bits); h += (q.left.length + q.misses) / n; wr += q.misses / n; wk += q.work; }
  E.heat = h / trainIds.length; E.wrong = wr / trainIds.length; E.work = wk / trainIds.length;
  let n05 = 0, n15 = 0, miss = 0, c = 0; for (const id of trainIds) for (let v = 0; v < 3; v++) { const b = P[id].bits;
    n05 += ham(m.read(noisy(b, 0.05, e)).recon, b); n15 += ham(m.read(noisy(b, 0.15, e)).recon, b); miss += ham(m.read(drop(b, e)).recon, b); c++; }
  E.err5 = n05 / c; E.err15 = n15 / c; E.errMissing = miss / c;
  let nh = 0; for (const s of newShapes) { const q = m.read(s.bits); nh += (q.left.length + q.misses) / ink(s.bits); } E.newHeat = nh / newShapes.length;
  E.layerHeat = m.layers.map((L) => L.ema); E.settled = m.layers.filter((L) => L.settled).length;
  return E;
}
console.log(`${FLASHES} flashes, 5% noise, shuffled; seeds ${SEEDS.join(',')}; options ${JSON.stringify(OPT)}. C07 reference, detail first: heat 0.02, err5 0.88, err15 3.09, missing 3.05, new 0.04, work 297.`);
console.log('doing nothing: err5 1.26, err15 3.80, missing 2.15\n');
const res = [];
for (const arm of ARMS) { const R = SEEDS.map((s, k) => run(arm, s, k === 0)), av = (k) => R.reduce((a, q) => a + q[k], 0) / R.length;
  const row = { arm, ...Object.fromEntries(['layers', 'settled', 'cols', 'heat', 'wrong', 'err5', 'err15', 'errMissing', 'newHeat', 'work'].map((k) => [k, av(k)])), layerHeat: R[0].layerHeat }; res.push(row);
  console.log(`  ${arm}: layers ${row.layers.toFixed(1)} (settled ${row.settled.toFixed(1)}), columns ${row.cols.toFixed(0)}, heat ${row.heat.toFixed(2)} (wrong ${row.wrong.toFixed(2)}), err5 ${row.err5.toFixed(2)}, err15 ${row.err15.toFixed(2)}, missing ${row.errMissing.toFixed(2)}, new shapes ${row.newHeat.toFixed(2)}, work ${row.work.toFixed(0)}`);
  console.log(`      each layer's own heat (seed ${SEEDS[0]}, soft): ${row.layerHeat.map((v) => v.toFixed(2)).join(' ')}\n`); }
fs.writeFileSync(path.join(__dirname, process.env.OUT || 'results.json'), JSON.stringify(res, null, 1));

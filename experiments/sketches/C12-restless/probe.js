// C12 probe: big-first staged growth (RA, speed 0.2, update "hot", no pattern noise) with idle columns made restless at
// several strengths. Counts how many columns in the big layer take a real share of wins, and the heat of the big layer.
'use strict';
const path = require('path');
const { CATALOGUE, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model } = require(path.join(__dirname, '../../models/staged.js'));
const P = CATALOGUE.patterns, ids = P.filter((p) => p.family !== 'bar triples').map((p) => p.id);
const ink = (b) => b.reduce((a, x) => a + x, 0);
const START = process.env.START || 'haze', RESTS = (process.env.RESTS || '0,0.005,0.01,0.02,0.05').split(',').map(Number);
console.log(`columns start as: ${START}`);
for (const rest of RESTS) { const rows = [];
  for (const seed of [1, 2]) {
    const r = rng(seed * 7919 + 13), m = new Model('RA', { update: 'hot', rate: 0.2, restless: rest, seed, maxLayers: 1, start: START }); let order = [], oi = 0; const wins = new Map();
    for (let t = 1; t <= 20000; t++) { if (oi >= order.length) { order = ids.slice(); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } oi = 0; }
      const out = m.step(P[order[oi++]].bits); if (t > 15000 && out.claims.length) wins.set(out.claims[0].c, (wins.get(out.claims[0].c) || 0) + 1); }
    const L = m.layers[0], share = L.cols.map((c) => (wins.get(c) || 0) / 5000), used = share.filter((s) => s >= 0.002).length, top = share.slice().sort((a, b) => b - a).slice(0, 5).reduce((a, b) => a + b, 0);
    let h = 0; for (const id of ids) { const q = m.read(P[id].bits); h += (q.left.length + q.misses) / ink(P[id].bits); }
    const distinct = new Set(ids.map((id) => m.read(P[id].bits).claims[0].c)).size;
    rows.push({ used, top, heat: h / ids.length, distinct });
  }
  const av = (k) => rows.reduce((a, q) => a + q[k], 0) / rows.length;
  console.log(`restless ${String(rest).padEnd(5)}: columns winning at least 0.2% of flashes ${av('used').toFixed(0)} of 96 · top 5 columns take ${(100 * av('top')).toFixed(0)}% · patterns given their own column ${av('distinct').toFixed(0)} of 98 · heat ${av('heat').toFixed(2)}`);
}

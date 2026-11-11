// C10 probe: train staged growth (children, heat-scaled updates) and count the columns the markers pick out, per layer.
'use strict';
const path = require('path');
const { CATALOGUE, noisy, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model } = require(path.join(__dirname, '../../models/staged.js'));
const P = CATALOGUE.patterns, ids = P.filter((p) => p.family !== 'bar triples').map((p) => p.id);
for (const seed of [1, 2]) {
  const r = rng(seed * 7919 + 13), m = new Model('SC', { update: 'hot', seed }); let order = [], oi = 0;
  for (let t = 1; t <= 60000; t++) { if (oi >= order.length) { order = ids.slice(); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } oi = 0; }
    m.step(noisy(P[order[oi++]].bits, 0.05, r));
    if (t % 20000 === 0) { const d = m.diagnose(); const per = m.layers.map((L) => { let o = 0, u = 0, both = 0, never = 0; for (const c of L.cols) { const v = d.get(c); if (v.outcompeted) o++; if (v.duplicate) u++; if (v.outcompeted && v.duplicate) both++; if (v.wins < 0.5) never++; } return `L${L.index + 1}(${L.cols.length}): ${o} outcompeted, ${u} duplicates (${both} both), ${never} barely win`; });
      console.log(`seed ${seed} flash ${t}: ` + per.join(' | ')); } }
}

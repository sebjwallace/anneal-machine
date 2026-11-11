// C14: snapshot columns. How many columns for the 98 training patterns, by threshold, similarity measure, noise and what
// columns do after their snapshot. Hypothesis (the owner's): at 90%, settles just under the number of patterns (98).
'use strict';
const path = require('path');
const { CATALOGUE, noisy, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model } = require(path.join(__dirname, '../../models/snapshot.js'));
const P = CATALOGUE.patterns, ids = P.filter((p) => p.family !== 'bar triples').map((p) => p.id), PASSES = 20;
const ink = (b) => b.reduce((a, x) => a + x, 0);
function run(o, noise, seed) {
  const r = rng(seed * 7919 + 13), m = new Model('SN', o); const growth = [];
  for (let p = 0; p < PASSES; p++) { const ord = ids.slice(); for (let i = ord.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ord[i], ord[j]] = [ord[j], ord[i]]; }
    for (const id of ord) m.step(noisy(P[id].bits, noise, r)); growth.push(m.cols.length); }
  let h = 0; const owner = new Map(); for (const id of ids) { const q = m.read(P[id].bits); h += (q.left.length + q.misses) / ink(P[id].bits); const c = q.claims[0] && q.claims[0].c;
    if (c) { if (!owner.has(c)) owner.set(c, []); owner.get(c).push(P[id].name); } }
  const shared = [...owner.values()].filter((g) => g.length > 1);
  return { cols: m.cols.length, used: owner.size, heat: h / ids.length, growth, shared };
}
for (const noise of [0, 0.05]) for (const after of ['stays', 'averages']) for (const measure of ['overlap', 'agree']) {
  if (noise === 0 && after === 'averages') continue;
  console.log(`\n== pattern noise ${noise * 100}%, columns ${after}, similarity = ${measure === 'overlap' ? 'overlap of on-pixels' : 'agreement across all 25 pixels'}`);
  for (const th of [0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1]) { const R = [1, 2].map((s) => run({ threshold: th, measure, after }, noise, s)), av = (k) => R.reduce((a, q) => a + q[k], 0) / R.length;
    console.log(`  threshold ${String(th).padEnd(4)}: ${av('cols').toFixed(0).padStart(4)} columns (${av('used').toFixed(0)} still used by a clean pattern) · heat ${av('heat').toFixed(2)} · columns after passes 1, 5, 20: ${[0, 4, 19].map((k) => R[0].growth[k]).join(', ')}`);
    if (th === 0.9 && noise === 0) console.log('     patterns sharing a column (seed 1): ' + (R[0].shared.length ? R[0].shared.slice(0, 8).map((g) => g.map((n) => `"${n}"`).join(' + ')).join(' | ') : 'none')); }
}

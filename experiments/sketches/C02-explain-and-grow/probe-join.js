// C02 probe: why does joining never fire? Train arm D one seed, then report the strongest together links (both ways).
'use strict';
const path = require('path');
const { CATALOGUE, noisy, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model } = require(path.join(__dirname, '../../models/explain.js'));
const P = CATALOGUE.patterns.filter((p) => p.family !== 'bar triples');
for (const noise of [0, 0.05]) {
  const m = new Model('D'), r = rng(42);
  for (let p = 0; p < 20; p++) { const o = P.map((_, i) => i); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
    for (const i of o) m.step(noisy(P[i].bits, noise, r)); }
  const pairs = []; for (const c of m.cols) for (const [d, v] of c.tog) if (c.id < d.id) pairs.push([c.id, d.id, v, d.tog.get(c) || 0]);
  pairs.sort((a, b) => Math.min(b[2], b[3]) - Math.min(a[2], a[3]));
  console.log(`noise ${noise}: cols ${m.cols.length}, joined ${m.st.joined || 0}, rests ${m.st.rests}, pairs with links ${pairs.length}`);
  console.log('  strongest (both ways):', pairs.slice(0, 8).map((p) => `${p[0]}-${p[1]} ${p[2].toFixed(2)}/${p[3].toFixed(2)}`).join('  '));
  const uses = m.cols.map((c) => c.uses).sort((a, b) => b - a); console.log('  uses, top:', uses.slice(0, 10).join(' '), ' median:', uses[uses.length >> 1]);
}

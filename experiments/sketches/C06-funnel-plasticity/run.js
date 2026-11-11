// C06: the funnel combined with plasticity, several ways. Same measures as C05 (changing focus or shuffled stream, 5% noise).
'use strict';
const fs = require('fs'), path = require('path');
const { CATALOGUE, noisy, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model } = require(path.join(__dirname, '../../models/funnel.js'));
const P = CATALOGUE.patterns, trainIds = P.filter((p) => p.family !== 'bar triples').map((p) => p.id);
const FLASHES = +(process.env.FLASHES || 6000), PHASE = 300, FOCUS = 10, SHARE = 0.8, SEEDS = [1, 2, 3];
const geo = (a, b, n) => Array.from({ length: n }, (_, i) => (n === 1 ? a : a * Math.pow(b / a, i / (n - 1))));
const shape = (n, top, keep) => Array.from({ length: n }, (_, i) => Math.max(1, Math.round(top * Math.pow(keep, i))));
const EXPS = [
  { name: 'funnel, fast -> slow', arm: 'FP', sizes: shape(5, 100, 0.5), plastic: geo(0.4, 0.025, 5) },
  { name: 'funnel, slow -> fast', arm: 'FP', sizes: shape(5, 100, 0.5), plastic: geo(0.025, 0.4, 5) },
  { name: 'funnel, one speed 0.2', arm: 'FP', sizes: shape(5, 100, 0.5), plastic: geo(0.2, 0.2, 5) },
  { name: 'stacked funnel, fast -> slow', arm: 'FS', sizes: shape(5, 100, 0.5), plastic: geo(0.4, 0.025, 5) },
  { name: '10 layers keep 70%, fast -> slow', arm: 'FP', sizes: shape(10, 100, 0.7), plastic: geo(0.4, 0.01, 10) },
  { name: 'upside down, narrow fast on top', arm: 'FP', sizes: shape(5, 6, 2), plastic: geo(0.4, 0.025, 5) },
  { name: 'plasticity only (C05)', arm: 'FP', sizes: shape(5, 50, 1), plastic: geo(0.4, 0.025, 5) },
];
const STREAMS = (process.env.STREAMS || 'focus,shuffled').split(',');
const ink = (b) => b.reduce((a, x) => a + x, 0), hs = (q, b) => (q.left.length + q.misses) / ink(b);
function run(X, stream, seed) {
  const r = rng(seed * 7919 + 13), m = new Model(X.arm, { sizes: X.sizes, plastic: X.plastic, forget: true, seed }), NL = X.sizes.length;
  let focus = [], order = [], oi = 0, early = 0, late = 0, ne = 0, nl = 0;
  for (let t = 0; t < FLASHES; t++) {
    if (t % PHASE === 0) { focus = []; const pool = trainIds.slice(); for (let k = 0; k < FOCUS; k++) focus.push(pool.splice(Math.floor(r() * pool.length), 1)[0]); }
    let id; if (stream === 'focus' && r() < SHARE) id = focus[Math.floor(r() * focus.length)];
    else { if (oi >= order.length) { order = trainIds.slice(); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } oi = 0; } id = order[oi++]; }
    const x = noisy(P[id].bits, 0.05, r), out = m.step(x), ph = t % PHASE;
    if (t >= PHASE) { if (ph < 50) { early += out.heatShare; ne++; } else if (ph >= PHASE - 50) { late += out.heatShare; nl++; } }
  }
  const all = trainIds.map((id) => m.read(P[id].bits)), foc = focus.map((id) => m.read(P[id].bits));
  return { early: early / ne, late: late / nl, sysAll: all.reduce((a, q, k) => a + hs(q, P[trainIds[k]].bits), 0) / all.length,
    sysFocus: foc.reduce((a, q, k) => a + hs(q, P[focus[k]].bits), 0) / foc.length,
    layerAll: Array.from({ length: NL }, (_, i) => all.reduce((a, q, k) => a + hs(q.per[i], P[trainIds[k]].bits), 0) / all.length),
    cols: m.cols.length, cells: m.cellCount() };
}
const res = [];
console.log(`${FLASHES} flashes, 5% noise, seeds ${SEEDS.join(',')}. heat = left over + wrong (share). "together" = all layers explaining at once.`);
for (const stream of STREAMS) { console.log(`\n== stream: ${stream}`);
  console.log(['setup'.padEnd(34), 'cols', 'start', 'end', 'all', 'focus', '  each layer alone on all 98'].join(' '));
  for (const X of EXPS) { const R = SEEDS.map((s) => run(X, stream, s)), av = (k) => R.reduce((a, q) => a + q[k], 0) / R.length;
    const layer = R[0].layerAll.map((_, i) => R.reduce((a, q) => a + q.layerAll[i], 0) / R.length);
    const row = { name: X.name, stream, sizes: X.sizes, plastic: X.plastic, cols: av('cols'), early: av('early'), late: av('late'), all: av('sysAll'), focus: av('sysFocus'), layer }; res.push(row);
    console.log([X.name.padEnd(34), row.cols.toFixed(0).padStart(4), row.early.toFixed(2).padStart(5), row.late.toFixed(2).padStart(4), row.all.toFixed(2).padStart(4), row.focus.toFixed(2).padStart(5),
      '  ' + layer.map((v) => v.toFixed(2)).join(' ')].join(' ')); } }
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(res, null, 1));

// C05: same input, same size, layers differ only in plasticity. Streams: shuffled, or a changing focus (every PHASE flashes a
// new group of FOCUS patterns gets SHARE of the flashes). Per layer: heat on flashes as they arrive, early in each phase
// (how fast it adapts) and late (how well it settles); at the end, heat on the current focus and on all patterns (what it kept).
'use strict';
const fs = require('fs'), path = require('path');
const { CATALOGUE, noisy, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model } = require(path.join(__dirname, '../../models/funnel.js'));
const P = CATALOGUE.patterns, trainIds = P.filter((p) => p.family !== 'bar triples').map((p) => p.id);
const FLASHES = +(process.env.FLASHES || 6000), PHASE = 300, FOCUS = 10, SHARE = 0.8, SEEDS = process.env.SEEDS ? process.env.SEEDS.split(',').map(Number) : [1, 2, 3], NL = 5, SIZE = 50;
const spread = (fast, slow, n) => Array.from({ length: n }, (_, i) => fast * Math.pow(slow / fast, i / (n - 1)));
const EXPS = [
  { name: 'shuffled, spread', stream: 'shuffled', plastic: spread(0.4, 0.025, NL), forget: true },
  { name: 'focus, spread', stream: 'focus', plastic: spread(0.4, 0.025, NL), forget: true },
  { name: 'focus, spread, no forget', stream: 'focus', plastic: spread(0.4, 0.025, NL), forget: false },
  { name: 'focus, all 0.2 (control)', stream: 'focus', plastic: Array(NL).fill(0.2), forget: true },
  { name: 'focus, spread, fixed cols', stream: 'focus', plastic: spread(0.4, 0.025, NL), forget: true, columns: 'fixed' },
];
const ink = (b) => b.reduce((a, x) => a + x, 0), hs = (q, b) => (q.left.length + q.misses) / ink(b);
function run(X, seed) {
  const r = rng(seed * 7919 + 13), m = new Model('PL', { sizes: Array(NL).fill(SIZE), plastic: X.plastic, forget: X.forget, columns: X.columns || 'grow', seed });
  let focus = [], order = [], oi = 0; const early = Array(NL).fill(0), late = Array(NL).fill(0); let ne = 0, nl = 0;
  for (let t = 0; t < FLASHES; t++) {
    if (t % PHASE === 0) { focus = []; const pool = trainIds.slice(); for (let k = 0; k < FOCUS; k++) focus.push(pool.splice(Math.floor(r() * pool.length), 1)[0]); }
    let id; if (X.stream === 'focus' && r() < SHARE) id = focus[Math.floor(r() * focus.length)];
    else { if (oi >= order.length) { order = trainIds.slice(); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } oi = 0; } id = order[oi++]; }
    const x = noisy(P[id].bits, 0.05, r), out = m.step(x), ph = t % PHASE, on = ink(x);
    if (t >= PHASE && on) { const hl = out.per.map((q) => (q.left.length + q.misses) / on);
      if (ph < 50) { hl.forEach((v, i) => { early[i] += v; }); ne++; } else if (ph >= PHASE - 50) { hl.forEach((v, i) => { late[i] += v; }); nl++; } }
  }
  const all = trainIds.map((id) => m.read(P[id].bits)), foc = focus.map((id) => m.read(P[id].bits));
  return { early: early.map((v) => v / ne), late: late.map((v) => v / nl),
    focusHeat: Array.from({ length: NL }, (_, i) => foc.reduce((a, q, k) => a + hs(q.per[i], P[focus[k]].bits), 0) / foc.length),
    allHeat: Array.from({ length: NL }, (_, i) => all.reduce((a, q, k) => a + hs(q.per[i], P[trainIds[k]].bits), 0) / all.length),
    sysAll: all.reduce((a, q, k) => a + hs(q, P[trainIds[k]].bits), 0) / all.length, sysFocus: foc.reduce((a, q, k) => a + hs(q, P[focus[k]].bits), 0) / foc.length,
    cols: m.layers.map((L) => L.cols.length) };
}
const res = [];
const only = process.env.ONLY ? new Set(process.env.ONLY.split('|')) : null;
for (const X of EXPS) { if (only && !only.has(X.name)) continue; const runs = SEEDS.map((s) => run(X, s)), avg = (k) => runs[0][k].map((_, i) => runs.reduce((a, R) => a + R[k][i], 0) / runs.length);
  const R = { name: X.name, plastic: X.plastic, early: avg('early'), late: avg('late'), focusHeat: avg('focusHeat'), allHeat: avg('allHeat'), cols: avg('cols'),
    sysAll: runs.reduce((a, q) => a + q.sysAll, 0) / runs.length, sysFocus: runs.reduce((a, q) => a + q.sysFocus, 0) / runs.length }; res.push(R);
  const f = (a) => a.map((v) => v.toFixed(2)).join('  ');
  console.log(`\n${X.name}   (plasticity per layer: ${X.plastic.map((v) => v.toFixed(3)).join(', ')})`);
  console.log(`  heat as flashes arrive, start of phase : ${f(R.early)}`);
  console.log(`  heat as flashes arrive, end of phase   : ${f(R.late)}`);
  console.log(`  at the end, on the current focus       : ${f(R.focusHeat)}   all layers together: ${R.sysFocus.toFixed(2)}`);
  console.log(`  at the end, on all 98 patterns         : ${f(R.allHeat)}   all layers together: ${R.sysAll.toFixed(2)}`);
  console.log(`  columns per layer                      : ${R.cols.map((v) => v.toFixed(0)).join('  ')}`); }
fs.writeFileSync(path.join(__dirname, process.env.OUT || 'results.json'), JSON.stringify(res, null, 1));

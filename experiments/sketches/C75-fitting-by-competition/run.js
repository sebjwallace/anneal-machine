// C75 · Fitting by competition alone. The engine's fitting (explain) runs competition (greedy: the biggest saver takes
// its cells, rivals recount on what is left) once for every possible opening placement and keeps the cheapest. Does
// competition alone, without that search, fit as well, keep the same assemblies, and do less work?
// Arms (o.fit): search (today), compete (one competition pass), refuse (one pass; a dead heat between rivals refused).
// Part A: one model learnt with search; the same 300 fresh scenes fitted each way.
// Part B: each arm learns from scratch (600 scenes, rest every 98, as src/test/see.js), then the engine test's yardstick.
// settle (added after the test results, not pre-registered): one pass, then re-settle only where a winner claimed cells that aren't lit.
// Run: node run.js            (SEEDS=4242,101,102,103,104 by default; SEEDS=1 is the development seed)
'use strict';
const path = require('path');
const { CATALOGUE, rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const { SceneWorld } = require(path.join(__dirname, '../../../src/worlds/scenes.js'));
const { Model, norm } = require(path.join(__dirname, 'engine-see.js'));
const SEEDS = (process.env.SEEDS || '4242,101,102,103,104').split(',').map(Number), ARMS = (process.env.ARMS || 'search,compete,refuse,settle').split(',');
const W = new SceneWorld(CATALOGUE), want = { ...W.shapes, ...W.objects }, NAMES = Object.keys(want);
const fresh = () => { const f = rng(7), xs = []; for (let k = 0; k < 300; k++) xs.push(W.next(f, 0).x); return xs; };
function learn(seed, fit) { const r = rng(seed), m = new Model('FL', { fit }); m.work = { greedy: 0, tally: 0, explain: 0, refused: 0 }; const t0 = Date.now();
  for (let t = 1; t <= 600; t++) { m.step(W.next(r, 0).x); if (t % 98 === 0) m.rest(); } m.rest(); return { m, ms: Date.now() - t0 }; }
function yard(m, xs) { const live = m.units.filter((u) => !u.loose), parts = live.filter((u) => u.layer === 1), SPX = 144, pc = 1 + Math.log2(live.length + 1) / Math.log2(SPX);
  const px = parts.reduce((a, p) => a + p.pts.length, 0), comp = live.filter((u) => u.layer > 1).reduce((a, u) => a + u.place.filter((k) => !k.u.loose).length, 0);
  let flow = 0, fh = 0; for (const x of xs) { const q = m.read(x); flow += pc * q.claims.length + q.left.length + q.misses; fh += (q.left.length + q.misses) / q.on; }
  const keys = new Map(live.map((u) => [norm(m.exp(u)).key, u])), rec = NAMES.filter((nm) => keys.get(norm(want[nm]).key));
  return { units: live.length, dict: px + pc * comp, flow, total: px + pc * comp + flow, heat: fh / xs.length, rec, memories: m.items.length }; }
const f1 = (v) => (Math.round(v * 10) / 10).toString(), pct = (a, b) => Math.round(100 * a / b) + '%';
const xs = fresh(); const A = {}, B = {};
for (const seed of SEEDS) {
  // Part A
  const { m } = learn(seed, 'search');
  for (const fit of ARMS) { m.o.fit = fit; m.work = { greedy: 0, tally: 0, explain: 0, refused: 0, resettles: 0 }; const t0 = Date.now(); const costs = xs.map((x) => m.read(x).cost);
    (A[fit] = A[fit] || []).push({ seed, costs, work: { ...m.work }, ms: Date.now() - t0 }); }
  m.o.fit = 'search';
  // Part B
  for (const fit of ARMS) { const L = learn(seed, fit); L.m.o.fit = 'search'; const wk = { ...L.m.work }; const y = yard(L.m, xs);   // the yardstick always fits with search, so arms are judged alike
    (B[fit] = B[fit] || []).push({ seed, ...y, work: wk, ms: L.ms }); }
}
console.log(`C75 · fitting by competition alone   seeds ${SEEDS.join(',')}   300 fresh scenes (rng 7)\n`);
console.log('PART A · one model learnt with search; the same 300 fresh scenes fitted each way');
for (const fit of ARMS) { let n = 0, same = 0, worse = 0, better = 0, gap = 0, tot = 0, ms = 0, g = 0, ta = 0, ref = 0;
  A[fit].forEach((a, k) => { const base = A.search[k].costs; a.costs.forEach((c, i) => { n++; tot += base[i]; gap += c - base[i]; if (Math.abs(c - base[i]) < 1e-6) same++; else if (c > base[i]) worse++; else better++; }); ms += a.ms; g += a.work.greedy; ta += a.work.tally; ref += a.work.refused || 0; });
  console.log(`  ${fit.padEnd(8)} same cost ${same}/${n}  dearer ${worse}  cheaper ${better}  extra cost ${f1(100 * gap / tot)}% of search's   competition passes per scene ${f1(g / n)}   tally work per scene ${Math.round(ta / n)}   time ${ms} ms${fit === 'refuse' ? `   dead heats refused ${ref}` : ''}`); }
console.log('\nPART B · each way learns from scratch (600 scenes, rest every 98); judged by the engine test\'s yardstick (fitted with search)');
for (const fit of ARMS) { console.log(`  ${fit}`); for (const b of B[fit]) console.log(`    seed ${String(b.seed).padEnd(5)} units ${String(b.units).padStart(3)}  memories ${String(b.memories).padStart(3)}  yardstick ${f1(b.dict).padStart(5)} + ${f1(b.flow).padStart(6)} = ${f1(b.total).padStart(6)}  heat ${b.heat.toFixed(3)}  recovered ${b.rec.length}/${NAMES.length}  learning ${(b.ms / 1000).toFixed(1)} s  passes ${b.work.greedy}  tally ${(b.work.tally / 1e6).toFixed(1)}M${fit === 'refuse' ? `  refused ${b.work.refused || 0}` : ''}`);
  const mean = (k) => B[fit].reduce((a, b) => a + b[k], 0) / B[fit].length;
  console.log(`    mean: units ${f1(mean('units'))}  yardstick ${f1(mean('total'))}  heat ${mean('heat').toFixed(3)}  recovered ${f1(B[fit].reduce((a, b) => a + b.rec.length, 0) / B[fit].length)}/${NAMES.length}  learning ${f1(mean('ms') / 1000)} s`); }
console.log('\nmissing shapes (part B): ' + ARMS.map((fit) => `${fit}: ` + B[fit].map((b) => `${b.seed}[${NAMES.filter((n) => !b.rec.includes(n)).join(' ') || '-'}]`).join(' ')).join('  |  '));

// C47 · ONE RULE OR TWO? Plans (routes joined by pushing from both ends, C44/C45) are checked step by step against
// specific remembered walks (C46). The question is what keeps those specifics:
//   ONE RULE: there is only the energy-ruled memory (C43's learner). The specific walks available for checking are
//             the plain walks it chose to keep; everything else has been absorbed into general shapes or dropped.
//   TWO RULES: the same energy-ruled memory for the general shapes, plus a store of days under its own rule:
//             every walk is kept the moment it happens; a walk seen again is refreshed; when the store is full the
//             walk not seen for longest fades. Capacity CAP (a chosen number, declared).
// Measured as days go by: made-up routes caught or missed, real new routes let through or wrongly doubted.
// Two parks: SMALL (C45's park) and GRID (a 4 x 4 grid of places, paths running right and down, a few missing).
'use strict';
const path = require('path');
const { Learner } = require(path.join(__dirname, '../C43-item-learner/items.js'));
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const CAP = +(process.env.CAP || 50), STOPS = (process.env.STOPS || '100,300,1000,3000').split(',').map(Number);
const PARKS = {
  small: { edges: { A: ['B'], B: ['C'], C: ['D', 'K', 'X'], D: ['E'], K: ['E'], E: ['F', 'Z'], F: ['G'], G: ['H'], H: ['O'], X: ['Y'], Z: ['W'], Q: ['R'], R: ['S'] }, habit: ['A', 'B', 'C', 'D', 'E'], never: ['A', 'O'] },
  grid: grid(4, ['a2>a3', 'b1>c1', 'c3>c4', 'b3>c3']), 'grid 5x5': grid(5, ['a2>a3', 'b1>c1', 'c3>c4', 'b3>c3', 'd2>d3', 'c5>d5', 'a4>b4']) };
function grid(N, gone0) { const n = (r, c) => 'abcde'[r] + (c + 1), edges = {}, gone = new Set(gone0);
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const out = []; if (c < N - 1 && !gone.has(n(r, c) + '>' + n(r, c + 1))) out.push(n(r, c + 1)); if (r < N - 1 && !gone.has(n(r, c) + '>' + n(r + 1, c))) out.push(n(r + 1, c)); if (out.length) edges[n(r, c)] = out; }
  return { edges, habit: ['a1', 'b1', 'b2', 'b3', 'b4'], never: ['a1', n(N - 1, N - 1)] }; }
for (const [pname, P] of Object.entries(PARKS).filter(([k]) => !process.env.PARK || k === process.env.PARK)) { const { edges } = P, places = [...new Set([...Object.keys(edges), ...Object.values(edges).flat()])];
  const r = rng(47), days = [];
  const walk = () => { for (;;) { let w; if (r() < 0.3) w = P.habit.slice(); else { const st = Object.keys(edges); w = [st[Math.floor(r() * st.length)]]; const L = 3 + Math.floor(r() * 3);
      while (w.length < L && edges[w[w.length - 1]]) { const nx = edges[w[w.length - 1]]; w.push(nx[Math.floor(r() * nx.length)]); } if (w.length < 3) continue; }
    if (!(w.includes(P.never[0]) && w.includes(P.never[1]))) return w; } };
  const reach = (a) => { const seen = new Set(), q = [a]; while (q.length) { const u = q.shift(); for (const v of edges[u] || []) if (!seen.has(v)) { seen.add(v); q.push(v); } } return seen; };
  const realStep = (x, y) => (edges[x] || []).includes(y), real = (rt) => rt.every((s, i) => !i || realStep(rt[i - 1], s));
  console.log(`\n${pname.toUpperCase()} PARK (${places.length} places) · store of days holds ${CAP} walks`);
  console.log('  days | general shapes kept | ONE RULE: real new routes trusted, doubted · made-up caught, missed | TWO RULES: same');
  const store = new Map(); let t = 0;   // TWO RULES store: walk key -> last seen
  for (const stop of STOPS) {
    while (days.length < stop) { const w = walk(); days.push(w); t++; const k = w.join(); store.delete(k); store.set(k, { w, t }); if (store.size > CAP) store.delete(store.keys().next().value); }
    const counts = new Map(), keyed = new Map(), together = new Set(); for (const w of days) { const k = w.join(); if (!keyed.has(k)) keyed.set(k, new Map(w.map((s, i) => [i, s]))); counts.set(k, (counts.get(k) || 0) + 1); for (const a of w) for (const b of w) together.add(a + '|' + b); }
    const L = new Learner(places, 5); L.rest([...counts].map(([k, n]) => [keyed.get(k), n]));
    const mem = L.explainers().map((e) => ({ cells: e.at.slice().sort((a, b) => a[1] - b[1]) }));
    // joining (as C44/C45)
    const recall = (a, b, gap) => { const fits = []; for (const th of mem) for (const [sa, ta] of th.cells) if (sa === a) for (const [sb, tb] of th.cells) if (sb === b && tb > ta && (gap == null || tb - ta === gap)) fits.push(th.cells.filter(([, x]) => x >= ta && x <= tb).map(([s, x]) => [s, x - ta]));
      if (!fits.length) return null; fits.sort((x, y) => x.length - y.length); const best = fits.filter((f) => f.length === fits[0].length); return new Set(best.map((f) => f.map((c) => c.join('@')).join())).size > 1 ? { tie: true } : { cells: best[0] }; };
    const push = (front, lit) => { const next = new Map(); for (const [s, x] of front) for (const th of mem) for (const [s2, x2] of th.cells) if (s2 === s) for (const [s3, x3] of th.cells) { const k = s3 + '@' + (x + x3 - x2); if (!lit.has(k) && !next.has(k)) next.set(k, [s3, x + x3 - x2]); } for (const [k, v] of next) lit.set(k, v); return [...next.values()]; };
    const join = (a, b, gap = null) => { const rc = recall(a, b, gap); if (rc) return rc; const la = new Map([[a + '@0', [a, 0]]]), lb = new Map([[b + '@0', [b, 0]]]); let fa = [[a, 0]], fb = [[b, 0]];
      for (let round = 1; round < 30; round++) { fa = push(fa, la); fb = push(fb, lb); const meet = []; for (const [, [s, ta]] of la) for (const [, [s2, tb]] of lb) if (s === s2 && s !== a && s !== b && ta > 0 && tb < 0 && (gap == null || ta - tb === gap)) meet.push([s, ta, -tb]);
        if (meet.length) { meet.sort((x, y) => x[1] + x[2] - (y[1] + y[2])); const short = meet.filter((m) => m[1] + m[2] === meet[0][1] + meet[0][2]), routes = new Map();
          for (const [s, ta, tb] of short) { const A = join(a, s, ta), B = join(s, b, tb); if (!A.cells || !B.cells) continue; const cells = [...A.cells, ...B.cells.slice(1).map(([x, y]) => [x, y + ta])]; routes.set(cells.map((c) => c[0]).join(), cells); }
          if (routes.size > 1) return { tie: true }; if (routes.size === 1) return { cells: [...routes.values()][0] }; }
        if (!fa.length && !fb.length) return { gap: true }; } return { gap: true }; };
    // the two sources of specific walks for checking
    const oneRule = L.things.map((th) => th.at.slice().sort((a, b) => a[1] - b[1]).map(([s]) => s)), twoRules = [...store.values()].map((v) => v.w);
    const backedBy = (walks) => (rt) => rt.every((s, i) => !i || walks.some((w) => w.some((x, j) => x === rt[i - 1] && w[j + 1] === s)));
    const c1 = backedBy(oneRule), c2 = backedBy(twoRules), T1 = [0, 0, 0, 0], T2 = [0, 0, 0, 0];
    for (const a of places) for (const b of places) { if (a === b || together.has(a + '|' + b)) continue; const res = join(a, b); if (!res.cells) continue; const rt = res.cells.map((c) => c[0]), isReal = real(rt) && reach(a).has(b);
      for (const [T, ok] of [[T1, c1(rt)], [T2, c2(rt)]]) T[isReal ? (ok ? 0 : 1) : (ok ? 3 : 2)]++; }
    console.log(`  ${String(stop).padStart(4)} | ${String(L.things.length).padStart(2)} walks, ${L.kinds.length} kinds       | ${T1[0]} trusted, ${T1[1]} doubted · ${T1[2]} caught, ${T1[3]} missed` + `   | ${T2[0]} trusted, ${T2[1]} doubted · ${T2[2]} caught, ${T2[3]} missed`); } }

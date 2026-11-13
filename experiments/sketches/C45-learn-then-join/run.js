// C45 · LEARN, THEN JOIN. C44's pushing-from-both-ends, but on memories the item learner (C43) built from experience,
// not memories handed to it. The park (directed paths, as in C44 stage 2): A→B→C, C→D→E, C→K→E, E→F→G, G→H→O,
// C→X→Y, E→Z→W, and Q→R→S off on its own. Days: wandering walks of 3-5 places; one habit (A→B→C→D→E) is walked
// often. No walk ever holds both A and O.
// Then every pair (start, end) that no walk held together is asked: does pushing from both ends, through what was
// learnt, find a real route (every step a real path) when there is one, and say "no way through" when there isn't?
'use strict';
const path = require('path');
const { Learner } = require(path.join(__dirname, '../C43-item-learner/items.js'));
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const WIN = +(process.env.WIN || 100), HABIT = +(process.env.HABIT || 0.3);
const edges = { A: ['B'], B: ['C'], C: ['D', 'K', 'X'], D: ['E'], K: ['E'], E: ['F', 'Z'], F: ['G'], G: ['H'], H: ['O'], X: ['Y'], Z: ['W'], Q: ['R'], R: ['S'] };
const places = [...new Set([...Object.keys(edges), ...Object.values(edges).flat()])];
const r = rng(45), days = [], together = new Set();
while (days.length < WIN) { let w;
  if (r() < HABIT) w = ['A', 'B', 'C', 'D', 'E'];
  else { const starts = places.filter((p) => edges[p]); w = [starts[Math.floor(r() * starts.length)]]; const L = 3 + Math.floor(r() * 3);
    while (w.length < L && edges[w[w.length - 1]]) { const n = edges[w[w.length - 1]]; w.push(n[Math.floor(r() * n.length)]); } if (w.length < 3) continue; }
  if (w.includes('A') && w.includes('O')) continue; days.push(w); for (const a of w) for (const b of w) together.add(a + b); }
// learn (C43's learner: things with identity, kinds; "where" = step)
const counts = new Map(), keyed = new Map(); for (const w of days) { const k = w.join(); if (!keyed.has(k)) keyed.set(k, new Map(w.map((s, t) => [t, s]))); counts.set(k, (counts.get(k) || 0) + 1); }
const window = [...counts].map(([k, n]) => [keyed.get(k), n]), L = new Learner(places, 5), t0 = Date.now(); L.rest(window);
const mem = L.explainers().map((e, i) => ({ name: e.version ? `kind version ${i}` : `thing ${i}`, cells: e.at.slice().sort((a, b) => a[1] - b[1]) }));
console.log(`${WIN} days (${counts.size} different walks), learnt in ${((Date.now() - t0) / 1000).toFixed(1)} s: ${L.things.length} walks kept, ${L.kinds.length} kinds`);
for (const th of L.things) console.log(`  kept: ${th.at.slice().sort((a, b) => a[1] - b[1]).map(([s]) => s).join(' → ')}`);
for (const k of L.kinds) console.log(`  kind: ${[...k.at.map(([s, t]) => [s, t]), ...k.slots.map((sl) => [sl.fill.join('/'), sl.t])].sort((a, b) => a[1] - b[1]).map(([s]) => s).join(' → ')}`);

// pushing from both ends (as C44)
function recall(a, b, gap) { const fits = []; for (const th of mem) for (const [sa, ta] of th.cells) if (sa === a) for (const [sb, tb] of th.cells) if (sb === b && tb > ta && (gap == null || tb - ta === gap)) fits.push(th.cells.filter(([, t]) => t >= ta && t <= tb).map(([s, t]) => [s, t - ta]));
  if (!fits.length) return null; fits.sort((x, y) => x.length - y.length); const best = fits.filter((f) => f.length === fits[0].length), ks = new Set(best.map((f) => f.map((c) => c.join('@')).join())); return ks.size > 1 ? { tie: true } : { cells: best[0] }; }
function push(front, lit) { const next = new Map(); for (const [s, t] of front) for (const th of mem) for (const [s2, t2] of th.cells) if (s2 === s) for (const [s3, t3] of th.cells) { const k = s3 + '@' + (t + t3 - t2); if (!lit.has(k) && !next.has(k)) next.set(k, [s3, t + t3 - t2]); }
  for (const [k, v] of next) lit.set(k, v); return [...next.values()]; }
let lit = 0;
function join(a, b, gap = null) { const rc = recall(a, b, gap); if (rc) return rc.tie ? { tie: true } : { cells: rc.cells, rounds: 0 };
  const la = new Map([[a + '@0', [a, 0]]]), lb = new Map([[b + '@0', [b, 0]]]); let fa = [[a, 0]], fb = [[b, 0]];
  for (let round = 1; round < 30; round++) { fa = push(fa, la); fb = push(fb, lb); lit += fa.length + fb.length; const meet = [];
    for (const [, [s, ta]] of la) for (const [, [s2, tb]] of lb) if (s === s2 && s !== a && s !== b && ta > 0 && tb < 0 && (gap == null || ta - tb === gap)) meet.push([s, ta, -tb]);
    if (meet.length) { meet.sort((x, y) => x[1] + x[2] - (y[1] + y[2])); const short = meet.filter((m) => m[1] + m[2] === meet[0][1] + meet[0][2]), routes = new Map();
      for (const [s, ta, tb] of short) { const A = join(a, s, ta), B = join(s, b, tb); if (!A.cells || !B.cells) continue; const cells = [...A.cells, ...B.cells.slice(1).map(([x, t]) => [x, t + ta])]; routes.set(cells.map((c) => c[0]).join(), { cells, rounds: round }); }
      if (routes.size > 1) return { tie: true }; if (routes.size === 1) return [...routes.values()][0]; }
    if (!fa.length && !fb.length) return { gap: true }; }
  return { gap: true }; }
const reach = (a) => { const seen = new Set(), q = [a]; while (q.length) { const u = q.shift(); for (const v of edges[u] || []) if (!seen.has(v)) { seen.add(v); q.push(v); } } return seen; };
const real = (route) => route.every((s, i) => !i || (edges[route[i - 1]] || []).includes(s));
let asked = 0, found = 0, wrong = 0, undecided = 0, missed = 0, gapsOk = 0, gaps = 0, rounds = 0; const examples = [];
for (const a of places) for (const b of places) { if (a === b || together.has(a + b)) continue; const can = reach(a).has(b); lit = 0; const res = join(a, b);
  if (!can) { gaps++; if (res.gap) gapsOk++; else examples.push(`  ✗ ${a} to ${b}: no real way, but said ${res.cells ? res.cells.map((c) => c[0]).join(' → ') : 'undecided'}`); continue; }
  asked++; if (res.tie) undecided++; else if (res.cells && real(res.cells.map((c) => c[0]))) { found++; rounds += res.rounds; if (a === 'A' && b === 'O') examples.unshift(`  A to O (never walked): ${res.cells.map((c) => c[0]).join(' → ')} · ${res.rounds} rounds, ${lit} states lit`); }
  else if (res.cells) { wrong++; examples.push(`  ✗ ${a} to ${b}: said ${res.cells.map((c) => c[0]).join(' → ')}, not a real route`); } else { missed++; examples.push(`  · ${a} to ${b}: there is a way, but it found none`); } }
console.log(`\npairs never in one walk, with a real way between them: ${asked} · found a real route ${found} · undecided (two equal routes) ${undecided} · wrong ${wrong} · missed ${missed}` + (found ? ` · ${(rounds / found).toFixed(1)} rounds on average` : ''));
console.log(`pairs with no way between them: ${gaps} · said "no way through" ${gapsOk}`);
console.log(examples.slice(0, 12).join('\n'));

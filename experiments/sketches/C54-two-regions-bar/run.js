// C54 · TWO REGIONS, BOTH WITH A MOVING BAR. A park whose places are seen as pictures of landmarks.
//   VISUAL REGION: the engine (pixels, 12 x 12) learns the landmarks from single views, then recognises what is in view.
//   ABSTRACT REGION: C53's engine copy (items with identity, slots, its parts are its incoming items) learns walks over
//   what the visual region recognised (one recognised thing per step).
// The question: "how do I get from the bench to the oak?", asked with a view of each, both partly obscured (2 of each
// landmark's 5 pixels missing). No walk ever held both.
// MOVING BAR (C51), in each region:
//   visual: normally a placement must save more than its price; while lit pixels stay unexplained (a gap), the bar drops
//     to "saves more than it gets wrong" (any saving above zero); it goes back up after.
//   abstract: an assembly wakes when 2 of its states are active (the recall rule); while the gap is open the bar drops to
//     1 (pushing); where both sides meet, the bar goes back to 2 and the route settles (C51).
// Four runs: fixed or moving bar in each region. Scorer (outside the engine) maps recognised things back to places.
'use strict';
const path = require('path');
globalThis.WORLD_SIZE = 12;
const S = path.join(__dirname, '../../../src/');
const { rng } = require(S + 'worlds/catalogue.js'), V = require(S + 'engine/see.js');
const DROP = +(process.env.DROP ?? 2), W = 12, places = ['bench', 'gate', 'fountain', 'pond', 'junction', 'bridge', 'hill', 'meadow', 'oak', 'rose bed', 'stream'];
const edges = { bench: ['gate'], gate: ['fountain'], fountain: ['pond', 'rose bed'], pond: ['junction'], junction: ['bridge', 'stream'], bridge: ['hill'], hill: ['meadow'], meadow: ['oak'] };
// landmarks: 5 pixels in a 4 x 4 box, all different shapes (fixed seed)
const lr = rng(54), shapes = {}, keys = new Set();
for (const p of places) for (;;) { const cells = new Set(); while (cells.size < 5) cells.add(Math.floor(lr() * 16)); const pts = [...cells].map((c) => [c % 4, Math.floor(c / 4)]); const n = V.norm(pts); if (keys.has(n.key) || n.pts.length < 5) continue; keys.add(n.key); shapes[p] = n.pts; break; }
const view = (p, r, drop = 0) => { const x = new Uint8Array(W * W), ox = Math.floor(r() * (W - 4)), oy = Math.floor(r() * (W - 4)); let pts = shapes[p].slice(); for (let i = 0; i < drop; i++) pts.splice(Math.floor(r() * pts.length), 1); for (const [a, b] of pts) x[(oy + b) * W + ox + a] = 1; return x; };
// ---- VISUAL REGION learns the landmarks
const vis = new V.Model(), r = rng(1); for (let t = 1; t <= 300; t++) { vis.step(view(places[Math.floor(r() * places.length)], r)); if (t % 98 === 0) vis.rest(); } vis.rest();
const placeOf = new Map(); for (const u of vis.units.filter((u) => !u.loose)) { const k = V.norm(vis.exp(u)).key; const p = places.find((q) => V.norm(shapes[q]).key === k); if (p) placeOf.set(u.id, p); }
const recognise = (x, moving) => { let q = vis.read(x); if (moving && q.left.length) { const low = vis.greedy(x, 1e-9); if (low.claims.length) q = low; }   // gap left: bar down to "any saving", then back up
  const c = q.claims.slice().sort((a, b) => vis.exp(b.c).length - vis.exp(a.c).length)[0]; return c ? c.c.id : null; };
console.log(`visual region: ${vis.units.filter((u) => !u.loose).length} things, ${placeOf.size} of ${places.length} landmarks learnt`);
// ---- ABSTRACT REGION learns walks over what was recognised
const ids = [...placeOf.keys()]; globalThis.WORLD_SIZE = 8; globalThis.WORLD_VALUES = ids.length + 1;
delete require.cache[require.resolve('../C53-abstract-items/see.js')]; const A = require('../C53-abstract-items/see.js');
const code = new Map(ids.map((id, i) => [id, i + 2])), idOf = new Map(ids.map((id, i) => [i + 2, id]));
const abs = new A.Model('FL', { atoms: true }), wr = rng(2); let walks = 0;
const walk = () => { for (;;) { const starts = Object.keys(edges); const w = [starts[Math.floor(wr() * starts.length)]], L = 3 + Math.floor(wr() * 3); while (w.length < L && edges[w[w.length - 1]]) { const n = edges[w[w.length - 1]]; w.push(n[Math.floor(wr() * n.length)]); } if (w.length >= 3 && !(w.includes('bench') && w.includes('oak'))) return w; } };
for (let t = 1; t <= 400; t++) { const w = walk(), x = new Uint8Array(8 * 8); w.forEach((p, i) => { const id = recognise(view(p, wr), false); if (id != null && code.has(id)) x[i] = code.get(id); }); abs.step(x); walks++; if (t % 98 === 0) abs.rest(); } abs.rest();
const mem = abs.explainers().map(([u]) => abs.exp(u).map((p) => [p[2], p[0]]));   // assemblies (and their versions) as [item, step]
console.log(`abstract region: ${walks} walks, ${abs.units.filter((u) => u.layer > 1 && !u.kind).length} assemblies, ${abs.kindsOf().length} with slots`);
// ---- the abstract region's join (C51): wake assemblies holding >= bar active states on a side; bar 2, down to 1 while the gap is open
function wake(lit, bar) { const add = new Map(); for (const cells of mem) { const offs = new Map(); for (const [s, t] of cells) for (const [, [s2, t2]] of lit) if (s === s2) offs.set(t2 - t, (offs.get(t2 - t) || 0) + 1);
    for (const [o, n] of offs) if (n >= bar) for (const [s, t] of cells) { const k = s + '@' + (t + o); if (!lit.has(k) && !add.has(k)) add.set(k, [s, t + o]); } } for (const [k, v] of add) lit.set(k, v); return add.size; }
function join(a, b, moving, gap = null, depth = 0) { if (depth > 6) return null; const la = new Map([[a + '@0', [a, 0]]]), lb = new Map([[b + '@0', [b, 0]]]); let bar = 2;
  for (let round = 0; round < 40; round++) { const n = wake(la, bar) + wake(lb, bar); const meet = [];
    for (const [, [s, ta]] of la) for (const [, [s2, tb]] of lb) if (s === s2 && ta >= 0 && tb <= 0 && ta - tb > 0 && (gap == null || ta - tb === gap)) meet.push([s, ta, -tb]);
    if (meet.length) { meet.sort((x, y) => x[1] + x[2] - (y[1] + y[2])); const [s, ta, tb] = meet[0], g = ta + tb;
      if (s === a || s === b) { const route = []; for (let t = 0; t <= g; t++) { const here = [...la.values()].filter(([st, tt]) => tt === t && lb.has(st + '@' + (t - g))).map(([st]) => st); if (here.length !== 1) return 'undecided'; route.push(here[0]); } return route; }
      const L = join(a, s, moving, ta, depth + 1), R = join(s, b, moving, tb, depth + 1); if (!Array.isArray(L) || !Array.isArray(R)) return 'undecided'; return [...L, ...R.slice(1)]; }
    if (n === 0) { if (moving && bar === 2) { bar = 1; continue; } return null; } }
  return null; }
// ---- the question, many times over (different obscured views each time)
const truth = ['bench', 'gate', 'fountain', 'pond', 'junction', 'bridge', 'hill', 'meadow', 'oak'];
for (const [vm, am] of [[false, false], [true, false], [false, true], [true, true]]) { const qr = rng(9); let ok = 0, seenBoth = 0, none = 0, wrong = 0, und = 0; const T = 30;
  for (let i = 0; i < T; i++) { const sa = recognise(view('bench', qr, DROP), vm), sb = recognise(view('oak', qr, DROP), vm);
    if (placeOf.get(sa) !== 'bench' || placeOf.get(sb) !== 'oak') { continue; } seenBoth++;
    const res = join(code.get(sa), code.get(sb), am); if (res === null) none++; else if (res === 'undecided') und++; else { const route = res.map((c) => placeOf.get(idOf.get(c))); if (route.join() === truth.join()) ok++; else wrong++; } }
  console.log(`visual bar ${vm ? 'moving' : 'fixed '} · abstract bar ${am ? 'moving' : 'fixed '} | both views recognised ${String(seenBoth).padStart(2)}/${T} · route found ${ok} · no way ${none} · undecided ${und} · wrong ${wrong}`); }

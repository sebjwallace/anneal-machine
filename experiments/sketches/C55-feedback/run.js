// C55 · FEEDBACK FROM THE ABSTRACT REGION TO THE VISUAL REGION (owner, after HTM: higher regions send context down).
// Same two regions as C54. Walking real routes, step by step, the abstract region takes the last two things recognised
// and sends down what it expects next: the things at the next step in every assembly holding those two (recall rule,
// bar 2); if none, every assembly holding the last one (bar lowered: heat).
// How an expectation reaches the visual region, in its own currency: naming a thing costs log2 of how many things you
// choose from. With context, an expected thing is named from the expected set (cheap); anything else still from all.
// Reading a view: each known thing at its best place scores its saving (2 × matched − its size); it is taken if the saving
// beats its naming price; if nothing passes and pixels are left (a gap), the bar drops to "any saving" (C54).
// Measured with and without feedback, open-ended: correct reads, wrong reads (and how many of those were the expected
// thing: illusions), nothing read, in each situation:
//   expected view, 0-3 of 5 pixels missing · a surprise (some other landmark is there) 0-2 missing · noise (3 random pixels)
'use strict';
const path = require('path');
globalThis.WORLD_SIZE = 12;
const S = path.join(__dirname, '../../../src/');
const { rng } = require(S + 'worlds/catalogue.js'), V = require(S + 'engine/see.js');
const W = 12, SPX = W * W, places = ['bench', 'gate', 'fountain', 'pond', 'junction', 'bridge', 'hill', 'meadow', 'oak', 'rose bed', 'stream'];
const edges = { bench: ['gate'], gate: ['fountain'], fountain: ['pond', 'rose bed'], pond: ['junction'], junction: ['bridge', 'stream'], bridge: ['hill'], hill: ['meadow'], meadow: ['oak'] };
const lr = rng(54), shapes = {}, keys = new Set();
for (const p of places) for (;;) { const cells = new Set(); while (cells.size < 5) cells.add(Math.floor(lr() * 16)); const pts = [...cells].map((c) => [c % 4, Math.floor(c / 4)]); const n = V.norm(pts); if (keys.has(n.key) || n.pts.length < 5) continue; keys.add(n.key); shapes[p] = n.pts; break; }
const view = (p, r, drop = 0) => { const x = new Uint8Array(W * W), ox = Math.floor(r() * (W - 4)), oy = Math.floor(r() * (W - 4)); const pts = shapes[p].slice(); for (let i = 0; i < drop; i++) pts.splice(Math.floor(r() * pts.length), 1); for (const [a, b] of pts) x[(oy + b) * W + ox + a] = 1; return x; };
const noise = (r) => { const x = new Uint8Array(W * W); for (let i = 0; i < 3; i++) x[Math.floor(r() * SPX)] = 1; return x; };
// ---- visual region
const vis = new V.Model(), r = rng(1); for (let t = 1; t <= 300; t++) { vis.step(view(places[Math.floor(r() * places.length)], r)); if (t % 98 === 0) vis.rest(); } vis.rest();
const placeOf = new Map(); for (const u of vis.units.filter((u) => !u.loose)) { const k = V.norm(vis.exp(u)).key; const p = places.find((q) => V.norm(shapes[q]).key === k); if (p) placeOf.set(u.id, p); }
const units = vis.units.filter((u) => !u.loose && placeOf.has(u.id));
// read one view, with an optional expected set (ids); moving bar on
function read(x, expected) { const on = []; for (let i = 0; i < SPX; i++) if (x[i]) on.push([i % W, Math.floor(i / W)]); if (!on.length) return null;
  const all = units.length, priceAll = 1 + Math.log2(all + 1) / Math.log2(SPX), priceE = expected && expected.size ? 1 + Math.log2(expected.size + 1) / Math.log2(SPX) : priceAll;
  const scored = units.map((u) => { const pts = vis.exp(u), L = pts.length, t = new Map(); let best = 0; for (const [ux, uy] of pts) for (const [a, b] of on) { const k = (a - ux) * 1000 + (b - uy); const n = (t.get(k) || 0) + 1; t.set(k, n); if (n > best) best = n; }
    const s = 2 * best - L, price = expected && expected.has(u.id) ? priceE : priceAll; return { u, s, net: s - price }; }).sort((a, b) => b.net - a.net);
  if (scored[0].net > 0) return scored[0].u.id;
  const low = scored.filter((c) => c.s > 0).sort((a, b) => b.net - a.net); return low.length ? low[0].u.id : null; }   // gap: bar down to any saving
// ---- abstract region (C53 copy) learns walks over what was recognised (no feedback while learning)
const ids = [...placeOf.keys()]; globalThis.WORLD_SIZE = 8; globalThis.WORLD_VALUES = ids.length + 1;
const A = require('../C53-abstract-items/see.js'); const code = new Map(ids.map((id, i) => [id, i + 2])), idOf = new Map(ids.map((id, i) => [i + 2, id]));
const abs = new A.Model('FL', { atoms: true }), wr = rng(2);
const walk = (rr, L0) => { for (;;) { const starts = Object.keys(edges); const w = [starts[Math.floor(rr() * starts.length)]], L = L0 || 3 + Math.floor(rr() * 3); while (w.length < L && edges[w[w.length - 1]]) { const n = edges[w[w.length - 1]]; w.push(n[Math.floor(rr() * n.length)]); } if (w.length >= (L0 || 3)) return w; } };
for (let t = 1; t <= 400; t++) { const w = walk(wr), x = new Uint8Array(64); w.forEach((p, i) => { const id = read(view(p, wr), null); if (id != null) x[i] = code.get(id); }); abs.step(x); if (t % 98 === 0) abs.rest(); } abs.rest();
const mem = abs.explainers().map(([u]) => abs.exp(u).map((p) => [p[2], p[0]]));
// what the abstract region expects after the last two (bar 2), else after the last one (bar 1)
function expect(prev2, prev1) { const at = (bar) => { const out = new Set(); for (const cells of mem) for (const [s1, t1] of cells) if (s1 === prev1) { const ok2 = bar === 1 || cells.some(([s0, t0]) => s0 === prev2 && t0 === t1 - 1); if (!ok2) continue; for (const [s, t] of cells) if (t === t1 + 1) out.add(s); } return out; };
  let e = at(2); if (!e.size) e = at(1); return new Set([...e].map((c) => idOf.get(c))); }
// ---- walk real routes; at each step after the second, test a view under each situation, with and without feedback
const situations = [['expected, 0 missing', 'exp', 0], ['expected, 1 missing', 'exp', 1], ['expected, 2 missing', 'exp', 2], ['expected, 3 missing', 'exp', 3], ['surprise, 0 missing', 'sur', 0], ['surprise, 1 missing', 'sur', 1], ['surprise, 2 missing', 'sur', 2], ['noise (3 random pixels)', 'noise', 0]];
console.log(`visual region: ${units.length} landmarks · abstract region: ${abs.units.filter((u) => u.layer > 1 && !u.kind).length} assemblies, ${abs.kindsOf().length} with slots`);
console.log('situation                  | WITHOUT feedback: right, wrong (of which the expected thing), nothing | WITH feedback: same | expected set size');
const qr = rng(7), T = 200;
for (const [label, kind, drop] of situations) { const tally = { no: [0, 0, 0, 0], fb: [0, 0, 0, 0] }; let setSize = 0, n = 0;
  for (let i = 0; i < T; i++) { const w = walk(qr, 5); if (w.length < 5) continue; const k = 2 + Math.floor(qr() * (w.length - 2)), p2 = code.get(ids.find((id) => placeOf.get(id) === w[k - 2])), p1 = code.get(ids.find((id) => placeOf.get(id) === w[k - 1]));
    const E = expect(p2, p1); setSize += E.size; n++;
    let truth = w[k], x; if (kind === 'exp') x = view(truth, qr, drop); else if (kind === 'sur') { const others = places.filter((p) => ![...E].some((id) => placeOf.get(id) === p) && p !== w[k]); truth = others[Math.floor(qr() * others.length)]; x = view(truth, qr, drop); } else { truth = null; x = noise(qr); }
    for (const [key, ctx] of [['no', null], ['fb', E]]) { const id = read(x, ctx), got = id == null ? null : placeOf.get(id); const T4 = tally[key];
      if (got == null) T4[3]++; else if (got === truth) T4[0]++; else { T4[1]++; if (E.has(id)) T4[2]++; } } }
  const f = (a) => `${String(a[0]).padStart(3)} right, ${String(a[1]).padStart(3)} wrong (${String(a[2]).padStart(3)} expected), ${String(a[3]).padStart(3)} nothing`;
  console.log(`${label.padEnd(26)} | ${f(tally.no)} | ${f(tally.fb)} | ${(setSize / n).toFixed(1)}`); }

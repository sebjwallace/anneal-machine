// C40 · C39 SHRUNK RIGHT DOWN (owner's version). An 8 x 8 page is the space. Places sit on every other pixel (a 4 x 4
// grid of places); the pixel between two places is lit when that link is walked. A place is one pixel, always in the
// same spot. Bench at the top-left place, oak at the bottom-right. Some links are missing so it isn't a plain grid.
// A day: 2-3 wandering walks drawn together. No walk ever holds both bench and oak; no day's picture ever joins them.
// Test: only the bench and oak pixels are shown, everything else hidden; read (completion); is there a chain of lit
// places and links joining them? Was the thing used inside any one day? How much extra was filled?
// Repeated over many seeds and amounts of experience. Engine unchanged.
'use strict';
const path = require('path');
const W = 8; globalThis.WORLD_SIZE = W;
const S = path.join(__dirname, '../../../src/');
const { rng } = require(S + 'worlds/catalogue.js'), { Model } = require(S + 'engine/see.js');
const SEEDS = +(process.env.SEEDS || 20), DAYS = (process.env.DAYS || '20,40,80').split(',').map(Number);
const N = 4, pid = (c, r) => r * N + c, at = (p) => [2 * (p % N), 2 * Math.floor(p / N)], px = (p) => { const [x, y] = at(p); return y * W + x; };
const linkPx = (a, b) => { const [x1, y1] = at(a), [x2, y2] = at(b); return ((y1 + y2) / 2) * W + (x1 + x2) / 2; };
const missing = new Set(['1-5', '6-10', '9-13', '2-3', '7-11']), links = new Map(), edges = [];
for (let p = 0; p < N * N; p++) links.set(p, []);
for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (const [dc, dr] of [[1, 0], [0, 1]]) { if (c + dc >= N || r + dr >= N) continue; const a = pid(c, r), b = pid(c + dc, r + dr);
  if (!missing.has(a + '-' + b)) { links.get(a).push(b); links.get(b).push(a); edges.push([a, b]); } }
const BENCH = 0, OAK = N * N - 1;
const comps = (es) => { const adj = new Map(); for (const [a, b] of es) { (adj.get(a) || adj.set(a, []).get(a)).push(b); (adj.get(b) || adj.set(b, []).get(b)).push(a); } return adj; };
const reach = (adj, s) => { const seen = new Map([[s, null]]), q = [s]; while (q.length) { const u = q.shift(); for (const v of adj.get(u) || []) if (!seen.has(v)) { seen.set(v, u); q.push(v); } } return seen; };
function walk(r) { for (;;) { const L = 3 + Math.floor(r() * 4), w = [Math.floor(r() * N * N)];
  while (w.length < L) { const h = w[w.length - 1], pr = w[w.length - 2], nx = links.get(h).filter((v) => v !== pr), next = nx.length ? nx : links.get(h); w.push(next[Math.floor(r() * next.length)]); }
  if (!(w.includes(BENCH) && w.includes(OAK))) return w; } }
function day(r) { for (;;) { const x = new Uint8Array(W * W), es = []; const k = 2 + Math.floor(r() * 2);
  for (let n = 0; n < k; n++) { const w = walk(r); w.forEach((v, i) => { x[px(v)] = 1; if (i) { x[linkPx(w[i - 1], v)] = 1; es.push([w[i - 1], v]); } }); }
  if (!reach(comps(es), BENCH).has(OAK)) return x; } }
function run(seed, days) { const r = rng(400 + seed), m = new Model(), seen = []; for (let d = 1; d <= days; d++) { const x = day(r); seen.push(x); m.step(x); if (d % 98 === 0) m.rest(); } m.rest();
  const x = new Uint8Array(W * W), hid = new Uint8Array(W * W).fill(1); x[px(BENCH)] = 1; x[px(OAK)] = 1; hid[px(BENCH)] = 0; hid[px(OAK)] = 0;
  const q = m.read(x, hid), R = q.recon, lit = edges.filter(([a, b]) => R[px(a)] && R[px(b)] && R[linkPx(a, b)]), path = reach(comps(lit), BENCH);
  let route = null; if (path.has(OAK)) { route = []; for (let v = OAK; v != null; v = path.get(v)) route.unshift(v); }
  const inside = q.claims.map((c) => { const p = m.exp(c.c).map(([u, v]) => (v + c.dy) * W + u + c.dx); return seen.some((d) => p.every((i) => d[i])); });
  return { route, things: q.claims.length, allInside: inside.length > 0 && inside.every(Boolean), links: lit.length, nThings: m.units.filter((u) => !u.loose).length }; }
const shortest = reach(new Map(links), BENCH); let sl = 0; for (let v = OAK; shortest.get(v) != null; v = shortest.get(v)) sl++;
console.log(`places 4 x 4, ${edges.length} links, bench to oak shortest ${sl} steps · ${SEEDS} seeds each`);
for (const D of DAYS) { const t0 = Date.now(); let joined = 0, novel = 0, extra = 0, short = 0, nothing = 0, things = 0;
  for (let s = 0; s < SEEDS; s++) { const o = run(s, D); things += o.nThings; if (!o.things) nothing++;
    if (o.route) { joined++; if (!o.allInside) novel++; extra += o.links - (o.route.length - 1); if (o.route.length - 1 === sl) short++; } }
  console.log(`${String(D).padStart(3)} days: joined ${joined}/${SEEDS} (${novel} by a thing no single day held, ${short} shortest, ${joined ? (extra / joined).toFixed(1) : '-'} extra links filled) · nothing recalled ${nothing} · ${(things / SEEDS).toFixed(0)} things · ${((Date.now() - t0) / 1000 / SEEDS).toFixed(1)} s a run`); }

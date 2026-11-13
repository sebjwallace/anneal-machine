// C38 · ROUTES AS ASSEMBLIES OVER TIME. The engine, unchanged. A walk is shown as a STRIP: the views it passed, side by
// side in order (time as a direction on the page). So the engine builds walks from steps, and longer walks from shorter
// ones, by the same energy rule it uses for shapes. Strip slots are 4 wide (a 3 x 3 view and a gap): a declared choice.
// The park: 12 places on paths that cross; each place has its own view (4 lit pixels in 3 x 3, all different).
// Walks wander (no turning straight back) for 3-6 places. No walk ever contains both the bench and the oak.
// TESTS (recall = the engine's picture completion: the two end views shown, the slots between hidden, read, and the
// hidden slots read off the filled-in picture):
//   1. walked: the two ends of a walk it took; does it fill in the middle it walked?
//   2. never walked together: two places no walk held both of, the gap given as the shortest route; is the filled middle
//      a real route (every step is a path in the park)?
//   3. the same, with the gap not given: every gap from 1 to 6 is read and the cheapest reading is kept.
'use strict';
const path = require('path');
const W = 28; globalThis.WORLD_SIZE = W;
const S = path.join(__dirname, '../../../src/');
const { rng } = require(S + 'worlds/catalogue.js'), { Model, norm } = require(S + 'engine/see.js');
const WALKS = +(process.env.WALKS || 300), SLOT = 4, MAXS = Math.floor(W / SLOT);

// ---- the park. Places on a 4 x 3 layout; paths join some neighbours (a few missing, so it isn't a plain grid).
const names = ['bench', 'gate', 'fountain', 'pond', 'rose bed', 'junction A', 'bridge', 'junction B', 'hill', 'meadow', 'stream', 'oak'];
const xy = (i) => [i % 4, Math.floor(i / 4)], links = new Map(names.map((_, i) => [i, []]));
const missing = new Set(['1-5', '6-10', '2-3']);
for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) { const [a, b] = xy(i), [c, d] = xy(j);
  if (Math.abs(a - c) + Math.abs(b - d) === 1 && !missing.has(i + '-' + j)) { links.get(i).push(j); links.get(j).push(i); } }
const BENCH = 0, OAK = 11;
// views: 4 of the 9 pixels, all different (fixed seed)
const vr = rng(7), views = [], vk = new Set();
while (views.length < 12) { const cells = []; while (cells.length < 4) { const c = Math.floor(vr() * 9); if (!cells.includes(c)) cells.push(c); } const k = cells.sort().join(); if (vk.has(k)) continue; vk.add(k); views.push(cells.map((c) => [c % 3, Math.floor(c / 3)])); }
const strip = (seq) => { const x = new Uint8Array(W * W); seq.forEach((v, s) => { if (v == null) return; for (const [a, b] of views[v]) x[(1 + b) * W + s * SLOT + a] = 1; }); return x; };
const viewAt = (x, s) => { const on = []; for (let b = 0; b < 3; b++) for (let a = 0; a < 3; a++) if (x[(1 + b) * W + s * SLOT + a]) on.push(b * 3 + a); const k = on.join(); const i = views.findIndex((v) => v.map(([a, b]) => b * 3 + a).sort((p, q) => p - q).join() === k); return i >= 0 ? i : (on.length ? 'blur' : 'empty'); };
// shortest route lengths (for choosing test pairs and the given gap only; the engine never sees this)
const dist = names.map((_, s) => { const d = names.map(() => Infinity), q = [s]; d[s] = 0; while (q.length) { const u = q.shift(); for (const v of links.get(u)) if (d[v] === Infinity) { d[v] = d[u] + 1; q.push(v); } } return d; });

// ---- walks
function walk(r) { for (;;) { const L = 3 + Math.floor(r() * 4); let w = [Math.floor(r() * 12)];
  while (w.length < L) { const here = w[w.length - 1], prev = w[w.length - 2], nx = links.get(here).filter((v) => v !== prev), next = nx.length ? nx : links.get(here); w.push(next[Math.floor(r() * next.length)]); }
  if (!(w.includes(BENCH) && w.includes(OAK))) return w; } }
const m = new Model(), r = rng(38), walked = [], together = new Set(), t0 = Date.now();
for (let t = 1; t <= WALKS; t++) { const w = walk(r); walked.push(w); for (const a of w) for (const b of w) together.add(a + '|' + b); m.step(strip(w)); if (t % 98 === 0) { m.rest(); console.error(`  rest at ${t}: ${((Date.now() - t0) / 1000).toFixed(0)} s, ${m.units.filter((u) => !u.loose).length} things`); } }
m.rest();
const live = m.units.filter((u) => !u.loose), span = (u) => { const xs = norm(m.exp(u)).pts.map((p) => p[0]); return Math.floor((Math.max(...xs)) / SLOT) + 1; };
console.log(`park: 12 places, ${[...links.values()].reduce((a, l) => a + l.length, 0) / 2} paths · ${WALKS} walks learnt in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
const bySpan = {}; for (const u of live) { const s = span(u); bySpan[s] = (bySpan[s] || 0) + 1; }
console.log(`things learnt: ${live.length} (by how many views they span: ${Object.entries(bySpan).map(([s, n]) => `${s}: ${n}`).join(', ')}), kinds ${live.filter((u) => u.kind).length}`);

// ---- recall
function recall(a, b, gap) { const seq = Array(MAXS).fill(null); seq[0] = a; seq[gap] = b; const x = strip(seq), hid = new Uint8Array(W * W);
  for (let s = 1; s < gap; s++) for (let yy = 1; yy <= 3; yy++) for (let xx = 0; xx < SLOT; xx++) hid[yy * W + s * SLOT + xx] = 1;
  const q = m.read(x, hid), mid = []; for (let s = 1; s < gap; s++) mid.push(viewAt(q.recon, s)); return { mid, cost: q.cost, wrong: q.left.length + q.misses }; }
const real = (route) => route.every((v) => typeof v === 'number') && route.every((v, i) => !i || links.get(route[i - 1]).includes(v));
const say = (route) => route.map((v) => (typeof v === 'number' ? names[v] : `(${v})`)).join(' → ');

// 1. walked
const tr = rng(5); let same = 0, ok1 = 0; const n1 = 40;
for (let k = 0; k < n1; k++) { const w = walked[Math.floor(tr() * walked.length)], { mid } = recall(w[0], w[w.length - 1], w.length - 1), route = [w[0], ...mid, w[w.length - 1]];
  if (mid.join() === w.slice(1, -1).join()) same++; if (real(route)) ok1++; if (k < 3) console.log(`  walked ${say(w)}\n    recalled ${say(route)}`); }
console.log(`1. walked routes, from their two ends: ${same}/${n1} filled in exactly as walked, ${ok1}/${n1} a real route\n`);

// 2 and 3. never walked together
const pairs = []; for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) if (a !== b && !together.has(a + '|' + b) && dist[a][b] >= 2 && dist[a][b] < MAXS) pairs.push([a, b]);
let ok2 = 0, ok3 = 0, len3 = 0;
for (const [a, b] of pairs) { const g = dist[a][b], R = recall(a, b, g), route = [a, ...R.mid, b]; if (real(route)) ok2++;
  let best = null; for (let gg = 1; gg < MAXS; gg++) { const Q = recall(a, b, gg); if (!best || Q.cost < best.cost) best = { ...Q, gg }; }
  const route3 = [a, ...best.mid, b]; if (real(route3)) ok3++; if (best.gg === g) len3++;
  if (a === BENCH && b === OAK || pairs.indexOf(pairs.find((p) => p[0] === a && p[1] === b)) < 3) console.log(`  ${names[a]} to ${names[b]} (shortest ${g} steps):\n    gap given: ${say(route)}${R.wrong ? ` · ${R.wrong} px wrong` : ''}\n    gap chosen (${best.gg}): ${say(route3)}`); }
console.log(`2. never walked together (${pairs.length} pairs), gap given: ${ok2}/${pairs.length} a real route`);
console.log(`3. never walked together, gap chosen by cheapest reading: ${ok3}/${pairs.length} a real route (${len3} chose the shortest length)`);
// diagnosis: which walks does the engine hold as ONE thing (a stored route)? read each unit as a strip of views
const asRoute = (u) => { const pts = norm(m.exp(u)).pts; for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) { const x = new Uint8Array(W * W); let ok = true;
    for (const [a, b] of pts) { const X = a + dx, Y = b + dy + 1; if (X >= W || Y >= W) { ok = false; break; } x[Y * W + X] = 1; } if (!ok) continue;
    const seq = []; for (let s = 0; s < MAXS; s++) seq.push(viewAt(x, s)); while (seq.length && seq[seq.length - 1] === 'empty') seq.pop();
    if (seq.length && seq.every((v) => typeof v === 'number')) return seq; } return null; };
const routes = live.map(asRoute).filter((s) => s && s.length > 1), held = new Set(routes.map((s) => s.join()));
console.log(`\nroutes held as one thing: ${routes.length} (${routes.filter((s) => s.length >= 3).length} of 3+ places); e.g. ${routes.slice(0, 4).map(say).join(' | ')}`);
const tr2 = rng(5); let inHeld = 0, okHeld = 0, notHeld = 0, okNot = 0;
for (let k = 0; k < 40; k++) { const w = walked[Math.floor(tr2() * walked.length)], { mid } = recall(w[0], w[w.length - 1], w.length - 1), good = mid.join() === w.slice(1, -1).join();
  if (held.has(w.join())) { inHeld++; if (good) okHeld++; } else { notHeld++; if (good) okNot++; } }
console.log(`walked routes held as one thing: recalled exactly ${okHeld}/${inHeld} · not held as one thing: ${okNot}/${notHeld}`);

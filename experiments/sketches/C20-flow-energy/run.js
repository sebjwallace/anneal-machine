// C20: energy with the flow, against C19 on the same scenes. 12x12 world, rest every 98 flashes (as the page).
// MODEL=flow (default) or MODEL=instances (C19). Reports the same things for both, measured the same way.
'use strict';
const path = require('path');
const { CATALOGUE, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const which = process.env.MODEL || 'flow';
const { Model, SceneWorld, norm } = require(path.join(__dirname, '../../models/' + which + '.js'));
const W = new SceneWorld(CATALOGUE), FLASHES = +(process.env.FLASHES || 600), NOISE = +(process.env.NOISE || 0), SEED = +(process.env.SEED || 4242);
const art = (pts) => { let w = 0, h = 0; for (const [x, y] of pts) { w = Math.max(w, x + 1); h = Math.max(h, y + 1); } const g = Array.from({ length: h }, () => Array(w).fill('.')); for (const [x, y] of pts) g[y][x] = '#'; return g.map((q) => q.join('')).join('/'); };
const r = rng(SEED), m = new Model(which === 'flow' ? 'FL' : 'MI', {}); const t0 = Date.now(); let restMs = 0, awakeHeat = 0, late = 0, lateN = 0;
for (let t = 1; t <= FLASHES; t++) { const o = m.step(W.next(r, NOISE).x); awakeHeat += o.heatShare; if (t > FLASHES - 200) { late += o.heatShare; lateN++; }
  if (t % 98 === 0) { const a = Date.now(); m.rest(); restMs += Date.now() - a; } }
{ const a = Date.now(); m.rest(); restMs += Date.now() - a; }
// a common yardstick for both: description length of 300 fresh scenes, priced the C20 way, + the structure
const SPX = 144, pc = 1 + Math.log2(m.units.length + 1) / Math.log2(SPX), px = m.parts.reduce((a, p) => a + p.pts.length, 0);
const comp = m.units.filter((u) => u.layer > 1).reduce((a, u) => a + u.place.length, 0);
const f = rng(7); let flow = 0, fh = 0; for (let k = 0; k < 300; k++) { const q = m.read(W.next(f, NOISE).x); flow += pc * q.claims.length + q.left.length + q.misses; fh += (q.left.length + q.misses) / q.on; }
console.log(`[${which}] ${FLASHES} scenes, noise ${NOISE}, seed ${SEED}; total ${Date.now() - t0} ms (rest ${restMs} ms)`);
console.log(`units ${m.units.length} (per layer ${m.layers.map((L) => L.cols.length).join(' / ')}), depth ${m.layers.length}, memories ${m.items.length}`);
console.log(`crumbs (parts of 1-2 pixels): ${m.parts.filter((p) => p.pts.length <= 2).length}; pixels stored ${px}; composite links ${comp}; placement price ${pc.toFixed(2)}`);
if (m.tried !== undefined) console.log(`rest moves tried ${m.tried}, kept ${m.st.restSteps}, undone ${m.rejected}; kept: decompose ${m.st.factored}, compose ${m.st.composed}, dissolve ${m.st.dissolved}, fuse ${m.st.fused}; dropped unused ${m.st.dropped}`);
console.log(`awake heat: mean ${(awakeHeat / FLASHES).toFixed(3)}, last 200 scenes ${(late / lateN).toFixed(3)}`);
console.log(`yardstick, 300 fresh scenes: dictionary ${(px + pc * comp).toFixed(0)} + explaining ${flow.toFixed(0)} = ${(px + pc * comp + flow).toFixed(0)}; heat ${(fh / 300).toFixed(3)}`);
const byKey = new Map(); for (const u of m.units) { const k = norm(m.exp(u)).key; byKey.set(k, (byKey.get(k) || 0) + 1); }
console.log(`shapes held by more than one unit: ${[...byKey.values()].filter((n) => n > 1).length}`);
const want = { ...W.shapes, ...W.objects }, keys = new Map(m.units.map((u) => [norm(m.exp(u)).key, u]));
console.log('recovered as a single unit: ' + Object.entries(want).map(([nm, pts]) => { const u = keys.get(norm(pts).key); return `${nm} ${u ? 'L' + u.layer : 'no'}`; }).join(', '));
const e = rng(99); let heat = 0, n = 0, same = 0, units = 0, nh = 0, hh = 0, hu = 0, hsame = 0;
for (let k = 0; k < 200; k++) { const pick = W.things[Math.floor(e() * W.things.length)], copies = 2 + Math.floor(e() * 2), s = W.place(e, Array(copies).fill(pick)), q = m.read(s.x);
  const placed = s.name.split(' + ').length; if (placed < 2) continue; heat += (q.left.length + q.misses) / q.on; units += q.claims.length; n++;
  const top = new Map(); for (const c of q.claims) top.set(c.c, (top.get(c.c) || 0) + 1); if ([...top.values()].some((v) => v >= placed)) same++; }
for (let k = 0; k < 60; k++) { const s = W.held(e), q = m.read(s.x); if (s.name.split(' + ').length < 2) continue; hh += (q.left.length + q.misses) / q.on; hu += q.claims.length; nh++;
  const top = new Map(); for (const c of q.claims) top.set(c.c, (top.get(c.c) || 0) + 1); if ([...top.values()].some((v) => v >= 2)) hsame++; }
console.log(`copies of a known thing: heat ${(heat / n).toFixed(2)}, ${(units / n).toFixed(2)} units, one unit per copy in ${(100 * same / n).toFixed(0)}%`);
console.log(`two copies of a never-seen object: heat ${(hh / nh).toFixed(2)}, ${(hu / nh).toFixed(2)} units, a unit used for both in ${(100 * hsame / nh).toFixed(0)}%`);
const two = W.place(rng(5), [['house', W.objects.house], ['house', W.objects.house]]), q2 = m.read(two.x);
console.log(`example, "${two.name}": ` + q2.claims.map((c) => `L${c.c.layer}[${art(m.exp(c.c))}]@${c.dx},${c.dy}`).join(' + ') + ` · heat ${((q2.left.length + q2.misses) / q2.on).toFixed(2)}`);
if (process.env.LIST) for (const L of m.layers) console.log(`L${L.index + 1}: ` + L.cols.map((u) => art(m.exp(u)) + (u.layer > 1 ? '(' + u.place.length + ')' : '')).join('  '));

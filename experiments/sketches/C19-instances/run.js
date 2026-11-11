// C19: multiple instances. 12x12 world; half the scenes hold 2-3 copies of one thing. Rest every 98 flashes (as the page).
'use strict';
const path = require('path');
const { CATALOGUE, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model, SceneWorld, norm } = require(path.join(__dirname, '../../models/instances.js'));
const W = new SceneWorld(CATALOGUE), FLASHES = +(process.env.FLASHES || 600), NOISE = +(process.env.NOISE || 0);
const art = (pts) => { let w = 0, h = 0; for (const [x, y] of pts) { w = Math.max(w, x + 1); h = Math.max(h, y + 1); } const g = Array.from({ length: h }, () => Array(w).fill('.')); for (const [x, y] of pts) g[y][x] = '#'; return g.map((q) => q.join('')).join('/'); };
const r = rng(4242), m = new Model('MI', {}); const t0 = Date.now(); let restMs = 0;
for (let t = 1; t <= FLASHES; t++) { m.step(W.next(r, NOISE).x); if (t % 98 === 0) { const a = Date.now(); m.rest(); restMs += Date.now() - a; } }
{ const a = Date.now(); m.rest(); restMs += Date.now() - a; }
console.log(`12x12 world, ${FLASHES} scenes, noise ${NOISE}, rest every 98 flashes; total ${Date.now() - t0} ms (rest ${restMs} ms)`);
console.log(`units ${m.units.length} (layers ${m.layers.map((L) => L.cols.length).join(' / ')}), memories ${m.items.length}, energy ${m.energy()}`);
const byKey = new Map(); for (const u of m.units) { const k = norm(m.exp(u)).key; byKey.set(k, (byKey.get(k) || 0) + 1); }
console.log(`shapes held by more than one unit: ${[...byKey.values()].filter((n) => n > 1).length}`);
const want = { ...W.shapes, ...W.objects }, keys = new Map(m.units.map((u) => [norm(m.exp(u)).key, u]));
console.log('recovered as a single unit: ' + Object.entries(want).map(([nm, pts]) => { const u = keys.get(norm(pts).key); return `${nm} ${u ? 'L' + u.layer : 'no'}`; }).join(', '));
// first sight: scenes with copies of one thing; does the same unit explain every copy?
const e = rng(99); let heat = 0, n = 0, same = 0, units = 0, nh = 0, hh = 0, hu = 0, hsame = 0;
for (let k = 0; k < 200; k++) { const pick = W.things[Math.floor(e() * W.things.length)], copies = 2 + Math.floor(e() * 2), s = W.place(e, Array(copies).fill(pick)), q = m.read(s.x);
  const placed = s.name.split(' + ').length; if (placed < 2) continue; heat += (q.left.length + q.misses) / q.on; units += q.claims.length; n++;
  const top = new Map(); for (const c of q.claims) top.set(c.c, (top.get(c.c) || 0) + 1); if ([...top.values()].some((v) => v >= placed)) same++; }
for (let k = 0; k < 60; k++) { const s = W.held(e), q = m.read(s.x); if (s.name.split(' + ').length < 2) continue; hh += (q.left.length + q.misses) / q.on; hu += q.claims.length; nh++;
  const top = new Map(); for (const c of q.claims) top.set(c.c, (top.get(c.c) || 0) + 1); if ([...top.values()].some((v) => v >= 2)) hsame++; }
console.log(`\nfirst sight, scenes with 2-3 copies of a known thing: heat ${(heat / n).toFixed(2)}, ${(units / n).toFixed(2)} units, one unit used once per copy in ${(100 * same / n).toFixed(0)}% (${n} scenes)`);
console.log(`first sight, two copies of a never-seen object: heat ${(hh / nh).toFixed(2)}, ${(hu / nh).toFixed(2)} units, some unit used for both copies in ${(100 * hsame / nh).toFixed(0)}% (${nh} scenes)`);
const two = W.place(rng(5), [['house', W.objects.house], ['house', W.objects.house]]), q2 = m.read(two.x);
console.log(`\nexample, "${two.name}": ` + q2.claims.map((c) => `L${c.c.layer}[${art(m.exp(c.c))}]@${c.dx},${c.dy}`).join(' + ') + ` · heat ${((q2.left.length + q2.misses) / q2.on).toFixed(2)}`);

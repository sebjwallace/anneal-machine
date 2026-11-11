// C18: shift-invariant decomposition and composition in a 10x10 world of scenes.
'use strict';
const path = require('path');
const { CATALOGUE, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model, SceneWorld, SW, norm, ptsOf } = require(path.join(__dirname, '../../models/shift.js'));
const W = new SceneWorld(CATALOGUE), FLASHES = +(process.env.FLASHES || 150), NOISE = +(process.env.NOISE || 0);
const art = (pts) => { let w = 0, h = 0; for (const [x, y] of pts) { w = Math.max(w, x + 1); h = Math.max(h, y + 1); } const g = Array.from({ length: h }, () => Array(w).fill('.')); for (const [x, y] of pts) g[y][x] = '#'; return g.map((r) => r.join('')).join('/'); };
const r = rng(4242), m = new Model('SH', {}); let t0 = Date.now();
for (let t = 0; t < FLASHES; t++) m.step(W.next(r, NOISE).x);
const awakeMs = Date.now() - t0;
function report(label) {
  const e = rng(99); let heat = 0, units = 0, n = 0, hh = 0, hu = 0;
  for (let k = 0; k < 100; k++) { const s = W.next(e, 0), q = m.read(s.x); heat += (q.left.length + q.misses) / q.on; units += q.claims.length; n++; }
  for (let k = 0; k < 40; k++) { const s = W.held(e), q = m.read(s.x); hh += (q.left.length + q.misses) / q.on; hu += q.claims.length; }
  console.log(`  ${label}: units per layer ${m.layers.map((L) => L.cols.length).join(' / ')} · memories ${m.items.length} · energy ${m.energy()} · new scenes: heat ${(heat / n).toFixed(2)}, ${(units / n).toFixed(2)} units each · scenes with a never-seen object: heat ${(hh / 40).toFixed(2)}, ${(hu / 40).toFixed(2)} units`);
}
console.log(`world 10x10; ${FLASHES} awake scenes (1-3 things each), noise ${NOISE}; awake took ${awakeMs} ms`);
report('awake only     ');
t0 = Date.now(); let s1 = 0; while (m.phase === 'decompose' && m.restStep()) s1++; report(`decomposed (${s1} steps, ${Date.now() - t0} ms)`);
t0 = Date.now(); const s2 = m.rest(); report(`composed (${s2} steps, ${Date.now() - t0} ms)`);
const want = { ...W.shapes, ...W.objects }, keys = new Map(m.units.map((u) => [norm(m.exp(u)).key, u]));
console.log('\n  recovered as a single unit (shape or object -> layer):');
for (const [nm, pts] of Object.entries(want)) { const u = keys.get(norm(pts).key); console.log(`    ${nm.padEnd(8)} ${u ? 'yes, layer ' + u.layer + (u.layer > 1 ? ' = ' + u.place.map((k) => `[${art(m.exp(k.u))}]@${k.dx},${k.dy}`).join(' + ') : '') : 'no'}   [${art(pts)}]`); }
console.log('\n  all units (layer · used by · picture):'); for (const u of [...m.units].sort((a, b) => a.layer - b.layer || m.itemsUsing(b) - m.itemsUsing(a))) console.log(`    L${u.layer} · ${m.itemsUsing(u)} · ${art(m.exp(u))}`);

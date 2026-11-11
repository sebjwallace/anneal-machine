// C18 probe: run like the page (rest every 98 flashes) and list units that are the same shape, or that contain a house.
'use strict';
const path = require('path');
const { CATALOGUE, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model, SceneWorld, norm } = require(path.join(__dirname, '../../models/shift.js'));
const W = new SceneWorld(CATALOGUE), r = rng(7919 * 1 + 13), m = new Model('SH', {});
const art = (pts) => { let w = 0, h = 0; for (const [x, y] of pts) { w = Math.max(w, x + 1); h = Math.max(h, y + 1); } const g = Array.from({ length: h }, () => Array(w).fill('.')); for (const [x, y] of pts) g[y][x] = '#'; return g.map((q) => q.join('')).join('/'); };
for (let t = 1; t <= +(process.env.FLASHES || 1200); t++) { m.step(W.next(r, 0).x); if (t % 98 === 0) m.rest(); }
const byKey = new Map(); for (const u of m.units) { const k = norm(m.exp(u)).key; if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(u); }
const dup = [...byKey.values()].filter((g) => g.length > 1);
console.log(`units ${m.units.length} (layers ${m.layers.map((L) => L.cols.length).join(' / ')}), memories ${m.items.length}; shapes held by more than one unit: ${dup.length}`);
for (const g of dup) console.log(`  ${g.length} units, same shape [${art(m.exp(g[0]))}]: ` + g.map((u) => `L${u.layer}${u.layer > 1 ? '(' + u.place.length + ' parts)' : ''} used ${m.itemsUsing(u)}`).join(', '));
const house = norm(W.objects.house).pts, hk = new Set(house.map(([x, y]) => x + ',' + y));
console.log('\nunits containing a whole house:');
for (const u of m.units) { const e = m.exp(u); for (let dx = -9; dx <= 9; dx++) for (let dy = -9; dy <= 9; dy++) { const s = new Set(e.map(([x, y]) => (x - dx) + ',' + (y - dy))); if ([...hk].every((k) => s.has(k))) { console.log(`  L${u.layer} used ${m.itemsUsing(u)} · ${e.length} px · [${art(e)}]` + (u.layer > 1 ? ' = ' + u.place.map((k) => `L${k.u.layer}[${art(m.exp(k.u))}]`).join(' + ') : '')); dx = 99; break; } } }

// C26: the seeing layer with its crutches taken out (models/clean.js), against C20 (models/flow.js), same scenes.
'use strict';
const path = require('path');
const { CATALOGUE, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const which = process.env.MODEL || 'clean';
const { Model, SceneWorld, norm } = require(path.join(__dirname, '../../models/' + which + '.js'));
const W = new SceneWorld(CATALOGUE), FLASHES = +(process.env.FLASHES || 600), SEED = +(process.env.SEED || 4242);
const r = rng(SEED), m = new Model('FL', {}); const t0 = Date.now(); let restMs = 0;
for (let t = 1; t <= FLASHES; t++) { m.step(W.next(r, 0).x); if (t % 98 === 0) { const a = Date.now(); m.rest(); restMs += Date.now() - a; } }
{ const a = Date.now(); m.rest(); restMs += Date.now() - a; }
const live = m.units.filter((u) => !u.loose), parts = live.filter((u) => u.layer === 1), loose = m.units.filter((u) => u.loose);
const SPX = 144, pc = 1 + Math.log2(live.length + 1) / Math.log2(SPX), px = parts.reduce((a, p) => a + p.pts.length, 0), comp = live.filter((u) => u.layer > 1).reduce((a, u) => a + u.place.filter((k) => !k.u.loose).length, 0);
const f = rng(7); let flow = 0, fh = 0, used = new Set(); for (let k = 0; k < 300; k++) { const q = m.read(W.next(f, 0).x); flow += pc * q.claims.length + q.left.length + q.misses; fh += (q.left.length + q.misses) / q.on; q.claims.forEach((c) => used.add(c.c)); }
const keys = new Map(live.map((u) => [norm(m.exp(u)).key, u])), want = { ...W.shapes, ...W.objects };
console.log(`[${which}] seed ${SEED}: total ${((Date.now() - t0) / 1000).toFixed(1)} s (rest ${(restMs / 1000).toFixed(1)} s)`);
console.log(`  units ${live.length} (per layer ${[...new Set(live.map((u) => u.layer))].sort().map((L) => live.filter((u) => u.layer === L).length).join(' / ')}), loose memory remainders ${loose.length}, memories ${m.items.length}`);
console.log(`  units never used on 300 fresh scenes: ${live.filter((u) => !used.has(u) && !live.some((c) => c.layer > 1 && c.place.some((k) => k.u === u))).length}; crumbs (1-2 px parts) ${parts.filter((p) => p.pts.length <= 2).length}`);
console.log(`  yardstick, 300 fresh scenes: dictionary ${(px + pc * comp).toFixed(0)} + explaining ${flow.toFixed(0)} = ${(px + pc * comp + flow).toFixed(0)}; heat ${(fh / 300).toFixed(3)}`);
console.log('  recovered as one unit: ' + Object.entries(want).map(([nm, pts]) => { const u = keys.get(norm(pts).key); return `${nm} ${u ? 'L' + u.layer : 'no'}`; }).join(', '));

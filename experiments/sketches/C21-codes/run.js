// C21: sparse codes on primitive columns. Learns with C20 (flow.js) exactly as C20's run, then encodes.
'use strict';
const path = require('path');
const { CATALOGUE, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model, SceneWorld, norm, SW, SH } = require(path.join(__dirname, '../../models/flow.js'));
const { Codes } = require(path.join(__dirname, '../../models/codes.js'));
const W = new SceneWorld(CATALOGUE), SEED = +(process.env.SEED || 4242), r = rng(SEED), m = new Model('FL', {});
for (let t = 1; t <= 600; t++) { m.step(W.next(r, 0).x); if (t % 98 === 0) m.rest(); } m.rest();
const C = new Codes(m, { floors: process.env.FLOORS || 'level', sample: +(process.env.SAMPLE || 3) });
const art = (pts) => { let w = 0, h = 0; for (const [x, y] of pts) { w = Math.max(w, x + 1); h = Math.max(h, y + 1); } const g = Array.from({ length: h }, () => Array(w).fill('.')); for (const [x, y] of pts) g[y][x] = '#'; return g.map((q) => q.join('')).join('/'); };
const put = (list) => { const x = new Uint8Array(SW * SH); for (const [pts, ox, oy] of list) for (const [a, b] of pts) x[(oy + b) * SW + ox + a] = 1; return x; };
const unitOf = (pts) => m.units.find((u) => norm(m.exp(u)).key === norm(pts).key);
const show = (cells) => cells.map((c) => `${art(c.col.pts)}@${c.x},${c.y}`).join('  ');
const grid = (cells, col) => { const g = Array.from({ length: 2 * SH - 1 }, () => Array(2 * SW - 1).fill('·')); for (const c of cells) if (c.col === col) g[c.y + SH - 1][c.x + SW - 1] = '●'; g[SH - 1][SW - 1] = g[SH - 1][SW - 1] === '●' ? '◉' : '+'; return g.slice(SH - 4, SH + 3).map((row) => '      ' + row.slice(SW - 6, SW + 5).join(' ')).join('\n'); };
console.log(`C21 · learnt with C20 (seed ${SEED}): ${m.parts.length} primitive columns, ${m.units.length - m.parts.length} composites (now assemblies). floors: ${C.o.floors}, sample per child: ${C.o.sample}\n`);

// A. the same thing anywhere: one assembly
const house = unitOf(W.objects.house); let same = 0, n = 0; const base = new Set(C.code(house).map((c) => C.key(c))), wheres = new Set();
for (let k = 0; k < 40; k++) { const s = W.place(rng(100 + k), [['house', W.objects.house]]), e = C.encode(s.x), t = e.things.find((z) => z.unit === house); n++; if (t && t.code.every((c) => base.has(C.key(c))) && t.code.length === base.size) same++; wheres.add(e.where.map((c) => C.key(c)).sort().join(' ')); }
console.log(`A. a house at 40 random places: its assembly identical in ${same}/${n}; floor-0 ("where") cells: ${wheres.size} different sets`);
console.log(`   house assembly (${C.code(house).length} cells): ${show(C.code(house))}\n`);

// B. two sticks side by side
const stick = W.shapes.stick, sx = put([[stick, 4, 4], [stick, 6, 4]]), e2 = C.encode(sx), scol = e2.where[0] && e2.where[0].col;
console.log(`B. two sticks side by side ("${art(stick)}" at x=4 and x=6): explained by ${e2.things.map((t) => 'L' + t.unit.layer + '[' + art(m.exp(t.unit)) + ']').join(' + ')}`);
console.log(`   floor-0 cells: ${show(e2.where)}\n   stick column, floor 0 (+ = centre of attention, ● = active cell):\n${grid(e2.where, scol)}\n`);

// C. two houses side by side
const hx = put([[W.objects.house, 1, 3], [W.objects.house, 7, 3]]), e3 = C.encode(hx), hs = e3.things.filter((t) => t.unit === house);
console.log(`C. two houses side by side: ${e3.things.length} things recognised, ${hs.length} of them the house unit`);
if (hs.length === 2) { console.log(`   their assemblies: identical ${C.overlap(hs[0].code, hs[1].code) === 1 ? 'yes' : 'no'} (same kind of thing)`);
  console.log(`   their floor-0 cells: shared ${C.overlap(hs[0].where, hs[1].where).toFixed(2)} (where each one is)`); console.log(`   left house where: ${show(hs[0].where)}\n   right house where: ${show(hs[1].where)}`); }
console.log('');

// D. similarity: which assemblies share cells (shared floor needed to compare across layers)
const S = new Codes(m, { floors: 'shared', sample: C.o.sample }), named = Object.entries({ ...W.shapes, ...W.objects }).map(([nm, pts]) => [nm, unitOf(pts)]).filter(([, u]) => u && u.layer > 1);
console.log('D. overlap between assemblies (floor shared by all composites; 1 = all of the smaller one shared):');
console.log('          ' + named.map(([nm]) => nm.padEnd(7)).join(' '));
for (const [a, ua] of named) console.log('   ' + a.padEnd(7) + named.map(([, ub]) => (ua === ub ? '  -    ' : S.overlap(S.code(ua), S.code(ub)).toFixed(2).padEnd(7))).join(' '));
for (const [nm, pts] of Object.entries(W.heldObjects)) { const e = S.encode(put([[pts, 3, 3]])), f = S.fresh(e), best = named.map(([k, u]) => [k, S.overlap(f, S.code(u))]).sort((a, b) => b[1] - a[1])[0];
  console.log(`   never seen, ${nm} [${art(pts)}]: held as a new assembly of ${f.length} cells in existing columns; closest known: ${best[0]} (${best[1].toFixed(2)})`); }
console.log('');

// E. does an assembly still carry the thing? rebuild pixels from its cells
for (const sample of [1, 2, 3, 99]) { const Z = new Codes(m, { floors: 'level', sample }); let got = 0, all = 0, cells = 0;
  for (const [, u] of named) { const want = new Set(norm(m.exp(u)).pts.map(([x, y]) => x + ',' + y)), d = norm(Z.draw(Z.code(u))).pts.map(([x, y]) => x + ',' + y); got += d.filter((k) => want.has(k)).length; all += want.size; cells += Z.code(u).length; }
  console.log(`E. sample ${sample === 99 ? 'all' : sample} per child: assemblies average ${(cells / named.length).toFixed(1)} cells; rebuilding pixels from the cells recovers ${(100 * got / all).toFixed(0)}% of each thing`); }
console.log('');

// F. sizes: a scene in cells vs pixels; collisions between levels
const f = rng(7); let px = 0, cw = 0, ca = 0; const used = new Set();
for (let k = 0; k < 300; k++) { const e = C.encode(W.next(f, 0).x); px += e.q.on; cw += e.where.length; ca += e.things.reduce((a, t) => a + t.code.length, 0); for (const c of [...e.where, ...e.things.flatMap((t) => t.code)]) used.add(C.key(c)); }
const floors = 1 + Math.max(...m.units.map((u) => C.floor(u))), cap = m.parts.length * (2 * SW - 1) * (2 * SH - 1) * floors;
console.log(`F. 300 fresh scenes: on average ${(px / 300).toFixed(1)} pixels → ${(cw / 300).toFixed(1)} "where" cells + ${(ca / 300).toFixed(1)} assembly cells; ${used.size} distinct cells used of ${cap} (${m.parts.length} columns × ${2 * SW - 1}×${2 * SH - 1} grid × ${floors} floors)`);
let clash = 0, pairs = 0; const comps = m.units.filter((u) => u.layer > 1);
for (let i = 0; i < comps.length; i++) for (let j = i + 1; j < comps.length; j++) { pairs++; if (comps[i].layer !== comps[j].layer && S.overlap(S.code(comps[i]), S.code(comps[j])) > 0) clash++; }
console.log(`   cells shared between composites at DIFFERENT levels, if they all used one floor: ${clash} of ${pairs} pairs (with a floor per level: 0 by construction)`);

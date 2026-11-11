// ENGINE TEST · cells: C21's tests (same thing anywhere, two sticks, two houses, similarity, assemblies, sparseness) on the engine.
'use strict';
const path = require('path');
const { CATALOGUE, rng } = require(path.join(__dirname, '../worlds/catalogue.js'));
const { Model, norm, SW, SH } = require(path.join(__dirname, '../engine/see.js'));
const { SceneWorld } = require(path.join(__dirname, '../worlds/scenes.js'));
const { Codes } = require(path.join(__dirname, '../engine/cells.js'));
const { load } = require(path.join(__dirname, 'world.js')), W = new SceneWorld(CATALOGUE), SEED = 4242, m = load();
const C = new Codes(m);
const art = (pts) => { let w = 0, h = 0; for (const [x, y] of pts) { w = Math.max(w, x + 1); h = Math.max(h, y + 1); } const g = Array.from({ length: h }, () => Array(w).fill('.')); for (const [x, y] of pts) g[y][x] = '#'; return g.map((q) => q.join('')).join('/'); };
const put = (list) => { const x = new Uint8Array(SW * SH); for (const [pts, ox, oy] of list) for (const [a, b] of pts) x[(oy + b) * SW + ox + a] = 1; return x; };
const unitOf = (pts) => m.units.find((u) => norm(m.exp(u)).key === norm(pts).key);
const show = (cells) => cells.map((c) => `${art(c.col.pts)}@${c.x},${c.y}`).join('  ');
const grid = (cells, col) => { const g = Array.from({ length: 2 * SH - 1 }, () => Array(2 * SW - 1).fill('·')); for (const c of cells) if (c.col === col) g[c.y + SH - 1][c.x + SW - 1] = '●'; g[SH - 1][SW - 1] = g[SH - 1][SW - 1] === '●' ? '◉' : '+'; return g.slice(SH - 4, SH + 3).map((row) => '      ' + row.slice(SW - 6, SW + 5).join(' ')).join('\n'); };
console.log(`ENGINE TEST · cells (C21's tests). Learnt by the engine: ${m.parts.length} primitive columns, ${m.units.length - m.parts.length} composites (assemblies = smallest set completion rebuilds from)\n`);

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

// D. similarity: which things share cells (each thing's full set of cells, offsets from its own centre, in one frame)
const named = Object.entries({ ...W.shapes, ...W.objects }).map(([nm, pts]) => [nm, unitOf(pts)]).filter(([, u]) => u && u.layer > 1);
const kk = (c) => c.col.id + '|' + c.x + ',' + c.y, ov = (a, b) => { const A = new Set(a.map(kk)); return b.filter((c) => A.has(kk(c))).length / Math.max(1, Math.min(a.length, b.length)); };
console.log('D. overlap between things (1 = all of the smaller one shared):');
console.log('          ' + named.map(([nm]) => nm.padEnd(7)).join(' '));
for (const [a, ua] of named) console.log('   ' + a.padEnd(7) + named.map(([, ub]) => (ua === ub ? '  -    ' : ov(C.whole(ua), C.whole(ub)).toFixed(2).padEnd(7))).join(' '));
for (const [nm, pts] of Object.entries(W.heldObjects)) { const e = C.encode(put([[pts, 3, 3]])), fr = C.fresh(e), best = named.map(([k, u]) => [k, ov(fr, C.whole(u))]).sort((a, b) => b[1] - a[1])[0];
  console.log(`   never seen, ${nm} [${art(pts)}]: held as a new assembly of ${fr.length} cells in existing columns; closest known: ${best[0]} (${best[1].toFixed(2)})`); }
console.log('');
// E. assemblies: the smallest set of cells completion rebuilds the thing from
{ let cells = 0, whole = 0, back = 0, all = 0, drawn = 0; for (const [, u] of named) { const code = C.code(u), w = C.whole(u); cells += code.length; whole += w.length;
    const want = new Set(norm(m.exp(u)).pts.map(([x, y]) => x + ',' + y)), cue = code.map((c) => ({ col: c.col, x: c.x, y: c.y })), got = C.K.settle(cue).cells;
    back += norm(C.draw(got)).pts.filter(([x, y]) => want.has(x + ',' + y)).length; drawn += norm(C.draw(cue)).pts.filter(([x, y]) => want.has(x + ',' + y)).length; all += want.size; }
  console.log(`E. assemblies keep on average ${(cells / named.length).toFixed(1)} of ${(whole / named.length).toFixed(1)} cells; drawn alone they show ${(100 * drawn / all).toFixed(0)}% of each thing; completed, ${(100 * back / all).toFixed(0)}%`);
  console.log('   ' + named.map(([nm, u]) => nm + ' ' + C.code(u).length + '/' + C.whole(u).length).join(', ')); }
console.log('');
// F. sparseness; levels
const f = rng(7); let px = 0, cw = 0, ca = 0; const used = new Set();
for (let k = 0; k < 300; k++) { const e = C.encode(W.next(f, 0).x); px += e.q.on; cw += e.where.length; ca += e.things.reduce((a, t) => a + t.code.length, 0); for (const c of [...e.where, ...e.things.flatMap((t) => t.code)]) used.add(C.key(c)); }
const floors = 1 + Math.max(...m.units.map((u) => C.floor(u))), cap = m.parts.length * (2 * SW - 1) * (2 * SH - 1) * floors;
console.log(`F. 300 fresh scenes: on average ${(px / 300).toFixed(1)} pixels → ${(cw / 300).toFixed(1)} "where" cells + ${(ca / 300).toFixed(1)} assembly cells; ${used.size} distinct cells used of ${cap}`);

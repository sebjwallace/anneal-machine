// C34 RUN: the unchanged engine (src/engine/see.js) on the hex world. Env: N (pictures, default 600), W (default 12),
// TURNS=1 to show every shape at any of its six turns. Writes out.json (parts learnt, a few explained pictures) for the viewer.
'use strict';
const path = require('path'), fs = require('fs');
globalThis.WORLD_SIZE = +(process.env.W || 12);
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const { Model, norm } = require(path.join(__dirname, '../../../src/engine/see.js'));
const { HexWorld, SHAPES, OBJECTS, expand, turn, keyPts } = require('./hexworld.js');
const W = globalThis.WORLD_SIZE, N = +(process.env.N || 600), TURNS = !!process.env.TURNS;
const world = new HexWorld(W, { turns: TURNS }), r = rng(4242), m = new Model('FL', {}), t0 = Date.now();
for (let t = 1; t <= N; t++) { m.step(world.next(r).x); if (t % 98 === 0) m.rest(); } m.rest();
const live = m.units.filter((u) => !u.loose), shape = (u) => norm(m.exp(u)).pts;
// which true shapes and objects (at any turn) were found as parts
const truth = {}; for (const n of [...Object.keys(SHAPES), ...Object.keys(OBJECTS)]) for (let k = 0; k < 6; k++) truth[keyPts(turn(expand(n), k))] = truth[keyPts(turn(expand(n), k))] || `${n}${k ? ' turned ' + k * 60 + '°' : ''}`;
const found = live.map((u) => truth[keyPts(shape(u))] || null);
// fresh pictures: heat (share of pixels left unexplained or wrong)
const f = rng(99); let on = 0, bad = 0; const samples = [];
for (let i = 0; i < 200; i++) { const p = world.next(f), q = m.read(p.x); on += q.on; bad += q.left.length + q.misses;
  if (i < 6) samples.push({ x: [...p.x], claims: q.claims.map((c) => ({ id: c.c.id, pts: m.exp(c.c).map(([a, b]) => [a + c.dx, b + c.dy]) })), left: q.left }); }
const out = { W, N, turns: TURNS, seconds: (Date.now() - t0) / 1000, bill: m.measure().E, heat: bad / on,
  parts: live.map((u, i) => ({ id: u.id, layer: u.layer, pts: shape(u), is: found[i] })), samples };
fs.writeFileSync(path.join(__dirname, TURNS ? 'out-turns.json' : 'out.json'), JSON.stringify(out));
console.log(`hex world ${W}x${W}${TURNS ? ', any of six turns' : ''} · ${N} pictures in ${out.seconds.toFixed(0)} s · parts ${live.length} · bill ${out.bill.toFixed(0)} · heat on fresh pictures ${(100 * out.heat).toFixed(1)}%`);
console.log('  parts:', live.map((u, i) => (found[i] || `(other, ${shape(u).length} hexagons)`) + ` L${u.layer}`).join(' · '));
const names = [...Object.keys(SHAPES), ...Object.keys(OBJECTS)];
console.log('  true things found:', names.filter((n) => found.some((x) => x && x.startsWith(n))).join(', ') || 'none', `(of ${names.length})`);

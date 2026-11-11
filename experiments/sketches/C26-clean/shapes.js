// C26: learn the shapes of the moving-things world (objects and loose bricks) with the cleaned seeing layer, and save them.
'use strict';
globalThis.WORLD_SIZE = +(process.env.SIZE || 24);
const path = require('path'), fs = require('fs');
const { rng } = require(path.join(__dirname, '../../world/catalogue.js')), B = require(path.join(__dirname, '../../world/bumpers.js'));
const { Model } = require(path.join(__dirname, '../../models/clean.js'));
const N = globalThis.WORLD_SIZE, r = rng(1), m = new Model('FL', {}), t0 = Date.now();
// scenes of 1-3 separate things (a square, a diamond or a brick), as C20 learnt its shapes: no clutter
for (let t = 1; t <= 300; t++) { const n = 1 + Math.floor(r() * 3), o = B.start(r, n, N), l = [], objs = [];
  for (const q of o) { if (r() < 1 / 3) l.push([q.x, q.y + 1]); else objs.push(q); }   // some of the slots hold a brick instead of an object
  m.step(B.picture(objs, N, l)); if (t % 98 === 0) m.rest(); } m.rest();
const live = m.units.filter((u) => !u.loose);
const out = live.map((u) => ({ id: u.id, layer: u.layer, pts: u.pts || null, place: u.place ? u.place.map((k) => ({ u: k.u.id, dx: k.dx, dy: k.dy })) : null }));
fs.writeFileSync(path.join(__dirname, 'cache', 'shapes-' + N + '.json'), JSON.stringify(out));
console.log(`learnt in ${((Date.now() - t0) / 1000).toFixed(0)} s: ${live.length} units (${live.filter((u) => u.layer === 1).length} parts), price of a placement ${m.pc().toFixed(2)}`);

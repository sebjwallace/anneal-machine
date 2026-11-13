// Shared by the engine tests: learn the 12x12 world once with the engine (600 scenes, rest every 98), save the units, reload.
'use strict';
const path = require('path'), fs = require('fs');
const { CATALOGUE, rng } = require(path.join(__dirname, '../worlds/catalogue.js'));
const { Model } = require(path.join(__dirname, '../engine/see.js'));
const { SceneWorld } = require(path.join(__dirname, '../worlds/scenes.js'));
const FILE = path.join(__dirname, 'cache', 'world12-4242.json');
// (the cache holds plain units only: this world forms no kinds; if it ever does, extend the format)
function learn() { const W = new SceneWorld(CATALOGUE), r = rng(4242), m = new Model('FL', {}); for (let t = 1; t <= 600; t++) { m.step(W.next(r, 0).x); if (t % 98 === 0) m.rest(); } m.rest();
  const live = m.units.filter((u) => !u.loose); fs.writeFileSync(FILE, JSON.stringify(live.map((u) => ({ id: u.id, layer: u.layer, pts: u.pts || null, place: u.place ? u.place.map((k) => ({ u: k.u.id, dx: k.dx, dy: k.dy })) : null })))); }
function load() { if (!fs.existsSync(FILE)) learn(); const m = new Model('FL', {}), saved = JSON.parse(fs.readFileSync(FILE, 'utf8')), by = new Map();
  for (const s of saved) { const u = { id: s.id, layer: s.layer, uses: 0, born: 0, last: 0, cells: [] }; if (s.pts) { u.pts = s.pts; u.key = s.pts.map(([x, y]) => x + ',' + y).join(';'); } by.set(s.id, u); m.units.push(u); }
  for (const s of saved) if (s.place) by.get(s.id).place = s.place.map((k) => ({ u: by.get(k.u), dx: k.dx, dy: k.dy }));
  m.nid = Math.max(...saved.map((s) => s.id)) + 1; m.refresh(); return m; }
module.exports = { load, World: () => new SceneWorld(CATALOGUE), rng };

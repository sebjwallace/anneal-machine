// load saved shapes into a fresh model (for experiments that only explain, never learn shapes)
'use strict';
const path = require('path'), fs = require('fs');
module.exports = function load(Model, N) { const m = new Model('FL', {}), saved = JSON.parse(fs.readFileSync(path.join(__dirname, 'cache', 'shapes-' + N + '.json'), 'utf8')), by = new Map();
  for (const s of saved) { const u = { id: s.id, layer: s.layer, uses: 0, born: 0, last: 0, cells: [] }; if (s.pts) { u.pts = s.pts; u.key = s.pts.map(([x, y]) => x + ',' + y).join(';'); } by.set(s.id, u); m.units.push(u); }
  for (const s of saved) if (s.place) by.get(s.id).place = s.place.map((k) => ({ u: by.get(k.u), dx: k.dx, dy: k.dy }));
  m.nid = Math.max(...saved.map((s) => s.id)) + 1; m.refresh(); return m; };

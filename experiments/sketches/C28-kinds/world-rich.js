// C28 RICH WORLD: bases made of three separate pieces, fillers on top (one empty row between).
//  table (plank over two legs) + cap | peak | dots | hook      frame (leg, ring, leg) + cap | peak | hook      held out: frame + dots
'use strict';
const base = require('./world.js');
const P = { plank: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], leg: [[0, 0], [0, 1], [0, 2]], ring: base.SHAPES.box, cap: base.SHAPES.cap, peak: base.SHAPES.peak, dots: base.SHAPES.dots, hook: [[0, 0], [1, 0], [2, 0], [2, 1]] };
const at = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
const table = [...at(P.plank, 0, 0), ...at(P.leg, 0, 2), ...at(P.leg, 4, 2)];
const frame = [...at(P.leg, 0, 0), ...at(P.ring, 2, 0), ...at(P.leg, 6, 0)];
const obj = (b, f, fx) => [...at(P[f], fx, 0), ...at(b, 0, 3)];
const OBJECTS = { 'table+cap': obj(table, 'cap', 1), 'table+peak': obj(table, 'peak', 1), 'table+dots': obj(table, 'dots', 1), 'table+hook': obj(table, 'hook', 1),
  'frame+cap': obj(frame, 'cap', 2), 'frame+peak': obj(frame, 'peak', 2), 'frame+hook': obj(frame, 'hook', 2) };
const HELD = { 'frame+dots': obj(frame, 'dots', 2) };
const LOOSE = { plank: P.plank, leg: P.leg, ring: P.ring, cap: P.cap, peak: P.peak, dots: P.dots, hook: P.hook };
function next(r, W) { const n = 1 + Math.floor(r() * 2), list = []; for (let k = 0; k < n; k++) { const pool = r() < 0.7 ? OBJECTS : LOOSE, e = Object.entries(pool); list.push(e[Math.floor(r() * e.length)]); } return base.place(r, list, W); }
module.exports = { SHAPES: P, OBJECTS, HELD, LOOSE, place: base.place, next };

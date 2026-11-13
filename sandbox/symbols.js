// A WORLD OF SYMBOLS, for teaching columns and assemblies from first principles, with no pictures.
// Primitives are plain symbols (A, B, C, ...): they could be strokes, notes, words, anything with a "where".
// Things are primitives at offsets; bigger things are things at offsets. The real engine's cells and completion code
// (../src/engine/cells.js and complete.js) run on this world unchanged: it only needs each unit's points, its parts and
// the price of a placement. A primitive here is one point, so its centre is itself.
'use strict';

function makeSymbolWorld({ size = 9 } = {}) {
  const units = [], prims = {}, things = {};
  const prim = (name) => { const u = { id: units.length + 1, name, layer: 1, pts: [[0, 0]] }; units.push(u); prims[name] = u; return u; };
  // parts: [[name, dx, dy], ...]; dx, dy >= 0 (offsets from the thing's top-left; its centre is worked out the engine's way)
  const thing = (name, parts) => { const place = parts.map(([n, dx, dy]) => ({ u: prims[n] || things[n], dx, dy }));
    const u = { id: units.length + 1, name, layer: 1 + Math.max(...place.map((p) => p.u.layer)), place }; units.push(u); things[name] = u; return u; };
  const exp = (u) => (u.layer === 1 ? u.pts : u.place.flatMap((p) => exp(p.u).map(([x, y]) => [x + p.dx, y + p.dy])));
  const world = { units, prims, things, prim, thing, exp, W: size, H: size,
    // the engine's placement price: 1 + log2(units + 1) / log2(places in the world)
    pc: () => 1 + Math.log2(units.length + 1) / Math.log2(size * size) };
  return world;
}

// The lesson's world: four primitives, three things that share two of them, and one thing made of things.
function lessonWorld() {
  const w = makeSymbolWorld();
  ['A', 'B', 'C', 'D', 'E'].forEach(w.prim);
  w.thing('hat', [['A', 0, 1], ['C', 1, 0], ['B', 2, 1]]);     //  .C.  /  A.B
  w.thing('cup', [['A', 0, 0], ['D', 1, 1], ['B', 2, 0]]);     //  A.B  /  .D.
  w.thing('arch', [['E', 0, 0], ['A', 0, 2], ['B', 2, 2], ['E', 2, 0]]);
  w.thing('lamp', [['hat', 0, 0], ['cup', 0, 3]]);             //  a hat above a cup: a thing made of things
  return w;
}

if (typeof module !== 'undefined') module.exports = { makeSymbolWorld, lessonWorld };

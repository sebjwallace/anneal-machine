// C34 HEX WORLD. Pictures on a hexagonal grid, in axial coordinates (q, r): each hexagon is a pair of whole numbers,
// stored in the same W x W array as square pictures (index r * W + q). Moving a shape is adding to (q, r), exactly as
// on squares, so the engine runs unchanged; what changes is which shapes exist and what turning by 60 degrees means.
// The six neighbours of (q, r): (q+1,r) (q-1,r) (q,r+1) (q,r-1) (q+1,r-1) (q-1,r+1).
'use strict';

// turn a shape 60 degrees clockwise about (0, 0): (q, r) -> (-r, q + r)
const turn = (pts, n = 1) => { let p = pts; for (let i = 0; i < n; i++) p = p.map(([q, r]) => [-r, q + r]); return p; };
const normPts = (pts) => { const mq = Math.min(...pts.map((p) => p[0])), mr = Math.min(...pts.map((p) => p[1])); return pts.map(([q, r]) => [q - mq, r - mr]); };
const keyPts = (pts) => normPts(pts).map((p) => p.join(',')).sort().join(';');

// SHAPES (hexagons in axial coordinates)
const SHAPES = {
  bar: [[0, 0], [1, 0], [2, 0]],                               // three in a row
  tri: [[0, 0], [1, 0], [0, 1]],                               // three hexagons around a corner
  ring: [[1, 0], [2, 0], [2, 1], [1, 2], [0, 2], [0, 1]],      // the six around a centre (centre empty)
  flower: [[1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2]], // a centre and its six neighbours
  hook: [[0, 0], [1, 0], [2, 0], [2, 1]],                      // a bar with a bend
  pair: [[0, 0], [2, 0]],                                      // two with a gap
};
// OBJECTS (shapes placed together)
const OBJECTS = {
  hut: [['tri', 1, 0], ['bar', 0, 2]],                          // a corner above a bar
  eye: [['ring', 0, 0], ['pair', 0, 4]],                        // a ring above two apart
};
const expand = (name) => (SHAPES[name] ? SHAPES[name] : OBJECTS[name].flatMap(([s, dq, dr]) => SHAPES[s].map(([q, r]) => [q + dq, r + dr])));

class HexWorld {
  constructor(W, { things = ['bar', 'tri', 'ring', 'flower', 'hook', 'pair', 'hut', 'eye'], turns = false } = {}) { this.W = W; this.things = things; this.turns = turns; }
  // a picture: 1-3 things at random places, never overlapping or touching (no shared or neighbouring hexagons)
  next(r, k = 1 + Math.floor(r() * 3)) {
    const W = this.W, x = new Uint8Array(W * W), used = new Set(), placed = [];
    const nb = ([q, s]) => [[q, s], [q + 1, s], [q - 1, s], [q, s + 1], [q, s - 1], [q + 1, s - 1], [q - 1, s + 1]];
    for (let i = 0; i < k; i++) {
      const name = this.things[Math.floor(r() * this.things.length)], t = this.turns ? Math.floor(r() * 6) : 0, pts = normPts(turn(expand(name), t));
      const w = Math.max(...pts.map((p) => p[0])) + 1, h = Math.max(...pts.map((p) => p[1])) + 1;
      for (let tries = 0; tries < 40; tries++) {
        const dq = Math.floor(r() * (W - w + 1)), dr = Math.floor(r() * (W - h + 1)), at = pts.map(([q, s]) => [q + dq, s + dr]);
        if (at.some((p) => nb(p).some((n) => used.has(n.join(','))))) continue;
        at.forEach((p) => { used.add(p.join(',')); x[p[1] * W + p[0]] = 1; }); placed.push({ name, turn: t, dq, dr }); break;
      }
    }
    return { x, placed };
  }
}
if (typeof module !== 'undefined') module.exports = { HexWorld, SHAPES, OBJECTS, expand, turn, normPts, keyPts };

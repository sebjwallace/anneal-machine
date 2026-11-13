// MOVING WORLD (16x16, from C29): short sequences of objects that move. An object is a BASE with a FILLER on top (one empty row between).
// Each base has its own behaviour: table slides right, frame slides down, cart slides left (one cell per picture).
// Shown: table + cap|peak|dots|hook, frame + cap|peak|hook, cart + cap|dots|hook. Never shown: frame + dots, cart + peak.
'use strict';
const at = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
const P = { plank: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], leg: [[0, 0], [0, 1], [0, 2]], ring: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
  wheel: [[1, 0], [0, 1], [2, 1], [1, 2]], cap: [[0, 0], [1, 0], [2, 0], [1, 1]], peak: [[1, 0], [0, 1], [2, 1]], dots: [[0, 0], [2, 0], [0, 1], [2, 1]], hook: [[0, 0], [1, 0], [2, 0], [2, 1]] };
const BASES = { table: { pts: [...at(P.plank, 0, 0), ...at(P.leg, 0, 2), ...at(P.leg, 4, 2)], fx: 1, move: [1, 0] },
  frame: { pts: [...at(P.leg, 0, 0), ...at(P.ring, 2, 0), ...at(P.leg, 6, 0)], fx: 2, move: [0, 1] },
  cart: { pts: [...at(P.plank, 0, 0), ...at(P.wheel, 0, 2), ...at(P.wheel, 4, 2)], fx: 2, move: [-1, 0] } };
const FILLERS = ['cap', 'peak', 'dots', 'hook'];
const shape = (b, f) => [...at(P[f], BASES[b].fx, 0), ...at(BASES[b].pts, 0, 3)];
const SHOWN = { table: ['cap', 'peak', 'dots', 'hook'], frame: ['cap', 'peak', 'hook'], cart: ['cap', 'dots', 'hook'] };
const HELD = [['frame', 'dots'], ['cart', 'peak']];
const size = (pts) => { let w = 0, h = 0; for (const [x, y] of pts) { w = Math.max(w, x + 1); h = Math.max(h, y + 1); } return [w, h]; };
// an episode: 1-2 objects, each starting where it can make `steps` moves, then `steps` pictures of them moving
function episode(r, W, steps = 5, pool = null) {
  const pick = () => { if (pool) return pool[Math.floor(r() * pool.length)]; const b = Object.keys(SHOWN)[Math.floor(r() * 3)]; return [b, SHOWN[b][Math.floor(r() * SHOWN[b].length)]]; };
  const objs = [], n = 1 + Math.floor(r() * 2);
  for (let k = 0; k < n; k++) { const [b, f] = pick(), pts = shape(b, f), [w, h] = size(pts), [mx, my] = BASES[b].move;
    for (let t = 0; t < 80; t++) { const x0 = Math.floor(r() * (W - w + 1)), y0 = Math.floor(r() * (W - h + 1)), x1 = x0 + mx * steps, y1 = y0 + my * steps;
      if (x1 < 0 || y1 < 0 || x1 + w > W || y1 + h > W) continue;
      // keep clear of the others for the whole episode (a cell apart)
      const box = (o, s) => [o.x + o.mx * s - 1, o.y + o.my * s - 1, o.x + o.mx * s + o.w, o.y + o.my * s + o.h], me = { x: x0, y: y0, mx, my, w, h };
      let ok = true; for (const o of objs) for (let s = 0; s <= steps && ok; s++) { const a = box(me, s), c = box(o, s); if (a[0] <= c[2] && c[0] <= a[2] && a[1] <= c[3] && c[1] <= a[3]) ok = false; }
      if (!ok) continue; objs.push({ ...me, pts, name: b + '+' + f }); break; } }
  const pics = []; for (let s = 0; s <= steps; s++) { const x = new Uint8Array(W * W); for (const o of objs) for (const [a, b2] of o.pts) x[(b2 + o.y + o.my * s) * W + a + o.x + o.mx * s] = 1; pics.push(x); }
  return { pics, names: objs.map((o) => o.name) };
}
module.exports = { P, BASES, FILLERS, SHOWN, HELD, shape, episode };

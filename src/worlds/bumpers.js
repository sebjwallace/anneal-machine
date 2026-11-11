// C25 WORLD: squares and diamonds that move and bump. The TRUE rules (the machine never reads this; it only sees pictures).
//  - square: 2x2 pixels; diamond: 4 pixels in a 3x3 box. Each object sits in a 3x3 slot (its top-left corner is its position).
//  - every step each object moves one cell in its direction (up, down, left or right).
//  - a wall: the object turns round and steps back the way it came.
//  - two objects whose slots would come within one cell of each other: both turn round and step back, and
//      the one hit from below flips (square <-> diamond); the one hit from above becomes a square; from the side, no change.
'use strict';
const BUMP = (() => {
  const SHAPES = { square: [[0, 0], [1, 0], [0, 1], [1, 1]], diamond: [[1, 0], [0, 1], [2, 1], [1, 2]] };
  const DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  // WALLS (C25b): a border drawn in pictures, made of 2-pixel bricks: top and bottom rows, and two-wide sides. Objects bounce
  // when their slot would come within one cell of a brick. Off by default (then the edge of the picture is the wall).
  // cfg.room = { x, y, w, h }: the walls' outer rectangle (any size and place); null = the whole picture
  const cfg = { walls: false, room: null };
  const room = (N) => cfg.room || { x: 0, y: 0, w: N, h: N };
  const box = (N) => { if (!cfg.walls) return { x0: 0, y0: 0, x1: N - 1, y1: N - 1 }; const R = room(N); return { x0: R.x + 3, y0: R.y + 2, x1: R.x + R.w - 4, y1: R.y + R.h - 3 }; };   // where a slot may lie
  const outside = (x, y, N) => { const b = box(N); return x < b.x0 || y < b.y0 || x + 2 > b.x1 || y + 2 > b.y1; };
  function bricks(N) { const R = room(N), out = []; for (let x = 0; x + 1 < R.w; x += 3) { out.push([R.x + x, R.y]); out.push([R.x + x, R.y + R.h - 1]); } for (let y = 2; y < R.h - 2; y += 2) { out.push([R.x, R.y + y]); out.push([R.x + R.w - 2, R.y + y]); } return out; }
  // a random room that fits in the picture (at least min wide and high)
  function randomRoom(r, N, min = 12) { const w = min + Math.floor(r() * (N - min + 1)), h = min + Math.floor(r() * (N - min + 1)); return { x: Math.floor(r() * (N - w + 1)), y: Math.floor(r() * (N - h + 1)), w, h }; }
  // slots closer than one empty cell?  (slots are 3x3 at positions p, q)
  const near = (p, q) => Math.abs(p[0] - q[0]) < 4 && Math.abs(p[1] - q[1]) < 4;
  function step(objs, N) {
    const want = objs.map((o) => [o.x + o.dx, o.y + o.dy]), out = objs.map((o) => ({ ...o })), hit = new Set();
    for (let i = 0; i < objs.length; i++) for (let j = i + 1; j < objs.length; j++) {
      if (hit.has(i) || hit.has(j) || !near(want[i], want[j])) continue; hit.add(i); hit.add(j);
      for (const [a, b] of [[i, j], [j, i]]) { const A = objs[a], B = objs[b], o = out[a];
        const vertical = Math.abs(A.y - B.y) > Math.abs(A.x - B.x);
        if (vertical && B.y > A.y) o.shape = A.shape === 'square' ? 'diamond' : 'square';   // hit from below: flip
        else if (vertical && B.y < A.y) o.shape = 'square';                                   // hit from above: square
        o.dx = -A.dx; o.dy = -A.dy; o.x = A.x - A.dx; o.y = A.y - A.dy; } }
    for (let i = 0; i < objs.length; i++) { if (hit.has(i)) continue; const o = out[i], [x, y] = want[i];
      if (outside(x, y, N)) { o.dx = -o.dx; o.dy = -o.dy; o.x = objs[i].x + o.dx; o.y = objs[i].y + o.dy; } else { o.x = x; o.y = y; } }
    // a step back can clash with someone else; then that object just stays
    for (let i = 0; i < out.length; i++) for (let j = 0; j < out.length; j++) if (i !== j && near([out[i].x, out[i].y], [out[j].x, out[j].y]) && hit.has(i)) { out[i].x = objs[i].x; out[i].y = objs[i].y; }
    return out;
  }
  function picture(objs, N, loose = []) { const x = new Uint8Array(N * N); if (cfg.walls) for (const [a, b] of bricks(N)) { x[b * N + a] = 1; if (a + 1 < N) x[b * N + a + 1] = 1; } for (const [a, b] of loose) { x[b * N + a] = 1; x[b * N + a + 1] = 1; } for (const o of objs) for (const [a, b] of SHAPES[o.shape]) { const p = o.x + a, q = o.y + b; if (p >= 0 && q >= 0 && p < N && q < N) x[q * N + p] = 1; } return x; }
  // n objects at random places (slots at least one cell apart), random shapes and directions
  function start(r, n, N) { const objs = [], b = box(N); for (let tries = 0; objs.length < n && tries < 500; tries++) { const p = [b.x0 + Math.floor(r() * (b.x1 - b.x0 - 1)), b.y0 + Math.floor(r() * (b.y1 - b.y0 - 1))];
      if (objs.some((o) => near(p, [o.x, o.y]))) continue; const [dx, dy] = DIRS[Math.floor(r() * 4)]; objs.push({ x: p[0], y: p[1], dx, dy, shape: r() < 0.5 ? 'square' : 'diamond' }); } return objs; }
  // two objects set up to meet: a target (still, or moving any way) and one heading at it from a random side, up to 3 cells off-centre
  function meeting(r, N) { const b = box(N), side = Math.floor(r() * 4), c = [b.x0 + Math.floor(r() * (b.x1 - b.x0 - 1)), b.y0 + Math.floor(r() * (b.y1 - b.y0 - 1))], d = 5 + Math.floor(r() * 2);
    const [dx, dy] = DIRS[side], A = { x: c[0], y: c[1], dx: 0, dy: 0, shape: r() < 0.5 ? 'square' : 'diamond' };
    const td = DIRS[Math.floor(r() * 4)]; if (r() < 0.5) { A.dx = td[0]; A.dy = td[1]; }
    const off = Math.floor(r() * 7) - 3;   // off-centre by up to 3 cells to the side
    const B = { x: c[0] - dx * d + (dy !== 0 ? off : 0), y: c[1] - dy * d + (dx !== 0 ? off : 0), dx, dy, shape: r() < 0.5 ? 'square' : 'diamond' };
    if (outside(B.x, B.y, N) || outside(A.x, A.y, N)) return null; return [A, B]; }
  return { SHAPES, DIRS, step, picture, start, meeting, near, cfg, bricks, box, randomRoom };
})();
if (typeof module !== 'undefined') module.exports = BUMP;

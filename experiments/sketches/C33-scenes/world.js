// C33 SCENE WORLD (episodic memory test): whole scenes built from a few small objects, two kinds of scene.
//  FOREST: groves of trees (rows of 2-3, one or two rows deep); often a cabin beside a grove; now and then one car.
//  CITY: a street. A row of houses, a road row of cars under it, often a second row of houses facing it; a few trees dotted about.
// Objects share pieces: cabin and house have the same 3-pixel roof (a peak); the car's wheels and the tree's trunk are both
// single pixels hanging under a solid body. Every object keeps at least one empty pixel from every other one.
'use strict';
const pts = (rows) => { const o = []; rows.forEach((s, y) => [...s].forEach((c, x) => { if (c === '#') o.push([x, y]); })); return o; };
const SHAPES = {
  tree: pts(['.#.', '###', '###', '.#.']),                       // 3x4: crown + trunk
  cabin: pts(['..#..', '.#.#.', '#...#', '#####']),               // 5x4: roof + low hollow walls
  house: pts(['..#..', '.#.#.', '#####', '#.#.#', '#####']),      // 5x5: same roof + tall body with windows
  car: pts(['.###.', '#####', '.#.#.']),                         // 5x3: cab + body + two wheels
  person: pts(['#', '#', '#']),                                  // 1x3, rare
};
// the pieces the objects share, and where each sits inside its objects (for checking what the engine pulls apart)
const PIECES = { roof: { pts: pts(['..#..', '.#.#.']), in: { cabin: [0, 0], house: [0, 0] } },
  hangers: { pts: pts(['#.#']), in: { car: [1, 2] } }, stem: { pts: pts(['#']), in: { tree: [1, 3] } } };
const size = (name) => { let w = 0, h = 0; for (const [x, y] of SHAPES[name]) { w = Math.max(w, x + 1); h = Math.max(h, y + 1); } return [w, h]; };
const SIZE = Object.fromEntries(Object.keys(SHAPES).map((k) => [k, size(k)]));
const W0 = 32;
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));   // integer in [a, b]

// a canvas that refuses any object that would touch (or come within 1 px of) another object or leave the picture
function canvas(W) {
  const box = new Uint8Array(W * W), x = new Uint8Array(W * W), objects = [];
  const fits = (name, ox, oy) => { const [w, h] = SIZE[name]; if (ox < 0 || oy < 0 || ox + w > W || oy + h > W) return false;
    for (let yy = oy - 1; yy <= oy + h; yy++) for (let xx = ox - 1; xx <= ox + w; xx++) if (xx >= 0 && yy >= 0 && xx < W && yy < W && box[yy * W + xx]) return false; return true; };
  const put = (name, ox, oy) => { if (!fits(name, ox, oy)) return false; const [w, h] = SIZE[name];
    for (let yy = oy; yy < oy + h; yy++) for (let xx = ox; xx < ox + w; xx++) box[yy * W + xx] = 1;
    for (const [a, b] of SHAPES[name]) x[(oy + b) * W + ox + a] = 1; objects.push({ name, x: ox, y: oy }); return true; };
  // try random spots inside [x0,x1]x[y0,y1] (top-left corner) until one fits
  const drop = (r, name, x0 = 0, y0 = 0, x1 = W, y1 = W, tries = 60) => { const [w, h] = SIZE[name];
    for (let t = 0; t < tries; t++) if (put(name, ri(r, x0, Math.max(x0, Math.min(x1, W - w))), ri(r, y0, Math.max(y0, Math.min(y1, W - h))))) return true; return false; };
  return { x, objects, fits, put, drop };
}

// FOREST: 2-3 groves; a grove is a small grid of trees 4 px apart across and 5 px apart down, at a random spot
function forest(r, W) {
  const c = canvas(W), groves = [], n = W >= 28 ? 3 : 2;
  for (let g = 0; g < n; g++) {
    const cols = ri(r, 2, 3), rows = r() < 0.5 ? 1 : 2, gw = cols * 4 - 1, gh = rows * 5 - 1;
    for (let t = 0; t < 40; t++) {
      const gx = ri(r, 0, W - gw), gy = ri(r, 0, W - gh); let ok = true;
      for (let j = 0; j < rows && ok; j++) for (let i = 0; i < cols; i++) if (!c.fits('tree', gx + i * 4, gy + j * 5)) { ok = false; break; }
      if (!ok) continue;
      let k = 0; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) if (r() > 0.12 || k === 0) { c.put('tree', gx + i * 4, gy + j * 5); k++; }
      groves.push({ gx, gy, gw, gh }); break;
    }
  }
  if (r() < 0.6 && groves.length) {   // cabin: right beside a grove (left or right side, level with one of its rows)
    const g = groves[Math.floor(r() * groves.length)], ys = [g.gy, g.gy + g.gh - 3];
    const spots = [[g.gx + g.gw + 2, ys[0]], [g.gx - 7, ys[0]], [g.gx + g.gw + 2, ys[1]], [g.gx - 7, ys[1]]];
    for (let t = 0; t < 4; t++) { const [sx, sy] = spots[ri(r, 0, 3)]; if (c.put('cabin', sx, sy)) break; }
  }
  if (r() < 0.2) c.drop(r, 'car', 0, Math.floor(W / 2));         // occasionally one car, in the lower half
  if (r() < 0.05) c.drop(r, 'person');
  return c;
}

// CITY: a street at a random height; houses 6-7 px apart along it, a road row of cars under it, often a facing row of houses
function city(r, W) {
  const c = canvas(W), twoSides = r() < 0.6, depth = twoSides ? 16 : 9;
  const y0 = ri(r, 0, W - depth), step = ri(r, 6, 7);
  const row = (y, nMax) => { const x0 = ri(r, 0, step - 1); let k = 0;
    for (let x = x0; x + 5 <= W && k < nMax; x += step) if (r() < 0.8) { c.put('house', x, y); k++; } };
  row(y0, ri(r, 3, 4));                                          // houses above the road
  const ry = y0 + 6, nc = ri(r, 2, 3);                           // the road: cars on one row
  for (let k = 0; k < nc; k++) c.drop(r, 'car', 0, ry, W, ry);
  if (twoSides) row(y0 + 10, ri(r, 1, 3));                       // houses facing them below the road
  for (let k = ri(r, 1, 2); k > 0; k--) c.drop(r, 'tree');       // a few trees dotted wherever there is room
  if (r() < 0.05) c.drop(r, 'person', 0, ry, W, ry);
  return c;
}

function scene(r, type, W = W0) { const c = type === 'city' ? city(r, W) : forest(r, W); return { x: c.x, type, objects: c.objects }; }
function stream(r, n, W = W0, mix = { forest: 0.5, city: 0.5 }) {
  const types = Object.keys(mix), tot = types.reduce((s, t) => s + mix[t], 0), out = [];
  for (let i = 0; i < n; i++) { let u = r() * tot, t = types[types.length - 1]; for (const k of types) { if ((u -= mix[k]) < 0) { t = k; break; } } out.push(scene(r, t, W)); }
  return out;
}
module.exports = { W: W0, SHAPES, SIZE, PIECES, scene, stream };

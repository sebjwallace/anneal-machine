// C28 WORLD: objects made of a BASE with a FILLER on top (one empty row between). Pictures hold 1-3 things at random places,
// one cell apart at least: objects, and now and then a base or a filler on its own.
//  box  + cap | peak | dots      post + cap | peak      held out: post + dots
'use strict';
const SHAPES = {
  box: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
  post: [[1, 0], [1, 1], [1, 2], [1, 3]],
  cap: [[0, 0], [1, 0], [2, 0], [1, 1]],
  peak: [[1, 0], [0, 1], [2, 1]],
  dots: [[0, 0], [2, 0], [0, 1], [2, 1]],
};
const obj = (base, filler) => [...SHAPES[filler], ...SHAPES[base].map(([x, y]) => [x, y + 3])];
const OBJECTS = { 'box+cap': obj('box', 'cap'), 'box+peak': obj('box', 'peak'), 'box+dots': obj('box', 'dots'), 'post+cap': obj('post', 'cap'), 'post+peak': obj('post', 'peak') };
const HELD = { 'post+dots': obj('post', 'dots') };
const LOOSE = { box: SHAPES.box, post: SHAPES.post, cap: SHAPES.cap, peak: SHAPES.peak, dots: SHAPES.dots };
function place(r, list, W) { const x = new Uint8Array(W * W), taken = new Set(), names = [];
  for (const [nm, pts] of list) { let w = 0, h = 0; for (const [a, b] of pts) { w = Math.max(w, a + 1); h = Math.max(h, b + 1); }
    for (let t = 0; t < 60; t++) { const ox = Math.floor(r() * (W - w + 1)), oy = Math.floor(r() * (W - h + 1)); let ok = true;
      for (const [a, b] of pts) { for (let i = -1; i <= 1 && ok; i++) for (let j = -1; j <= 1; j++) if (taken.has((a + ox + i) + ',' + (b + oy + j))) { ok = false; break; } }
      if (!ok) continue; for (const [a, b] of pts) { taken.add((a + ox) + ',' + (b + oy)); x[(b + oy) * W + a + ox] = 1; } names.push(nm); break; } }
  return { x, name: names.join(' + ') }; }
// a training picture: 1-3 things, mostly objects, sometimes a loose base or filler
function next(r, W) { const n = 1 + Math.floor(r() * 3), list = []; for (let k = 0; k < n; k++) { const pool = r() < 0.8 ? OBJECTS : LOOSE, e = Object.entries(pool); list.push(e[Math.floor(r() * e.length)]); } return place(r, list, W); }
if (typeof module !== 'undefined') module.exports = { SHAPES, OBJECTS, HELD, LOOSE, place, next };

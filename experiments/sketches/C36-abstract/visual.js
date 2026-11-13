// C36 STEP 1 · THE VISUAL REGION. The engine, unchanged, at 32 x 32.
// It learns the objects from simple pictures (1-3 objects, apart), then reads forest and city scenes (C33 world) without
// learning from them, and passes on only what settled: the outermost things it recognised. Where they were is left out.
// Writes visual-out.json: the things it knows (its "vocabulary") and, for each scene, how many of each it saw.
'use strict';
const path = require('path'), fs = require('fs');
globalThis.WORLD_SIZE = 32;
const S = path.join(__dirname, '../../../src/');
const { rng } = require(S + 'worlds/catalogue.js'), { Model, norm } = require(S + 'engine/see.js');
const SW = require('../C33-scenes/world.js'), W = 32, N = +(process.env.N || 400), SCENES = +(process.env.SCENES || 300);
const names = ['tree', 'cabin', 'house', 'car', 'person'], weight = [3, 2, 3, 3, 1];
function objectPicture(r) { const x = new Uint8Array(W * W), taken = new Set(), k = 1 + Math.floor(r() * 3);
  for (let i = 0; i < k; i++) { let t = r() * weight.reduce((a, b) => a + b), n = 0; while (t > weight[n]) t -= weight[n++]; const pts = SW.SHAPES[names[n]];
    const w = Math.max(...pts.map((p) => p[0])) + 1, h = Math.max(...pts.map((p) => p[1])) + 1;
    for (let tries = 0; tries < 30; tries++) { const ox = Math.floor(r() * (W - w)), oy = Math.floor(r() * (H(h))); let ok = true;
      for (let yy = oy - 1; yy <= oy + h && ok; yy++) for (let xx = ox - 1; xx <= ox + w; xx++) if (taken.has(xx + ',' + yy)) { ok = false; break; }
      if (!ok) continue; for (let yy = oy; yy < oy + h; yy++) for (let xx = ox; xx < ox + w; xx++) taken.add(xx + ',' + yy); for (const [a, b] of pts) x[(oy + b) * W + ox + a] = 1; break; } }
  return x; }
const H = (h) => W - h;
const m = new Model('FL', {}), r = rng(36), t0 = Date.now();
for (let t = 1; t <= N; t++) { m.step(objectPicture(r)); if (t % 98 === 0) m.rest(); } m.rest();
const live = m.units.filter((u) => !u.loose), keyOf = (pts) => norm(pts).key, named = {};
for (const n of names) named[keyOf(SW.SHAPES[n])] = n;
const vocab = {}; for (const u of live) vocab[u.id] = { id: u.id, layer: u.layer, pts: norm(m.exp(u)).pts, is: named[keyOf(m.exp(u))] || null };
console.log(`visual region: learnt ${live.length} things from ${N} object pictures in ${((Date.now() - t0) / 1000).toFixed(0)} s:`, live.map((u) => vocab[u.id].is || `(${vocab[u.id].pts.length}px)`).join(', '));
// read whole scenes (no learning) and pass on the outermost things recognised
const sr = rng(37), scenes = [], t1 = Date.now(); let right = 0, total = 0, left = 0, on = 0;
for (let i = 0; i < SCENES; i++) { const type = i % 2 ? 'city' : 'forest', sc = SW.scene(sr, type, W), q = m.read(sc.x), counts = {};
  for (const c of q.claims) { const id = (c.c.virtual ? c.c.K : c.c).id; counts[id] = (counts[id] || 0) + 1; }
  const truth = {}; for (const o of sc.objects) truth[o.name] = (truth[o.name] || 0) + 1;
  const seen = {}; for (const [id, n] of Object.entries(counts)) { const nm = vocab[id] && vocab[id].is; if (nm) seen[nm] = (seen[nm] || 0) + n; }
  for (const n of names) { total += truth[n] || 0; right += Math.min(truth[n] || 0, seen[n] || 0); }
  left += q.left.length + q.misses; on += q.on; scenes.push({ type, counts, truth }); }
console.log(`read ${SCENES} scenes in ${((Date.now() - t1) / 1000).toFixed(0)} s · objects recognised ${(100 * right / total).toFixed(0)}% · pixels left unexplained ${(100 * left / on).toFixed(1)}%`);
fs.writeFileSync(path.join(__dirname, 'visual-out.json'), JSON.stringify({ vocab, scenes }));

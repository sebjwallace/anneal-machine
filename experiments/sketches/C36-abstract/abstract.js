// C36 STEP 2 · THE ABSTRACT REGION. A second copy of the engine, unchanged, in its own process (its own picture size).
// Its input is what the visual region passed on (visual-out.json): one row per kind of visual thing, and how many of it
// were seen drawn as a bar along that row. Where things were in the scene is gone. It learns from these pictures by the
// same energy rule, then we test recall: show some rows, hide the others, and see what it fills in.
'use strict';
const path = require('path'), fs = require('fs');
const W = 20; globalThis.WORLD_SIZE = W;
const S = path.join(__dirname, '../../../src/');
const { rng } = require(S + 'worlds/catalogue.js'), { Model, norm } = require(S + 'engine/see.js');
const V = JSON.parse(fs.readFileSync(path.join(__dirname, 'visual-out.json'))), TRAIN = +(process.env.TRAIN || 200);
const order = ['tree', 'cabin', 'house', 'car', 'person'], rowOf = {};
for (const [id, v] of Object.entries(V.vocab)) if (v.is) rowOf[id] = 1 + 3 * order.indexOf(v.is);
const picture = (counts) => { const x = new Uint8Array(W * W); for (const [id, n] of Object.entries(counts)) for (let i = 0; i < Math.min(n, W - 2); i++) x[rowOf[id] * W + 1 + i] = 1; return x; };
const rowsOf = (x) => order.map((nm, k) => { let n = 0; for (let i = 0; i < W; i++) n += x[(1 + 3 * k) * W + i]; return n; });
const show = (r) => order.map((nm, k) => r[k] ? `${nm} ${r[k]}` : '').filter(Boolean).join(', ') || '(nothing)';
const draw = (pts) => { const w = Math.max(...pts.map((p) => p[0])) + 1, h = Math.max(...pts.map((p) => p[1])) + 1, g = [...Array(h)].map(() => Array(w).fill('.'));
  for (const [a, b] of pts) g[b][a] = '#'; return g.map((l) => '      ' + l.join('')).join('\n'); };

const m = new Model('FL', {}), train = V.scenes.slice(0, TRAIN), test = V.scenes.slice(TRAIN), t0 = Date.now();
train.forEach((s, t) => { m.step(picture(s.counts)); if ((t + 1) % 98 === 0) m.rest(); }); m.rest();
const live = m.units.filter((u) => !u.loose);
console.log(`abstract region: ${live.length} things learnt from ${TRAIN} scenes in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
for (const u of live) { const pts = norm(m.exp(u)).pts, rows = [...new Set(pts.map((p) => p[1]))].length; console.log(`  #${u.id} layer ${u.layer}, ${pts.length} px, spans ${rows} row${rows > 1 ? 's' : ''}\n${draw(pts)}`); }

// reading held-out scenes: how many placements does each need, and does one thing cover several rows (a scene type)?
for (const type of ['forest', 'city']) { const ss = test.filter((s) => s.type === type); let pl = 0, multi = 0, left = 0;
  for (const s of ss) { const q = m.read(picture(s.counts)); pl += q.claims.length; left += q.left.length;
    if (q.claims.some((c) => new Set(m.exp(c.c).map((p) => p[1])).size > 1)) multi++; }
  console.log(`${type}: ${ss.length} unseen scenes · ${(pl / ss.length).toFixed(1)} placements each · ${multi} read with a thing spanning several rows · ${left} pixels unexplained`); }

// recall: keep some rows visible (empty places on them are known to be empty), hide every other row, and read
function recall(label, counts, keep) { const x = picture(counts), hid = new Uint8Array(W * W);
  order.forEach((nm, k) => { if (!keep.includes(nm)) for (let i = 0; i < W; i++) { hid[(1 + 3 * k) * W + i] = 1; x[(1 + 3 * k) * W + i] = 0; } });
  const q = m.read(x, hid); console.log(`  ${label.padEnd(34)} → ${show(rowsOf(q.recon))}`); }
const id = (nm) => Object.keys(rowOf).find((k) => V.vocab[k].is === nm), C = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [id(k), v]));
console.log('recall (only the named rows are shown; the rest are hidden and filled in):');
recall('a cabin', C({ cabin: 1 }), ['tree', 'cabin', 'house', 'car', 'person'].filter((n) => n !== 'tree' && n !== 'house' && n !== 'car'));
recall('a cabin (only the cabin row shown)', C({ cabin: 1 }), ['cabin']);
recall('ten trees', C({ tree: 10 }), ['tree']);
recall('four houses', C({ house: 4 }), ['house']);
recall('two cars', C({ car: 2 }), ['car']);
recall('one tree', C({ tree: 1 }), ['tree']);
recall('a person', C({ person: 1 }), ['person']);
recall('three houses, one car (trees hidden)', C({ house: 3, car: 1 }), ['house', 'car', 'cabin', 'person']);
recall('six houses', C({ house: 6 }), ['house']);
recall('one car', C({ car: 1 }), ['car']);
const withCabin = test.filter((s) => s.type === 'forest' && Object.keys(s.counts).some((k) => V.vocab[k].is === 'cabin')).length;
console.log(`(unseen forests with a cabin: ${withCabin})`);

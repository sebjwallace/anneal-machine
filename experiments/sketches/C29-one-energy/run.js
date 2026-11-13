// C29: one energy. Three versions on the same sequences: the engine; the engine with kinds (C28); kinds with changes counted (C29).
'use strict';
const path = require('path');
globalThis.WORLD_SIZE = 16;
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const Wd = require(path.join(__dirname, 'world.js'));
const W = 16, EPISODES = +(process.env.EPISODES || 100);
const VERSIONS = { engine: '../../../src/engine/see.js', kinds: '../C28-kinds/kinds.js', 'one energy': 'c29.js' };
const head = (u) => (u.virtual ? u.K : u);
// what usually happens to each kind of thing, and predicting the next picture from it (the same for every version)
function rules(m, pairs) { const out = new Map();
  for (const [a, b] of pairs) { const A = m.read(a).claims, B = m.read(b).claims, all = [], ua = new Set(), ub = new Set();
    A.forEach((p, i) => B.forEach((q, j) => { if (head(p.c) === head(q.c)) all.push([Math.abs(p.dx - q.dx) + Math.abs(p.dy - q.dy), i, j]); }));
    all.sort((x, y) => x[0] - y[0]); for (const [, i, j] of all) { if (ua.has(i) || ub.has(j)) continue; ua.add(i); ub.add(j); const h = head(A[i].c), k = (B[j].dx - A[i].dx) + ',' + (B[j].dy - A[i].dy);
      if (!out.has(h)) out.set(h, new Map()); out.get(h).set(k, (out.get(h).get(k) || 0) + 1); } }
  return out; }
function predict(m, R, x) { const q = m.read(x), out = new Uint8Array(W * W);
  for (const c of q.claims) { const r = R.get(head(c.c)); let dx = 0, dy = 0; if (r) { let best = -1; for (const [k, n] of r) if (n > best) { best = n; [dx, dy] = k.split(',').map(Number); } }
    for (const [ux, uy] of m.exp(c.c)) { const a = ux + c.dx + dx, b = uy + c.dy + dy; if (a >= 0 && b >= 0 && a < W && b < W) out[b * W + a] = 1; } }
  return out; }
const same = (a, b) => a.every((v, i) => v === b[i]);
for (const [name, file] of Object.entries(VERSIONS).filter(([n]) => !process.env.ONLY || n === process.env.ONLY)) {
  const { Model } = require(path.join(__dirname, file)), m = new Model(), r = rng(1), pairs = [], t0 = Date.now(); let seen = 0;
  for (let e = 0; e < EPISODES; e++) { const ep = Wd.episode(r, W); ep.pics.forEach((x, i) => { m.step(x, i ? ep.pics[i - 1] : null); if (i) pairs.push([ep.pics[i - 1], x]); if (++seen % 98 === 0) m.rest(); }); }
  m.rest(); const learnt = (Date.now() - t0) / 1000; if (process.env.DBG) console.log('learnt', learnt);
  const live = m.units.filter((u) => !u.loose), kinds = live.filter((u) => u.kind);
  const R = rules(m, pairs); if (process.env.DBG) console.log('rules', (Date.now() - t0) / 1000);
  const iou = (p, t) => { let i = 0, u = 0; for (let k = 0; k < p.length; k++) { if (p[k] && t[k]) i++; if (p[k] || t[k]) u++; } return u ? i / u : 1; };
  const test = (pool, n, seed) => { const f = rng(seed); let ok = 0, all = 0, ov = 0, still = 0; for (let k = 0; k < n; k++) { const ep = Wd.episode(f, W, 5, pool); for (let i = 1; i < ep.pics.length - 1; i++) { all++; const p = predict(m, R, ep.pics[i]); if (same(p, ep.pics[i + 1])) ok++; ov += iou(p, ep.pics[i + 1]); still += iou(ep.pics[i], ep.pics[i + 1]); } } return `exact ${(100 * ok / all).toFixed(0)}%, overlap ${(100 * ov / all).toFixed(0)}% (staying put would give ${(100 * still / all).toFixed(0)}%)`; };
  const shown = Object.entries(Wd.SHOWN).flatMap(([b, fs]) => fs.map((f) => [b, f]));
  console.log(`\n[${name}] ${seen} pictures in ${EPISODES} sequences, ${learnt.toFixed(0)} s · units ${live.length} (kinds ${kinds.length}) · different changes remembered ${R.size ? [...R.values()].reduce((a, mm) => a + mm.size, 0) : 0}`);
  for (const K of kinds) console.log(`  kind: ${K.place.length} shared placement(s), ${K.slot.set.fillers.length} fillers`);
  console.log(`  next picture · variants it has seen: ${test(shown, 30, 5)}`);
  console.log(`  next picture · NEVER-SEEN variants (frame+dots, cart+peak): ${test(Wd.HELD, 30, 6)}`);
}

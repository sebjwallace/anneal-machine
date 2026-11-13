// C30: when should a picture be remembered awake? Runs the engine copy (see.js) with each remembering rule on two worlds.
//   node run.js                       every rule on both worlds (one child process per run; prints a table)
//   WORLD=a RULE=0.9 node run.js      one run (WORLD a = the 12x12 test world of src/test/see.js, b = the C29 16x16 world)
//   N = scenes (world a, default 600) or episodes (world b, default 100); NOISE = share of pixels flipped in world a training
'use strict';
const path = require('path'), { spawnSync } = require('child_process');
const RULES = ['0', '0.5', '0.7', '0.8', '0.9', '0.95', '0.99', '1', 'local', 'energy', 'compare'];
const ruleOf = (s) => (isNaN(+s) ? s : +s);

function runA(rule, N) {
  const { CATALOGUE, rng } = require('../../../src/worlds/catalogue.js'), { SceneWorld } = require('../../../src/worlds/scenes.js');
  const { Model, norm } = require('./see.js');
  const W = new SceneWorld(CATALOGUE), r = rng(4242), m = new Model('FL', { remember: rule }), t0 = Date.now();
  const NOISE = +(process.env.NOISE || 0);   // training noise (share of pixels flipped); tests are always clean
  for (let t = 1; t <= N; t++) { m.step(W.next(r, NOISE).x); if (t % 98 === 0) m.rest(); } m.rest();
  const secs = (Date.now() - t0) / 1000, live = m.units.filter((u) => !u.loose), parts = live.filter((u) => u.layer === 1);
  const SPX = 144, pc = 1 + Math.log2(live.length + 1) / Math.log2(SPX), px = parts.reduce((a, p) => a + p.pts.length, 0) + m.units.filter((u) => u.loose).reduce((a, p) => a + p.pts.length, 0);
  const comp = live.filter((u) => u.layer > 1).reduce((a, u) => a + u.place.filter((k) => !k.u.loose).length, 0);
  const f = rng(7); let flow = 0, fh = 0; for (let k = 0; k < 300; k++) { const q = m.read(W.next(f, 0).x); flow += pc * q.claims.length + q.left.length + q.misses; fh += (q.left.length + q.misses) / q.on; }
  const keys = new Set(live.map((u) => norm(m.exp(u)).key)), want = { ...W.shapes, ...W.objects }, rec = Object.values(want).filter((pts) => keys.has(norm(pts).key)).length;
  return { units: live.length, memories: m.items.length, snapshots: m.st.snapshots, compared: m.st.compared || 0, energy: Math.round(m.measure().E),
    cost: Math.round(px + pc * comp + flow), heat: +(fh / 300).toFixed(3), recovered: `${rec}/${Object.keys(want).length}`, secs: +secs.toFixed(1) };
}

function runB(rule, N) {
  globalThis.WORLD_SIZE = 16;
  const { rng } = require('../../../src/worlds/catalogue.js'), Wd = require('../C29-one-energy/world.js'), { Model } = require('./see.js'), W = 16;
  const m = new Model('FL', { remember: rule }), r = rng(1), pairs = [], t0 = Date.now(); let seen = 0;
  for (let e = 0; e < N; e++) { const ep = Wd.episode(r, W); ep.pics.forEach((x, i) => { m.step(x); if (i) pairs.push([ep.pics[i - 1], x]); if (++seen % 98 === 0) m.rest(); }); }
  const before = m.live.length, buffered = m.buf.length; if (process.env.FINAL !== '0') m.rest(); const secs = (Date.now() - t0) / 1000, live = m.units.filter((u) => !u.loose);
  // C29's rules / predict, for the plain engine (no kinds)
  const R = new Map(); for (const [a, b] of pairs) { const A = m.read(a).claims, B = m.read(b).claims, all = [], ua = new Set(), ub = new Set();
    A.forEach((p, i) => B.forEach((q, j) => { if (p.c === q.c) all.push([Math.abs(p.dx - q.dx) + Math.abs(p.dy - q.dy), i, j]); }));
    all.sort((x, y) => x[0] - y[0]); for (const [, i, j] of all) { if (ua.has(i) || ub.has(j)) continue; ua.add(i); ub.add(j); const h = A[i].c, k = (B[j].dx - A[i].dx) + ',' + (B[j].dy - A[i].dy);
      if (!R.has(h)) R.set(h, new Map()); R.get(h).set(k, (R.get(h).get(k) || 0) + 1); } }
  const predict = (x) => { const q = m.read(x), out = new Uint8Array(W * W);
    for (const c of q.claims) { const rr = R.get(c.c); let dx = 0, dy = 0; if (rr) { let best = -1; for (const [k, n] of rr) if (n > best) { best = n; [dx, dy] = k.split(',').map(Number); } }
      for (const [ux, uy] of m.exp(c.c)) { const a = ux + c.dx + dx, b = uy + c.dy + dy; if (a >= 0 && b >= 0 && a < W && b < W) out[b * W + a] = 1; } } return out; };
  const same = (a, b) => a.every((v, i) => v === b[i]), iou = (p, t) => { let i = 0, u = 0; for (let k = 0; k < p.length; k++) { if (p[k] && t[k]) i++; if (p[k] || t[k]) u++; } return u ? i / u : 1; };
  const pc = m.pc(); let heat = 0, hn = 0, flow = 0;
  const test = (pool, n, seed) => { const f = rng(seed); let ok = 0, all = 0, ov = 0; for (let k = 0; k < n; k++) { const ep = Wd.episode(f, W, 5, pool);
    for (let i = 0; i < ep.pics.length; i++) { const q = m.read(ep.pics[i]); if (q.on) { heat += (q.left.length + q.misses) / q.on; hn++; flow += q.cost; } }
    for (let i = 1; i < ep.pics.length - 1; i++) { all++; const p = predict(ep.pics[i]); if (same(p, ep.pics[i + 1])) ok++; ov += iou(p, ep.pics[i + 1]); } }
    return `${(100 * ok / all).toFixed(0)}/${(100 * ov / all).toFixed(0)}`; };
  const shown = Object.entries(Wd.SHOWN).flatMap(([b, fs]) => fs.map((f) => [b, f])), seenV = test(shown, 30, 5), held = test(Wd.HELD, 30, 6);
  const st = m.measure().structure;
  return { units: live.length, memories: m.items.length, snapshots: m.st.snapshots, compared: m.st.compared || 0, energy: Math.round(m.measure().E),
    cost: Math.round(st + flow), heat: +(heat / hn).toFixed(3), changes: [...R.values()].reduce((a, x) => a + x.size, 0), seen: seenV, never: held, beforeFinalRest: before, flowAtFinalRest: buffered, secs: +secs.toFixed(1) };
}

if (process.env.RULE) {
  const N = +(process.env.N || (process.env.WORLD === 'b' ? 100 : 600)), rule = ruleOf(process.env.RULE);
  console.log(JSON.stringify({ world: process.env.WORLD || 'a', rule: process.env.RULE, N, ...(process.env.WORLD === 'b' ? runB(rule, N) : runA(rule, N)) }));
} else {
  for (const world of (process.env.WORLDS || 'a,b').split(',')) for (const rule of (process.env.RULES ? process.env.RULES.split(',') : RULES)) {
    const p = spawnSync(process.execPath, [__filename], { env: { ...process.env, WORLD: world, RULE: rule }, encoding: 'utf8', timeout: +(process.env.TIMEOUT || 1800) * 1000 });
    console.log(p.status === 0 ? p.stdout.trim() : JSON.stringify({ world, rule, error: (p.stderr || p.signal || 'timeout').toString().slice(-300) }));
  }
}

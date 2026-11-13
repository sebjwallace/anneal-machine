// C28: kinds. The engine as it is vs the engine with kinds, on the same pictures. WORLD=simple (default) or rich.
'use strict';
const path = require('path');
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const Wd = require(path.join(__dirname, process.env.WORLD === 'rich' ? 'world-rich.js' : 'world.js'));
const W = 12, N = +(process.env.N || 400);
const art = (pts) => { let x0 = Infinity, y0 = Infinity; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); } const p = pts.map(([x, y]) => [x - x0, y - y0]); let w = 0, h = 0; for (const [x, y] of p) { w = Math.max(w, x + 1); h = Math.max(h, y + 1); } const g = Array.from({ length: h }, () => Array(w).fill('.')); for (const [x, y] of p) g[y][x] = '#'; return g.map((q) => q.join('')).join('/'); };
for (const which of ['engine', 'kinds']) {
  const { Model } = require(which === 'engine' ? path.join(__dirname, '../../../src/engine/see.js') : path.join(__dirname, 'kinds.js'));
  const r = rng(1), m = new Model(), t0 = Date.now();
  for (let t = 1; t <= N; t++) { m.step(Wd.next(r, W).x); if (t % 98 === 0) m.rest(); } m.rest();
  const live = m.units.filter((u) => !u.loose), E = m.measure();
  console.log(`\n[${which}] ${N} pictures, ${((Date.now() - t0) / 1000).toFixed(0)} s · units ${live.length} · energy ${E.E.toFixed(1)} (structure ${E.structure.toFixed(1)}) · rest changes kept ${m.st.restSteps}` + (which === 'kinds' ? ` · kinds made ${m.st.kinds || 0}, widened ${m.st.widened || 0}, shared ${m.st.shared || 0}, folded back ${m.st.unkinds || 0}` : ''));
  for (const u of live) { if (u.kind) console.log(`  KIND (layer ${u.layer}): shared [${u.place.map((p) => art(m.exp(p.u))).join(' + ')}], slot fillers: ${u.slot.set.fillers.map((f) => art(m.exp(f.u))).join(' | ')}${m.kindsOf().some((k) => k !== u && k.slot.set === u.slot.set) ? ' (set shared)' : ''}`);
    else if (u.layer > 1) console.log(`  composite (layer ${u.layer}): ${art(m.exp(u))}`); else console.log(`  part: ${art(u.pts)}`); }
  const fr = rng(7); let flow = 0; for (let k = 0; k < 200; k++) flow += m.read(Wd.next(fr, W).x).cost;
  console.log(`  cost of explaining 200 new pictures: ${flow.toFixed(0)}`);
  for (const [nm, pts] of Object.entries({ ...Wd.OBJECTS, ...Wd.HELD })) { const q = m.read(Wd.place(rng(9), [[nm, pts]], W).x);
    console.log(`  ${(nm in Wd.HELD ? 'NEVER SEEN ' : '') + nm}: ${q.claims.length} placement(s), heat ${((q.left.length + q.misses) / q.on).toFixed(2)}, cost ${q.cost.toFixed(2)} · ` + q.claims.map((c) => (c.c.virtual ? 'kind+filler' : c.c.layer > 1 ? 'composite' : 'part')).join(' + ')); }
}

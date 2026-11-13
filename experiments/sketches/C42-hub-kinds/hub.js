// C42 · DOES ENERGY BUILD THE "? → J → ?" FORM BY ITSELF? Episodes are strips: three states side by side in time order
// (each state a small distinct mark, 3 x 3, slot width 4, as C38). Two worlds:
//   HUB: many starts and many ends all pass through J. Every combination is shown except a few held out (e.g. A → J → O).
//   PAIRED (control): A always goes on to P, G always to O; nothing else, over and over. "Any start with any end" would
//   be a false generalisation here.
// Step 1 (this file, ENGINE=core): the engine as it is. What does it build, and what does completion give for
// A + O (middle hidden), A + J (end hidden), and A alone?
// Step 2 (ENGINE=multi): the copy in this folder where a kind may vary in more than one place.
'use strict';
const path = require('path');
const W = 9; globalThis.WORLD_SIZE = W;   // rows: which state; columns: which step (one pixel per state per step)
const S = path.join(__dirname, '../../../src/');
const { rng } = require(S + 'worlds/catalogue.js');
const { Model, norm } = require(process.env.ENGINE === 'multi' ? path.join(__dirname, 'see-multi.js') : S + 'engine/see.js');
const N = +(process.env.N || 60);
const names = ['A', 'B', 'C', 'G', 'J', 'P', 'O', 'Q', 'R'], row = Object.fromEntries(names.map((n, i) => [n, i]));
const strip = (seq) => { const x = new Uint8Array(W * W); seq.forEach((v, s) => { if (v) x[row[v] * W + s] = 1; }); return x; };
const viewAt = (x, s) => { const on = names.filter((n) => x[row[n] * W + s]); return on.length ? on.join('/') : '·'; };
const showUnits = (m) => { for (const u of m.units.filter((u) => !u.loose)) { const n = norm(m.exp(u)); console.log(`    #${u.id} layer ${u.layer}${u.kind ? ' KIND' : ''}: ${n.pts.map(([x, y]) => `${x}:${names[y + n.oy] || '?'}`).join(' ')} (uses ${u.uses})`); } };
const WORLDS = {
  hub: (() => { const starts = ['A', 'B', 'C', 'G'], ends = ['P', 'O', 'Q', 'R'], held = new Set(['A-O', 'B-Q', 'G-P', 'C-R']), eps = [];
    for (const a of starts) for (const b of ends) if (!held.has(a + '-' + b)) eps.push([a, 'J', b]); return { eps, held: [...held].map((h) => h.split('-')) }; })(),
  paired: { eps: [['A', 'J', 'P'], ['G', 'J', 'O']], held: [['A', 'O'], ['G', 'P']] } };
const which = (process.env.WORLD || 'hub,paired').split(',').filter((w) => WORLDS[w]);
for (const wn of which) { const Wd = WORLDS[wn], r = rng(42), m = new Model(), t0 = Date.now();
  for (let t = 1; t <= N; t++) { m.step(strip(Wd.eps[Math.floor(r() * Wd.eps.length)])); if (t % 98 === 0) m.rest(); } m.rest();
  const live = m.units.filter((u) => !u.loose), kinds = live.filter((u) => u.kind);
  console.log(`\n${wn.toUpperCase()} (${Wd.eps.length} different episodes, ${N} shown) · ${((Date.now() - t0) / 1000).toFixed(1)} s · ${live.length} things, ${kinds.length} kinds`);
  for (const K of kinds) { const ex = m.explainers().filter(([u]) => u.virtual && u.K === K).map(([u]) => { const x = new Uint8Array(W * W); const pts = norm(m.exp(u)).pts; return pts; });
    if (0) console.log(`  kind #${K.id}: ${K.slot ? K.slot.set.fillers.length : '?'} versions${K.slots ? `, ${K.slots.length} slots` : ''}`); }
  if (process.env.SHOWUNITS) showUnits(m);
  const read = (seq, hideSlots, label) => { const x = strip(seq), hid = new Uint8Array(W * W);
    for (const s of hideSlots) for (let b = 0; b < W; b++) hid[b * W + s] = 1;
    const q = m.read(x, hid), out = [0, 1, 2].map((s) => viewAt(q.recon, s)).join(' → ');
    console.log(`  ${label.padEnd(30)} ${out}   (${q.claims.length} placement${q.claims.length === 1 ? '' : 's'}${q.left.length + q.misses ? `, ${q.left.length + q.misses} px wrong` : ''})`); };
  for (const [a, b] of Wd.held.slice(0, 2)) read([a, null, b], [1], `${a} + ${b} (never happened)`);
  read([Wd.eps[0][0], null, Wd.eps[0][2]], [1], `${Wd.eps[0][0]} + ${Wd.eps[0][2]} (happened)`);
  read(['A', 'J', null], [2], 'A + J (where next?)');
  read(['A', null, null], [1, 2], 'A alone'); }

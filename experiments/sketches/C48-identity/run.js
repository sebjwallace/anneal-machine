// C48 · STEP 1: THE REAL ENGINE LEARNS ITEMS AS WELL AS SHAPES. see.js here is the engine with one change: a point may
// carry what is there (a value). A plain lit pixel is value 1, so pictures behave exactly as before (every engine test:
// identical output). Two points match only if they hold the same value; everything else (moves, prices, rest) is unchanged.
// Test on C42's worlds, where the engine as it is mixed states up: an episode is one row, step = column, the state = the
// value at that step. Learnt the engine's normal way (one picture at a time, rest every 98). Page: 4 x 4 (a chosen size;
// the price of a placement depends on it).
'use strict';
const path = require('path');
const W = 4; globalThis.WORLD_SIZE = W;
const { Model, norm } = require(path.join(__dirname, 'see.js'));
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const N = +(process.env.N || 300);
const names = ['A', 'B', 'C', 'G', 'J', 'P', 'O', 'Q', 'R'], code = Object.fromEntries(names.map((n, i) => [n, i + 2])), nameOf = Object.fromEntries(names.map((n, i) => [i + 2, n]));
const pic = (seq) => { const x = new Uint8Array(W * W); seq.forEach((s, t) => { if (s) x[t] = code[s]; }); return x; };
const show = (u, m) => { const pts = m.exp(u).slice().sort((a, b) => a[1] - b[1] || a[0] - b[0]); return pts.map((p) => `${nameOf[p[2]] || '?'}@${p[0] + 1}`).join(' '); };
const WORLDS = {
  hub: { eps: (() => { const out = []; for (const a of ['A', 'B', 'C', 'G']) for (const b of ['P', 'O', 'Q', 'R']) if (!['A-O', 'B-Q', 'G-P', 'C-R'].includes(a + '-' + b)) out.push([a, 'J', b]); return out; })(), held: [['A', 'O'], ['B', 'Q']] },
  paired: { eps: [['A', 'J', 'P'], ['G', 'J', 'O']], held: [['A', 'O'], ['G', 'P']] } };
for (const [wn, Wd] of Object.entries(WORLDS)) { const m = new Model(), r = rng(48), t0 = Date.now();
  for (let t = 1; t <= N; t++) { m.step(pic(Wd.eps[Math.floor(r() * Wd.eps.length)])); if (t % 98 === 0) m.rest(); } m.rest();
  const live = m.units.filter((u) => !u.loose);
  console.log(`\n${wn.toUpperCase()} (${Wd.eps.length} different walks, ${N} shown) · ${((Date.now() - t0) / 1000).toFixed(1)} s · ${live.length} things (${live.filter((u) => u.kind).length} kinds), ${m.items.length} memories`);
  for (const u of live) console.log(`  ${u.kind ? 'kind ' : ''}#${u.id} layer ${u.layer}: ${u.kind ? m.explainers().filter(([v]) => v.virtual && v.K === u).map(([v]) => show(v, m)).join(' | ') : show(u, m)}`);
  const read = (label, seq, hide) => { const x = pic(seq), hid = new Uint8Array(W * W); for (const t of hide) hid[t] = 1; const q = m.read(x, hid);
    console.log(`  ${label.padEnd(26)} ${[0, 1, 2].map((t) => (q.recon[t] ? nameOf[q.recon[t]] : '·') + (hide.includes(t) && q.recon[t] ? '*' : '')).join(' → ')}   (${q.claims.length} placement${q.claims.length === 1 ? '' : 's'}${q.left.length + q.misses ? `, ${q.left.length + q.misses} wrong` : ''})`); };
  const [a0, , b0] = Wd.eps[0];
  read(`${a0} + ${b0} (happened)`, [a0, null, b0], [1]);
  for (const [a, b] of Wd.held) read(`${a} + ${b} (never happened)`, [a, null, b], [1]);
  read('A + J (where next?)', ['A', 'J', null], [2]); read('A alone', ['A', null, null], [1, 2]); }

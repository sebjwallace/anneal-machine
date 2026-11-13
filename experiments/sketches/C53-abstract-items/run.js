// C53 · THE ABSTRACT REGION LEARNS OVER RECOGNISED THINGS. The engine copy (C48 items + C52 slots) as a region whose
// parts are its incoming items (o.atoms: one part per thing; a walk is remembered as its items placed in time) and whose
// currency counts what can sit at each place (WORLD_VALUES: naming one thing = one of places x things). Same moves and
// prices otherwise. Walks: start → J → end (HUB: every start with every end, two held back; PAIRED: A always to P,
// G always to O). Do assemblies with slots form by energy, and what does recall give?
'use strict';
const path = require('path');
const W = +(process.env.W || 4); globalThis.WORLD_SIZE = W;
const names = ['A', 'B', 'C', 'G', 'J', 'P', 'O', 'Q', 'R', 'S', 'T', 'U', 'D', 'E', 'F'];
globalThis.WORLD_VALUES = names.length;
const { Model } = require(path.join(__dirname, 'see.js'));
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const N = +(process.env.N || 300), code = Object.fromEntries(names.map((n, i) => [n, i + 2])), nameOf = Object.fromEntries(names.map((n, i) => [i + 2, n]));
const pic = (seq) => { const x = new Uint8Array(W * W); seq.forEach((s, t) => { if (s) x[t] = code[s]; }); return x; };
const show = (pts) => pts.slice().sort((a, b) => a[0] - b[0]).map((p) => nameOf[p[2]] || '?').join(' ');
const hub = (S, E, held) => { const out = []; for (const a of S) for (const b of E) if (!held.includes(a + b)) out.push([a, 'J', b]); return out; };
const WORLDS = { 'hub 4 x 4': { eps: hub(['A', 'B', 'C', 'G'], ['P', 'O', 'Q', 'R'], ['AO', 'BQ']), held: [['A', 'O'], ['B', 'Q']] },
  'hub 6 x 6': { eps: hub(['A', 'B', 'C', 'G', 'D', 'E'], ['P', 'O', 'Q', 'R', 'S', 'T'], ['AO', 'BQ']), held: [['A', 'O'], ['B', 'Q']] },
  paired: { eps: [['A', 'J', 'P'], ['G', 'J', 'O']], held: [['A', 'O'], ['G', 'P']] } };
for (const [wn, Wd] of Object.entries(WORLDS)) { const m = new Model('FL', { atoms: true }), r = rng(53), t0 = Date.now();
  for (let t = 1; t <= N; t++) { m.step(pic(Wd.eps[Math.floor(r() * Wd.eps.length)])); if (t % 98 === 0) m.rest(); } m.rest();
  const live = m.units.filter((u) => !u.loose), kinds = live.filter((u) => u.kind), comps = live.filter((u) => u.layer > 1 && !u.kind);
  console.log(`\n${wn.toUpperCase()} (${Wd.eps.length} different walks, ${N} shown) · ${((Date.now() - t0) / 1000).toFixed(1)} s · ${live.filter((u) => u.layer === 1).length} items, ${comps.length} assemblies, ${kinds.length} with slots`);
  for (const c of comps) console.log(`  assembly: ${show(m.exp(c))}`);
  for (const K of kinds) { const fixed = K.place.map((p) => [p.dx, nameOf[m.exp(p.u)[0][2]]]), slots = K.slots.map((sl) => [sl.sx, sl.set.fillers.map((f) => nameOf[m.exp(f.u)[0][2]]).join('/')]);
    console.log(`  with ${K.slots.length} slot${K.slots.length > 1 ? 's' : ''}: ${[...fixed, ...slots].sort((a, b) => a[0] - b[0]).map((z) => z[1]).join(' → ')}`); }
  const read = (label, seq, hide) => { const x = pic(seq), hid = new Uint8Array(W * W); for (const t of hide) hid[t] = 1; const q = m.read(x, hid);
    // and by the completion rule (complete.js): an assembly (or one of its versions) comes back when two or more cues fall
    // inside it, none contradicts it; most cues, then fewest filled; equal best that differ → undecided
    const cues = seq.map((s0, t) => [s0, t]).filter(([s0]) => s0), fits = m.explainers().map(([u]) => { const pts = m.exp(u); return { pts, hits: cues.filter(([s0, t]) => pts.some((p) => p[0] === t && p[2] === code[s0])).length, wrong: cues.filter(([s0, t]) => pts.some((p) => p[0] === t && p[2] !== code[s0])).length }; }).filter((f) => f.hits >= 2 && !f.wrong).sort((a, b) => b.hits - a.hits || a.pts.length - b.pts.length);
    const key = (f) => show(f.pts), comp = !fits.length ? 'nothing' : fits.some((f) => f.hits === fits[0].hits && f.pts.length === fits[0].pts.length && key(f) !== key(fits[0])) ? 'undecided' : [0, 1, 2].map((t) => { const p = fits[0].pts.find((z) => z[0] === t); return p ? nameOf[p[2]] + (hide.includes(t) ? '*' : '') : '·'; }).join(' → ');
    console.log(`  ${label.padEnd(26)} reading: ${[0, 1, 2].map((t) => (q.recon[t] ? nameOf[q.recon[t]] : '·') + (hide.includes(t) && q.recon[t] ? '*' : '')).join(' → ').padEnd(16)} completion: ${comp}`); };
  read(`${Wd.eps[0][0]} + ${Wd.eps[0][2]} (happened)`, [Wd.eps[0][0], null, Wd.eps[0][2]], [1]);
  for (const [a, b] of Wd.held) read(`${a} + ${b} (never happened)`, [a, null, b], [1]);
  read('A + J (where next?)', ['A', 'J', null], [2]); read('A alone', ['A', null, null], [1, 2]); }
